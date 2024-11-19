const { validationResult } = require('express-validator');
const dotenv = require('dotenv');
dotenv.config();
const factoryHandler = require('./utils-controller');
const HttpError = require('../helpers/http-error');
const Deal = require('../models/deal');

const addDeal = async (req, res, next) => {
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   const msgs = errors.array().map((error) => `${error.path}: ${error.msg}`);
  //   return next(new HttpError(msgs, 422));
  // }
  const codeNumber = `${Math.floor(100000000 + Math.random() * 900000000)}`;
  const newDeal = new Deal({
    ...req.body,
    couponCode:codeNumber
  });

  try {
    await newDeal.save();
  } catch (error) {
    console.log(error);
    return next(new HttpError('Error adding new Deal', 500));
  }
  res.status(201).json({ message: 'newDeal added successfully' });
};

const getRandomDeals = async (req,res,next)=>{

  let getDeals
  try {
    getDeals = await Deal.aggregate([
      {$sample: { size: 3} }
    ])

  } catch (error) {
    return next(new HttpError('Error adding new Deal', 500));

  }

  res.status(200).json({
    status: 'success',
    results: getDeals.length,   
    data:getDeals
  });

} 
const getAllDeal = factoryHandler.getAll(Deal)
const getOneDeal = factoryHandler.getOne(Deal)
const deleteDeal = factoryHandler.getDeleteOne(Deal)
const UpdateDeal = factoryHandler.getUpdateOne(Deal)


exports.getRandomDeals = getRandomDeals;
exports.addDeal = addDeal;
exports.getAllDeal = getAllDeal;
exports.getOneDeal = getOneDeal;
exports.deleteDeal = deleteDeal;
exports.UpdateDeal = UpdateDeal;