const express = require('express')
const { body } = require('express-validator')
const User = require('../models/user')

const authController = require('../controllers/auth')

const router = express.Router()

router.get('/login', authController.getLogin)

router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail(),
    body('password', 'Please enter a valid password')
      .isLength({ min: 6 })
      .trim()
  ],
  authController.postLogin
)

router.post('/logout', authController.postLogout)

router.get('/signup', authController.getSignup)

router.post(
  '/signup',
  [
    body('username').isString().trim(),
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject(
              'E-Mail exits already, please pick a different one.'
            )
          }
        })
      })
      .normalizeEmail(),
    body('password', 'Please enter a password with at least 6 characters')
        .isLength({min: 6})
        .trim(),
    body('confirmPassword')
      .custom((value, {req}) => {
        if(value !== req.body.password) {
            throw new Error('Passwords have to match!')
        }
        return true
      })
      .trim()
  ],
  authController.postSignup
)

router.get('/reset', authController.getResetPassword)

router.post('/reset', authController.postResetPassword)

router.get('/reset/:token', authController.getNewPassword)

router.post('/new-password', authController.postNewPassword)

module.exports = router
