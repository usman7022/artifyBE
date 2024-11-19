const express = require('express');
const { check } = require('express-validator');
const auth = require('../middlewares/auth');
const couponController = require('../controllers/coupon-controller');
const router = express.Router();

router.post(
  '/addCoupon',
  auth,
  [
    check('name').not().isEmpty(),
    check('discount').not().isEmpty(),
    check('Qty').not().isEmpty(),
    check('isActive').not().isEmpty(),
],
  couponController.addCoupon
);
router
  .route('/')
  .get(couponController.getAllCoupon)
router
  .route('/:id')
  .get(couponController.getOneCoupon)
  .patch(couponController.UpdateCoupon)
  .delete(couponController.deleteCoupon)
module.exports = router;
