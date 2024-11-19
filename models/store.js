const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const storeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    isActive: {
      type: Boolean,
      default:false
    },
    ownBagsPrice:{
      type:Number,
      default:0
    },
    otherBagsPrice:{
      type:Number,
      default:0
    },
    ownBottlesPrice:{
      type:Number,
      default:0
    },
    otherBottlesPrice:{
      type:Number,
      default:0
    },
    maiDubaiBottlesPrice:{
      type:Number,
      default:0
    },
    hasBottles:{
      type:Boolean,
    },
    hasBags:{
      type:Boolean,
    },
    token: {
      type: String,
    },
    address: String,
    location: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
    },
    storeName: {
      type: String,
      required: true,
    },
    storeId: {
      type: String,
      required: true,
    },
    storeEmail:{
      type:String
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false
    },
    storeType:{
      type: String,
      enum: ['gasStation', 'superMart',],
      required: true,
    },
    totalAmount:{
      type:Number
    },
    image:{
      type:String
    },

  },
  {
    timestamps: true,
  }
);

storeSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});
storeSchema.methods.isPasswordMatch = function(password) {
  return bcrypt.compare(password, this.password);
};



module.exports = mongoose.model('Store', storeSchema);
