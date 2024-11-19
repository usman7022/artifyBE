const { validationResult } = require('express-validator');
const dotenv = require('dotenv');
dotenv.config();
const factoryHandler = require('./utils-controller');
const HttpError = require('../helpers/http-error');
const Transaction = require('../models/transaction');
const Coupon = require('../models/coupon');
const Store = require('../models/store');

const addTransaction = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const msgs = errors.array().map((error) => `${error.path}: ${error.msg}`);
    return next(new HttpError(msgs, 422));
  }
  const { couponId ,storeId} = req.body;
  let existingCoupon;
  try {
    existingCoupon = await Coupon.findById(couponId);
  } catch (error) {
    console.log(error);
    return next(new HttpError('Error Finding Existing Coupon', 500));
  }
  if (!existingCoupon) {
    return next(new HttpError('No Coupon againt this Id', 500));
  }
  let existingStore;
  try {
    existingStore = await Store.findById(storeId);
  } catch (error) {
    console.log(error);
    return next(new HttpError('Error Finding Existing Store', 500));
  }
  if (!existingStore) {
    return next(new HttpError('No Store againt this Id', 500));
  }
  const newTransaction = new Transaction({
...req.body
  });

  try {
    await newTransaction.save();
  } catch (error) {
    console.log(error);
    return next(new HttpError('Error adding new Transaction', 500));
  }
  res.status(201).json({ message: 'newTransaction added successfully' });
};

const getAllTransaction = factoryHandler.getAll(
  Transaction,
  'couponId storeId'
);
const getOneTransaction = factoryHandler.getOne(Transaction);
const deleteTransaction = factoryHandler.getDeleteOne(Transaction);
const UpdateTransaction = factoryHandler.getUpdateOne(Transaction);

exports.addTransaction = addTransaction;
exports.getAllTransaction = getAllTransaction;
exports.getOneTransaction = getOneTransaction;
exports.deleteTransaction = deleteTransaction;
exports.UpdateTransaction = UpdateTransaction;
