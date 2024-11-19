const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    couponId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Coupon',
    },
    storeId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Store',
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    itemType: {
      type: String,
    },
    returnedQty: {
      type: String,
    },
    TotalQty: {
      type: String,
    },
    price: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Transaction', transactionSchema);
