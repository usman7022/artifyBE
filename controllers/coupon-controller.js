const { validationResult } = require('express-validator');
const dotenv = require('dotenv');
dotenv.config();
const factoryHandler = require('./utils-controller');
const HttpError = require('../helpers/http-error');
const Coupon = require('../models/coupon');

const addCoupon = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const msgs = errors.array().map((error) => `${error.path}: ${error.msg}`);
    return next(new HttpError(msgs, 422));
  }
  const newCoupon = new Coupon({
    ...req.body, 
  });

  try {
    await newCoupon.save();
  } catch (error) {
    console.log(error);
    return next(new HttpError('Error adding new Coupon', 500));
  }
  res.status(201).json({ message: 'newCoupon added successfully' });
};


const getAllCoupon = factoryHandler.getAll(Coupon)
const getOneCoupon = factoryHandler.getOne(Coupon)
const deleteCoupon = factoryHandler.getDeleteOne(Coupon)
const UpdateCoupon = factoryHandler.getUpdateOne(Coupon)


exports.addCoupon = addCoupon;
exports.getAllCoupon = getAllCoupon;
exports.getOneCoupon = getOneCoupon;
exports.deleteCoupon = deleteCoupon;
exports.UpdateCoupon = UpdateCoupon;