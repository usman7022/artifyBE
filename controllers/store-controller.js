const dotenv = require('dotenv');
dotenv.config();
const Store = require('../models/store');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const HttpError = require('../helpers/http-error');
const factoryHandler = require('./utils-controller');
const getCoordsOfAddress = require('../helpers/location');
const sendEmail = require('../helpers/email');

const addStore = async (req, res, next) => {
  let existingUser;
  try {
    existingUser = await factoryHandler.getOneResult(User, { _id: req.userId });
  } catch (error) {
    console.log(error);
    return next(new HttpError(error, 500));
  }
  if (!existingUser) {
    return next(new HttpError('no user exist In DB', 404));
  }
  try {
    const token = Math.floor(1000 + Math.random() * 9000).toString();
    let hashedToken;
    try {
      hashedToken = await bcrypt.hash(token, 12);
    } catch (error) {
      console.log(error);
      return next(new HttpError('Error sending invitation', 500));
    }
    let message = '';
    message = `${process.env.SERVER_BASE_URL}/api/store/verify-invitation?token=${hashedToken}&email=${req.body.storeEmail} \n Your Store Temporary Password is ${req.body.password}`;
    try {
      await sendEmail({
        email: req.body.storeEmail,
        subject: 'Store Activation Request token (valid for 10 mint)',
        message: message,
      });
    } catch (error) {
      console.log(error);
      return next(new HttpError('Error sending email', 500));
    }
    let newStore;
    if (req.body.address) {
      try {
        const apicoordinates = await getCoordsOfAddress(req.body.address);
        newStore.location.coordinates = [
          apicoordinates.lng,
          apicoordinates.lat,
        ];
      } catch (error) {
        return next(error);
      }
    }
      let uniqueId = req.body.storeName.slice(0, 2).toUpperCase();
      let generateNUmber = `${Math.floor(10000 + Math.random() * 90000)}`;
      let storeId  = uniqueId + generateNUmber
    newStore = new Store({
      image:req.file?.path,
      storeId:storeId,
      userId:existingUser._id,
      ...req.body,
    });
    await newStore.save();
    res.status(201).json({
      status: 'Success',
      message: 'Store created successfully',
    });
  } catch (error) {
    console.error('Error:', error);
    return next(new HttpError(error.message, 500));
  }
};
const verifyInvitation = async (req, res, next) => {
  const { token, email } = req.query;
  let existingStore;
  try {
    existingStore = await Store.findOne({ storeEmail: email });
  } catch (error) {
    console.log(error);
    return new HttpError('Error fetching user', 500);
  }
  if (!existingStore) {
    return new HttpError('No user found', 404);
  }
  if (existingStore.token !== token) {
    return res.send('ERROR');
  }
  existingStore.isActive = true;
  existingStore.token = undefined;
  await existingStore.save();
  res.status(200).json({
    status: 'Success',
    message: 'Store Active Succeccfully',
  });
};
const updateStore = async (req, res, next) => {
  const {
    userId,
    storeName,
    posCount,
    totalSubStoreCount,
    address,
    isActive,
    itemReturn,
  } = req.body;
  try {
    const { sid } = req.params;
    let existingStore;
    try {
      existingStore = await factoryHandler.getOneById(Store, sid);
    } catch (error) {
      console.log(error);
      return next(new HttpError(error, 500));
    }

    if (!existingStore) {
      return next(new HttpError('No Store Find by this Id', 404));
    }
    let existingUser;
    try {
      if (userId) {
        existingUser = await factoryHandler.getOneById(User, userId);
        if (!existingUser) {
          return next(new HttpError('No User Find by this Id', 404));
        }
        existingStore.userId = existingUser._id;
      }
    } catch (error) {
      console.log(error);
      return next(new HttpError(error, 500));
    }
    if (address) {
      let getcoordinates;
      try {
        getcoordinates = await getCoordsOfAddress(address);
      } catch (error) {
        return next(new HttpError(error, 500));
      }
      existingStore.location.address = address;
      existingStore.location.coordinates[0] = getcoordinates.lng;
      existingStore.location.coordinates[1] = getcoordinates.lng;
    }
    existingStore.storeName = storeName;
    existingStore.posCount = posCount;
    (existingStore.isActive = isActive),
      (existingStore.totalSubStoreCount = totalSubStoreCount),
      (existingStore.itemReturn = itemReturn),
      await existingStore.save();
    res.status(200).json({
      message: 'Your Data Update Successfully',
    });
  } catch (error) {
    return next(new HttpError(error, 500));
  }
};
const updateStorePassword = async (req, res, next) => {
  const { storeEmail, tempPass, password } = req.body;
  let existingStore;
  try {
    existingStore = await factoryHandler.getOneResultPass(Store, {
      storeEmail,
    });
  } catch (error) {
    console.log(error);
    return next(new HttpError(error, 500));
  }
  if (!existingStore) {
    return next(
      new HttpError('No store in Db Please Contact with ADMIN.', 401)
    );
  }
  try {
    if (
      !(await existingStore.isPasswordMatch(tempPass, existingStore.password))
    ) {
      return next(new HttpError('Your current password is wrong.', 401));
    }
  } catch (error) {
    console.log(error);
    return next(new HttpError(error, 500));
  }
  existingStore.password = password;
  try {
    await existingStore.save();
  } catch (error) {
    console.log(error);
    return next(new HttpError(error, 500));
  }

  res.status(200).json({
    status: 'success',
    message: 'Your Password Updated Successfully',
  });
};
const getStoreByCat = async (req, res, next) => {
  const getStore = await Store.find({})
  let storeObj = {};
  if (req.body.categoryName === 'Bottle') {
    storeObj = getStore.map(item => ({
      _id:item._id,
      storeName: item.storeName,
      ownBottlesQty: item.ownBottlesQty,
      ownBottlesPrice: item.ownBottlesPrice,
      otherBottlesQty: item.otherBottlesQty,
      otherBottlesPrice: item.otherBottlesPrice,
    }));
  } else if (req.body.categoryName === 'Bags') {
    storeObj = getStore.map(item => ({
      _id:item._id,
      storeName: item.storeName,
      ownBagsQty: item.ownBagsQty,
      ownBagsPrice: item.ownBagsPrice,
      otherBagsQty: item.otherBagsQty,
      otherBagsPrice: item.otherBagsPrice,
    }));
  }

  res.status(200).json({
    result: storeObj.length,
    status: 'success',
    data: storeObj,
  });
};
const getAllStore = factoryHandler.getAll(Store, 'userId');
const getOneStore = factoryHandler.getOne(Store, 'userId');
const deleteStore = factoryHandler.getDeleteOne(Store);
exports.getAllStore = getAllStore;
exports.addStore = addStore;
exports.getOneStore = getOneStore;
exports.deleteStore = deleteStore;
exports.updateStore = updateStore;
exports.verifyInvitation = verifyInvitation;
exports.updateStorePassword = updateStorePassword;
exports.getStoreByCat = getStoreByCat;



