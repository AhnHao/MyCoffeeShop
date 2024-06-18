const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const connectDB = require('./config/database')

const app = express()

app.set('view engine', 'ejs')
app.set('views', 'views')

const shopRoutes = require('./routes/shop')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

app.use(shopRoutes)

connectDB()

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
