const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'subStoreUser', 'superAdminUser' ,'guest'],
      required: true,
      default:'user'
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String
    },
    phone: {
      type: String
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false
    },
    otp: {
      type: String
    },
    otpExpiry: {
      type: Date
    },
    totalScannedItems:{
      type:Number
    },
    status:{
      type:Boolean
    },
    isLocked:{
      type:Boolean,
      default:false
    },
    lockedTime:{
      type:Date,
    },
    unlockedTime:{
      type:Date,
    },
    verified: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

userSchema.methods.isPasswordMatch = function(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.verifyOtp = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};
module.exports = mongoose.model('User', userSchema);
