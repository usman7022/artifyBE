const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.ObjectId, 
      ref: 'Store',
    },
    storeId: {
      type: mongoose.Schema.ObjectId, 
      ref: 'Store',
    },
    name: {
      type: String,
    },
    discount: {
      type: String,
    },
    Qty: {
      type: Number,
    },
    isActive: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Coupon', couponSchema);
