const User = require('../models/user')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const crypto = require('crypto')
require('dotenv').config()

//mail transport
const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: process.env.MAILTRAP_PORT,
  auth: {
    user: process.env.MAILTRAP_USERNAME,
    pass: process.env.MAILTRAP_PASSWORD
  }
})

exports.getLogin = (req, res) => {
  let message = req.flash('error')
  if (message.length > 0) {
    message = message[0]
  } else {
    message = null
  }
  res.render('auth/login', {
    pageTitle: 'Login',
    path: '/login',
    errorMessage: message
  })
}

exports.postLogin = (req, res) => {
  const email = req.body.email
  const password = req.body.password

  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        req.flash('error', 'Invalid email or password')
        return res.redirect('/login')
      }
      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true
            req.session.user = user
            return req.session.save(err => {
              console.log(err)
              res.redirect('/')
            })
          }
          req.flash('error', 'Invalid email or password')
          res.redirect('/login')
        })
        .catch(err => {
          console.log(err)
          res.redirect('/login')
        })
    })
    .catch(err => console.log(err))
}

exports.getSignup = (req, res) => {
  let message = req.flash('error')
  if (message.length > 0) {
    message = message[0]
  } else {
    message = null
  }
  res.render('auth/signup', {
    pageTitle: 'Sign Up',
    path: '/signup',
    errorMessage: message
  })
}

exports.postSignup = (req, res) => {
  const username = req.body.username
  const email = req.body.email
  const password = req.body.password
  const confirmPassword = req.body.confirmPassword
  User.findOne({ email: email })
    .then(userDoc => {
      if (userDoc) {
        req.flash(
          'error',
          'E-Mail exists already, please pick a different one.'
        )
        return res.redirect('/signup')
      }
      return bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
          const user = new User({
            email: email,
            password: hashedPassword,
            username: username,
            cart: { items: [] }
          })
          return user.save()
        })
        .then(result => {
          res.redirect('/login')
          return transporter.sendMail({
            from: 'anteiku@coffee.com',
            to: email,
            subject: 'Signup succeeded!',
            html: '<h1>You successfully signed up!</h1>'
          })
        })
    })
    .catch(err => console.log(err))
}

exports.postLogout = (req, res) => {
  req.session.destroy(err => {
    console.log(err)
    res.redirect('/')
  })
}

exports.getResetPassword = (req, res) => {
  let message = req.flash('error')
  if (message.length > 0) {
    message = message[0]
  } else {
    message = null
  }
  res.render('auth/reset', {
    pageTitle: 'Reset Password',
    path: '/reset',
    errorMessage: message
  })
}

exports.postResetPassword = (req, res) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err)
      return res.redirect('/reset')
    }
    const token = buffer.toString('hex')
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          req.flash('error', 'No account with that email found.')
          return res.redirect('/reset')
        }
        user.resetToken = token
        user.resetTokenExpiration = Date.now() + 3600000
        return user.save()
      })
      .then(result => {
        res.redirect('/')
        transporter.sendMail({
          from: 'anteiku@coffee.com',
          to: req.body.email,
          subject: 'Password Reset',
          html: `
            <p>You requested a password reset</p>
            <p>click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password</p>
          `
        })
      })
      .catch(err => console.log(err))
  })
}

exports.getNewPassword = (req, res) => {
  const token = req.params.token
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then(user => {
      let message = req.flash('error')
      if (message.length > 0) {
        message = message[0]
      } else {
        message = null
      }
      res.render('auth/new-password', {
        pageTitle: 'Reset Password',
        path: '/new-password',
        errorMessage: message,
        userId: user._id.toString(),
        username: user.username,
        passwordToken: token
      })
    })
    .catch(err => console.log(err))
}

exports.postNewPassword = (req, res) => {
  const newPassword = req.body.password
  const userId = req.body.userId
  const passwordToken = req.body.passwordToken
  let resetUser

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now(0) },
    _id: userId
  })
  .then(user => {
    resetUser = user
    return bcrypt.hash(newPassword, 12)
  })
  .then(hashedPassword => {
    resetUser.password = hashedPassword
    resetUser.resetToken = undefined
    resetUser.resetTokenExpiration = undefined
    return resetUser.save()
  })
  .then(result => {
    return res.redirect('/login')
  })
  .catch(err => console.log(err))
}
