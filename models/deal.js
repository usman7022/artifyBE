const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema(
  {
    name :{
      type:String
    },
    vendor: {
      type: String,
    },
    returnQty: {
      type: Number,
    },
    amount: {
      type: Number,
    },
    percentage: {
      type: String,
    },
    description: {
      type: String,
    },
    couponCode: {
        type: String,
      },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('deal', dealSchema);
