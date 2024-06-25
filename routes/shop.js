const express = require('express')

const shopController = require('../controllers/shop')

const router = express.Router()

router.get('/', shopController.getIndex)

router.get('/menu', shopController.getMenu)

router.get('/menu/:productId', shopController.getProduct)

router.get('/cart', shopController.getCart)

router.post('/cart', shopController.postCart)

router.post('/cart-delete-product', shopController.postCartDeleteProduct)

router.get('/orders', shopController.getOrder)

router.post('/create-order', shopController.postOrder)

module.exports = router
