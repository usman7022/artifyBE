const express = require('express');
const { check } = require('express-validator');
const auth = require('../middlewares/auth');
const userController = require('../controllers/user-controller');
const router = express.Router();

router.post(
  '/register',
  [
    // check('role')
    //   .not()
    //   .isEmpty()
    //   .isIn(['user', 'subStoreUser', 'superAdminUser'])
    //   .withMessage('Role can be user, subStoreUser or superAdminUser'),
    check('name').not().isEmpty(),
    check('phone').optional(),
    check('email')
      .optional()
      .isEmail()
      .withMessage('Invalid email format'),
    check('password')
      .not()
      .isEmpty()
      .isLength({ min: 8 })
      .withMessage('Password length must be 8'),
    // check('passwordConfirm')
    //   .not()
    //   .isEmpty()
    //   .withMessage('Please confirm your password')
    //   .custom((value, { req }) => {
    //     if (value !== req.body.password) {
    //       throw new Error('Passwords do not match');
    //     } else {
    //       return true;
    //     }
    //   }),
  ],
  userController.registerUser
);

router.post(
  '/verify-otp',
  [
    check('email')
      .optional()
      .isEmail()
      .withMessage('Invalid email format'),
    check('phone').optional(),
    check('otp').not().isEmpty()],
  userController.userOtpVerify
);

router.post(
  '/forgotpassword',
  [check('email').isEmail().optional()],
  [check('phone').optional()],
  userController.forgotPassword
);
router.post(
  '/registerGuestUser',
  userController.registerGuestUser
);

router.post(
  '/login',
  [check('email').isEmail(), check('password').not().isEmpty()],
  userController.userLogin
);

router.get('/logout/:uid', auth, userController.userLogout);
router.get('/getUserByStatus',
  auth
  , userController.getUserByStatus);

router.patch(
  '/resetpassword',

  [check('email').isEmail().not().isEmpty(), check('newPassword').not().isEmpty()],
  userController.resetPassword
);

router.patch(
  '/updatepassword',
  auth,
  [check('passwordCurrent').not().isEmpty(), check('newPassword').not().isEmpty()],
  userController.updatePassword
);

router
  .route('/')
  .get(userController.getAllUsers)
module.exports = router;
