const express = require('express')

const shopController = require('../controllers/shop')

const router = express.Router()

router.get('/', shopController.getIndex)

router.get('/menu', shopController.getMenu)

router.get('/menu/:productId', shopController.getProduct)

module.exports = router
