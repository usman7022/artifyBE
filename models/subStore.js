const mongoose = require('mongoose');

const subStoreSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Store',
    },
    subStoreName: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    contactInfo:{
      type: String,
    },
    tempPassword:{
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SubStore', subStoreSchema);
