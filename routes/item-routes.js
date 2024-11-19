const express = require('express');
const { check } = require('express-validator');
const auth = require('../middlewares/auth');
const itemController = require('../controllers/item-controller');
const categoryUpload = require('../middlewares/category-upload');
const router = express.Router();

router.post(
  '/addItem',
  auth,
  [
    check('itemName').not().isEmpty(),
    check('itemType').not().isEmpty(),
    check('returnQty').not().isEmpty(),
    check('totalQty').not().isEmpty(),
    check('redeemPrice').not().isEmpty(),
],
  itemController.addItem
);
router
  .route('/')
  .get(itemController.getAllItem)
router
  .route('/:id')
  .get(itemController.getOneItem)
  .patch(itemController.UpdateItem)
  .delete(itemController.deleteItem)
module.exports = router;
