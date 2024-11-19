const express = require('express');
const { check } = require('express-validator');
const auth = require('../middlewares/auth');
const barCodeController = require('../controllers/barCode-controller');
const router = express.Router();
const QRCode = require('qrcode');
const fs = require('fs')


router.post(
  '/generateCode',
  auth,
  barCodeController.generateCode
);
router.get(
  '/scanBarCode',
  auth,
  barCodeController.scanCode
);
router.get(
  '/getRedeemSession',
  auth,
  barCodeController.getRedeemSession
);

module.exports = router;
