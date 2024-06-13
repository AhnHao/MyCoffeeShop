const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const mongoose = require('mongoose')

const app = express()

app.set('view engine', 'ejs')
app.set('views', 'views')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

mongoose
  .connect('mongodb+srv://hao:Anhhao08MG@cluster0.ud84vso.mongodb.net/Anteiku')
  .then(result => {
    app.listen(3000)
  })
  .catch(err => {
    console.log(err)
  })
