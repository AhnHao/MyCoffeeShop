const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
const flash = require('connect-flash')
const connectDB = require('./config/database')
const multer = require('multer')

require('dotenv').config()

const PORT = process.env.PORT || 3000

const User = require('./models/user')
const errorController = require('./controllers/error')

const app = express()
const store = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  collection: 'session'
})

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/product-images')
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + '-' + Date.now() + path.extname(file.originalname)
    )
  }
})

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|jfif/
  const mimetype = filetypes.test(file.mimetype)
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase())

  if (mimetype && extname) {
    return cb(null, true)
  } else {
    cb('Error: image is wrong format')
  }
}

app.set('view engine', 'ejs')
app.set('views', 'views')

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')
const authRoutes = require('./routes/auth')

app.use(bodyParser.urlencoded({ extended: false }))
app.use('/public', express.static(path.join(__dirname, 'public')))
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
)
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
  })
)
app.use(flash())

app.use((req, res, next) => {
  if (!req.session.user) {
    return next()
  }
  User.findById(req.session.user._id)
    .then(user => {
      req.user = user
      next()
    })
    .catch(err => console.log(err))
})

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn
  res.locals.isAdmin = req.session.isAdmin
  res.locals.cartItemsQty = req.session.cartItems
  next()
})

app.use('/admin', adminRoutes)
app.use(shopRoutes)
app.use(authRoutes)

app.use('/500', errorController.get500)
app.use(errorController.get404)

app.use((error, req, res, next) => {
  res.status(500).render('errors/500', {
    pageTitle: 'Error',
    path: '/500'
  })
})

connectDB()

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
