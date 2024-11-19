const express = require('express');
const { check } = require('express-validator');
const auth = require('../middlewares/auth');
const checkUserRole = require('../middlewares/checkUserRole');
const storeController = require('../controllers/store-controller');
const storeUpload = require('../middlewares/store-upload');

const router = express.Router();

router.post(
  '/addStore',
  auth,
  checkUserRole,
  storeUpload.single('storeImage'),
  [
    check('storeType').not().isEmpty()
      .isIn(['gasStation', 'superMart'])
      .withMessage('storeType can be gasStation, superMart'),
    check('storeName').not().isEmpty(),
    check('storeEmail').not().isEmpty(),
    check('password').not().isEmpty(),
],
  storeController.addStore
);
router.post(
  '/getStoreByCat',
  storeController.getStoreByCat
);
router.get(
  '/verify-invitation',
  storeController.verifyInvitation
);
router.patch(
  '/updateStore/:sid',
  storeController.updateStore
)

router.patch(
  '/updateStorePass/',
  storeController.updateStorePassword
)
router
  .route('/')
  .get(storeController.getAllStore)

router
  .route('/:id')
  .get(storeController.getOneStore)
  .delete(storeController.deleteStore);

module.exports = router;
