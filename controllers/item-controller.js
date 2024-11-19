const { validationResult } = require('express-validator');
const dotenv = require('dotenv');
dotenv.config();
const factoryHandler = require('./utils-controller');
const HttpError = require('../helpers/http-error');
const Item = require('../models/item');

const addItem = async (req, res, next) => {
  // const errors = validationResult(req);
  // // if (!errors.isEmpty()) {
  // //   const msgs = errors.array().map((error) => `${error.path}: ${error.msg}`);
  // //   return next(new HttpError(msgs, 422));
  // // }



  
  const newItem = new Item({
    ...req.body,
  });

  try {
    await newItem.save();
  } catch (error) {
    console.log(error);
    return next(new HttpError('Error adding new Item', 500));
  }
  res.status(201).json({ message: 'newItem added successfully' });
};


const getAllItem = factoryHandler.getAll(Item)
const getOneItem = factoryHandler.getOne(Item)
const deleteItem = factoryHandler.getDeleteOne(Item)
const UpdateItem = factoryHandler.getUpdateOne(Item)


exports.addItem = addItem;
exports.getAllItem = getAllItem;
exports.getOneItem = getOneItem;
exports.deleteItem = deleteItem;
exports.UpdateItem = UpdateItem;