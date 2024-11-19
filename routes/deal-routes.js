const express = require('express');
const { check } = require('express-validator');
const auth = require('../middlewares/auth');
const dealController = require('../controllers/deal-controller');
const router = express.Router();

router.post(
  '/addDeal',
  auth,
//   [
//     check('dealName').not().isEmpty(),
//     check('dealType').not().isEmpty(),
//     check('returnQty').not().isEmpty(),
//     check('totalQty').not().isEmpty(),
//     check('redeemPrice').not().isEmpty(),
// ],
dealController.addDeal
);


router.post(
  '/addDeal',
  auth,
dealController.addDeal
);
router.get(
  '/getRandomDeals',
  auth,
dealController.getRandomDeals
);

router
  .route('/')
.get(dealController.getAllDeal)
router
  .route('/:id')
  .get(dealController.getOneDeal)
  .patch(dealController.UpdateDeal)
  .delete(dealController.deleteDeal)
module.exports = router;
