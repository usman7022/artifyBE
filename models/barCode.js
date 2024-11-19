const mongoose = require('mongoose');
const barcodeSchema = new mongoose.Schema(
  {
    barcodeURL: String,
    barCodeNumber: String,
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    storeId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Store',
    },
    sessionId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Session',
    },
    discountPrice:Number,
  },
  {
    timestamps: true,
  }
);

const Barcode = mongoose.model('Barcode', barcodeSchema);

module.exports = Barcode;
