const express = require('express');
const { check } = require('express-validator');
const auth = require('../middlewares/auth');
const transactionController = require('../controllers/transaction-controller');
const router = express.Router();

router.post('/addTransaction', [
check('couponId').not().isEmpty(),
check('storeId').not().isEmpty(),
check('itemType').not().isEmpty(),
check('returnedQty').not().isEmpty(),
check('TotalQty').not().isEmpty(),
check('price').not().isEmpty(),
],
transactionController.addTransaction);
router.route('/').get(transactionController.getAllTransaction);
router
  .route('/:id')
  .get(transactionController.getOneTransaction)
  .patch(transactionController.UpdateTransaction)
  .delete(transactionController.deleteTransaction);
module.exports = router;
