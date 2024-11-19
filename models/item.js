const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Store',
    },
    bagQty :{
      type:Number
    },
    botelQty: {
      type: Number,
    },
    total: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Item', itemSchema);


