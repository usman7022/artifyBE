const express = require('express');
const { check } = require('express-validator');
const auth = require('../middlewares/auth');
const categoryController = require('../controllers/category-controller');
const categoryUpload = require('../middlewares/category-upload');
const router = express.Router();

router.post(
  '/addCategory',
  auth,
  categoryUpload.any('categoryIcon'),
  [check('name').not().isEmpty()],
  categoryController.addCategory
);

router
  .route('/')
  .get(categoryController.getAllCategory)
router
  .route('/:id')
  .get(categoryController.getOneCategory)
  .patch(categoryController.UpdateCategory)
  .delete(categoryController.deleteCategory)
module.exports = router;
