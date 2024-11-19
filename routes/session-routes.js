const express = require('express');
const { check } = require('express-validator');
const auth = require('../middlewares/auth');
const sessionController = require('../controllers/session-controller ');
const router = express.Router();
const QRCode = require('qrcode');
const fs = require('fs')


router.post(
  '/addSession',
  auth,
  sessionController.addSession
);
router.post(
  '/getSessionByStatus',
  auth,
  sessionController.getSessionByStatus
);
router.get(
  '/getSessionByUser',
  auth,
  sessionController.getSessionByUser
);
router.post(
  '/getStoreBySessionId',
  auth,
  sessionController.getStoreBySessionId
);
router
  .route('/')
  .get(sessionController.getAllSession)
router
  .route('/:id')
  .get(sessionController.getOneSession)
  .patch(sessionController.UpdateSession)
  .delete(sessionController.deleteSession)
module.exports = router;
