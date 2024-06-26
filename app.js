const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
const flash = require('connect-flash')
const connectDB = require('./config/database')
const PORT = process.env.PORT || 3000

require('dotenv').config()

const User = require('./models/user')
const errorController = require('./controllers/error')

const app = express()
const store = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  collection: 'session'
})

app.set('view engine', 'ejs')
app.set('views', 'views')

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')
const authRoutes = require('./routes/auth')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(session({
  secret: 'my secret',
  resave: false,
  saveUninitialized: false,
  store: store
}))
app.use(flash())

app.use((req, res, next) => {
  if(!req.session.user) {
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
  next()
})

app.use('/admin', adminRoutes)
app.use(shopRoutes)
app.use(authRoutes)

app.use(errorController.get404)

connectDB()

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
