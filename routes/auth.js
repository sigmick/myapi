const express = require('express');
const { body } = require('express-validator');

const { isAuth } = require('../middleware');
const { authController } = require('../controllers');
const { User } = require('../models');

const router = express.Router();

router.put(
  '/signup',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject('E-Mail address already exists!');
          }
        });
      })
      .normalizeEmail(),
    body('password').trim().isLength({ min: 5 }),
    body('name').trim().not().isEmpty(),
  ],
  authController.signup
);

router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .normalizeEmail(),
  ],
  authController.login
);

router.get('/username', isAuth, authController.getUserName);
router.get('/profile', isAuth, authController.getUserProfile);

router.patch(
  '/profile',
  [
    body('name').trim().not().isEmpty(),
  ],
  isAuth,
  authController.updateProfile
);

module.exports = router;
