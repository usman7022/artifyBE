const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    
    total:Number,
    status:{
        type: String,
        default:'pending'
    },
    itemIds: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Item',
      },
    ]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Session', sessionSchema);
