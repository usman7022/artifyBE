const { validationResult } = require('express-validator');
const dotenv = require('dotenv');
dotenv.config();
const factoryHandler = require('./utils-controller');

const HttpError = require('../helpers/http-error');
const Category = require('../models/category');

const addCategory = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const msgs = errors.array().map((error) => `${error.path}: ${error.msg}`);
    return next(new HttpError(msgs, 422));
  }

  const imagesPath = req?.files.map((img) => img.path);
  const newCategory = new Category({
    ...req.body,
    categoryIcon: imagesPath ? imagesPath[0] : null,
  });

  try {
    await newCategory.save();
  } catch (error) {
    console.log(error);
    return next(new HttpError('Error adding new Category', 500));
  }
  res.status(201).json({ message: 'Category added successfully' });
};


const getAllCategory = factoryHandler.getAll(Category)
const getOneCategory = factoryHandler.getOne(Category)
const deleteCategory = factoryHandler.getDeleteOne(Category)
const UpdateCategory = factoryHandler.getUpdateOne(Category)


exports.addCategory = addCategory;
exports.getAllCategory = getAllCategory;
exports.getOneCategory = getOneCategory;
exports.deleteCategory = deleteCategory;
exports.UpdateCategory = UpdateCategory;