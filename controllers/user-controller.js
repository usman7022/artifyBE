const { validationResult } = require('express-validator');
const dotenv = require('dotenv');
dotenv.config();
const User = require('../models/user');
const HttpError = require('../helpers/http-error');
const generateOtp = require('../helpers/generateOtp');
const sendEmail = require('../helpers/email');
const factoryHandler = require('./utils-controller');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { default: mongoose } = require('mongoose');
const { format } = require('morgan');
const accountSid = process.env.twilioAccountSid;
const authToken = process.env.twilioAuthToken;
const moment = require('moment')
const client = require('twilio')(accountSid, authToken);

const registerUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const msgs = errors.array().map((error) => `${error.path}: ${error.msg}`);
    return next(new HttpError(msgs, 422));
  }
  const { email, phone } = req.body;
  if (email) {
    let existingUser;
    try {
      existingUser = await factoryHandler.getOneResult(User, { email });
    } catch (error) {
      console.log(error);
      return next(new HttpError(error, 500));
    }
    if (existingUser) {
      return next(new HttpError('Email already registered', 401));
    }
  }
  if (phone) {
    let existingPhone;
    try {
      existingPhone = await factoryHandler.getOneResult(User, { phone });
    } catch (error) {
      console.log(error);
      return next(new HttpError(error, 500));
    }
    if (existingPhone) {
      return next(new HttpError('Phone already registered', 401));
    }
  }
  const otpDetails = await generateOtp();
  const newUser = new User({
    ...req.body,
    otp: otpDetails.otpHash,
    otpExpiry: otpDetails.otpExpiry,
  });
  if (email) {
    try {
      await sendEmail({
        email: email,
        subject: 'Your Verify Account otp (valid for 10 mint)',
        message: `Your account OTP code is: ${otpDetails.rawOtp}`,
      });
    }
    catch (error) {
      console.log(error);
      return next(new HttpError('Error sending email', 500));
    }
  }
  if (phone) {
    try {
      client.messages
        .create({
          body: `Your account OTP code is: ${otpDetails.rawOtp}\n (valid for 10 mint)`,
          from: '+17173638972',
          to: phone
        })
        .then(message => console.log(message.sid));
    } catch (error) {
      console.log(error);
      return next(new HttpError('Error sending message', 500));
    }

  }

  try {
    newUser.save({ validateBeforeSave: false });
  } catch (error) {
    console.log({ error });
    return next(new HttpError('Error creating new user', 500));
  }
  let token;
  try {
    token = jwt.sign(
      { userId: newUser.id, email: email, role: newUser.role },
      process.env.JWT_KEY,
      { expiresIn: process.env.JWT_EXPRISE_IN }
    );
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      'Logging in failed, please try again later.',
      500
    );
    return next(error);
  }

  res
    .cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    })
    .status(201)
    .json({ message: 'User registered successfully, verify your account' });
};
const userOtpVerify = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const msgs = errors.array().map((error) => `${error.path}: ${error.msg}`);
    return next(new HttpError(msgs, 422));
  }
  const { email, otp, phone } = req.body;
  let existingUser
  if (email) {
    try {
      existingUser = await factoryHandler.getOneResult(User, { email });
    } catch (error) {
      console.log(error);
      return next(new HttpError(error, 500));
    }
    if (!existingUser) {
      return next(new HttpError('Invalid email', 404));
    }
  }

  if (phone) {
    try {
      existingUser = await factoryHandler.getOneResult(User, { phone });
    } catch (error) {
      console.log(error);
      return next(new HttpError(error, 500));
    }
    if (!existingUser) {
      return next(new HttpError('Invalid phone', 404));
    }
  }
  if (!(await existingUser.verifyOtp(otp, existingUser.otp))) {
    return next(new HttpError('Incorrect OTP', 422));
  }
  if (existingUser.otpExpiry < Date.now()) {
    return next(new HttpError('OTP expired', 422));
  }
  existingUser.verified = true;
  existingUser.otp = undefined;
  existingUser.otpExpiry = undefined;
  try {
    await existingUser.save({ validateBeforeSave: false });
  } catch (error) {
    console.log({ error });
    return next(new HttpError('Error verifying user', 500));
  }
  res.json({ message: 'OTP verification successful' });
};
const userLogin = async (req, res, next) => {
  const { phone, email, password } = req.body;
  let existingUser;
  if (email) {
    try {
      existingUser = await factoryHandler.getOneResultPass(User, {
        email: email,
      });
    } catch (err) {
      const error = new HttpError(
        'Logging in failed, please try again later.',
        500
      );
      return next(error);
    }
    if (!existingUser) {
      const error = new HttpError('Invalid email!', 404);
      return next(error);
    }
  }
  if (phone) {
    try {
      existingUser = await factoryHandler.getOneResultPass(User, {
        phone: phone,
      });
    } catch (err) {
      const error = new HttpError(
        'Logging in failed, please try again later.',
        500
      );
      return next(error);
    }
    if (!existingUser) {
      const error = new HttpError('Invalid phone!', 404);
      return next(error);
    }
  }
  if (!existingUser.verified) {
    return next(new HttpError('Your account is not verified', 401));
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      'Could not log you in, please check your credentials and try again.',
      401
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError('Invalid password!', 401);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      {
        userId: existingUser.id,
        email: existingUser.email,
        role: existingUser.role,
      },
      process.env.JWT_KEY,
      { expiresIn: process.env.JWT_EXPRISE_IN }
    );
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      'Logging in failed, please try again later.',
      500
    );
    return next(error);
  }

  res
    .cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    })
    .status(200)
    .json({
      user: {
        id: existingUser.id,
        email: existingUser.email,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        active: existingUser.active,
        role: existingUser.role,
        verified: existingUser.verified,
      },
    });
};
const userLogout = async (req, res, next) => {
  const uid = req.params.uid;

  if (req.userId !== uid) {
    return next(new HttpError('Authentication failed', 401));
  }

  res
    .clearCookie('access_token')
    .status(200)
    .json({ message: 'User logout successful' });
};
const forgotPassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const msgs = errors.array().map((error) => `${error.path}: ${error.msg}`);
    return next(new HttpError(msgs, 422));
  }
  const { email ,phone} = req.body;
  let existingUser;
  if(email){
    try {
      existingUser = await factoryHandler.getOneResult(User, { email });
    } catch (error) {
      console.log(error);
      return next(new HttpError(error, 500));
    }
  
    if (!existingUser) {
      return next(new HttpError('No Email registered in DB', 401));
    }
  }
  if(phone){
    try {
      existingUser = await factoryHandler.getOneResult(User, { phone });
    } catch (error) {
      console.log(error);
      return next(new HttpError(error, 500));
    }
  
    if (!existingUser) {
      return next(new HttpError('No Email registered in DB', 401));
    }
  }
 
  const otpDetails = await generateOtp();
  await existingUser.save({ validateBeforeSave: false });
  if(email){
    try {
      await sendEmail({
        email: existingUser.email,
        subject: 'Your reset Password otp (valid for 10 mint)',
        message: `Your reset Password otp code is: ${otpDetails.rawOtp}`,
      });
      res.status(200).json({
        status: 'success',
        message: 'ResetPassword OTP send to your email',
      });
    } catch (err) {
      existingUser.otp = undefined;
      existingUser.otpExpiry = undefined;
      await existingUser.save({ validateBeforeSave: false });
      return new HttpError('somting wrong to send email ', 500);
    }
  }
  if(phone){
    try {
      client.messages
      .create({
         body: `Your account OTP code is: ${otpDetails.rawOtp}\n (valid for 10 mint)`,
         from: '+17173638972',
         to: phone
       })
      .then(message => console.log(message.sid));
    } catch (error) {
      console.log(error);
      return next(new HttpError('Error sending message', 500));
    }
  }
  res.status(200).json({
    status: 'success',
    message: email?'ResetPassword OTP send to your email':'ResetPassword OTP send to your phone'
  });
};
const resetPassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const msgs = errors.array().map((error) => `${error.path}: ${error.msg}`);
    return next(new HttpError(msgs, 422));
  }
  const { email, newPassword } = req.body;
  let existingUser;
  try {
    existingUser = await factoryHandler.getOneResult(User, { email });
  } catch (error) {
    console.log(error);
    return next(new HttpError(error, 500));
  }

  if (!existingUser) {
    return next(new HttpError('No User registered in DB', 404));
  }
  existingUser.password = newPassword;
  await existingUser.save();
  let token;
  try {
    token = jwt.sign(
      {
        userId: existingUser.id,
        email: existingUser.email,
        role: existingUser.role,
      },
      process.env.JWT_KEY,
      { expiresIn: process.env.JWT_EXPRISE_IN }
    );
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      'Logging in failed, please try again later.',
      500
    );
    return next(error);
  }
  res
    .cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    })
    .status(200).json({
      status: 'success',
      message: 'Your Password Reset Successfully',
      user: existingUser
    })
};
const updatePassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const msgs = errors.array().map((error) => `${error.path}: ${error.msg}`);
    return next(new HttpError(msgs, 422));
  }
  const { passwordCurrent, newPassword } = req.body;
  let existingUser;
  try {
    existingUser = await factoryHandler.getOneResultPass(User, { _id: req.userId })
  } catch (error) {
    console.log(error);
    return next(new HttpError(error, 500));
  }
  if (!(await existingUser.isPasswordMatch(passwordCurrent, existingUser.password))) {
    return next(new HttpError('Your current password is wrong.', 401));
  }
  existingUser.password = newPassword
  await existingUser.save();
  let token;
  try {
    token = jwt.sign(
      {
        userId: existingUser.id,
        email: existingUser.email,
        role: existingUser.role,
      },
      process.env.JWT_KEY,
      { expiresIn: process.env.JWT_EXPRISE_IN }
    );
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      'Logging in failed, please try again later.',
      500
    );
    return next(error);
  }
  res
    .cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    })
    .status(200).json({
      status: 'success',
      message: 'Your Password Updated Successfully',
    })

}
const registerGuestUser = async (req, res, next) => {
  const userId = new mongoose.Types.ObjectId();
  const name = 'guest_' + userId;
  let guestUser = new User({
    name: name,
    email: 'guest@dummy.com',
    password: 'guest@123',
    verified: true,
    phone: '1234567890',
    role: 'guest'
  });

  try {
    await guestUser.save();
  } catch (error) {
    console.log(error);
    return next(new HttpError('Error creating new user', 500));
  }

  let token;
  try {
    token = jwt.sign(
      { userId: guestUser.id, email: guestUser.email, role: guestUser.role },
      process.env.JWT_KEY,
      { expiresIn: process.env.JWT_EXPRISE_IN }
    );
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      'Logging in failed, please try again later.',
      500
    );
    return next(error);
  }

  res
    .cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    })
    .status(201)
    .json({ data: guestUser });

}

const getUserByStatus = async (req,res,next)=>{
  console.log(req.userId)
const getUser = await User.find({_id:req.userId})
const userObj = getUser.map(getUser=>{
  return{
    name:getUser.name,
    email:getUser.email,
    isLocked:getUser.isLocked,
    verified:getUser.verified,
    lockedTime:moment( getUser.lockedTime).format('DD MMM YYYY HH:mm:ss'),
    unlockedTime:moment( getUser.unlockedTime).format('DD MMM YYYY HH:mm:ss')
  }
})

  console.log(userObj)
  res.status(200).json({
    status: 'success',
    results: getUser.length,   
    data:userObj,

  });


}
const getAllUsers = factoryHandler.getAll(User)
exports.registerUser = registerUser;
exports.getUserByStatus = getUserByStatus;
exports.forgotPassword = forgotPassword;
exports.userOtpVerify = userOtpVerify;
exports.userLogin = userLogin;
exports.userLogout = userLogout;
exports.resetPassword = resetPassword;
exports.updatePassword = updatePassword;
exports.getAllUsers = getAllUsers;
exports.registerGuestUser = registerGuestUser;
