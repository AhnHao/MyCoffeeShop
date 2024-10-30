const express = require('express')

const shopController = require('../controllers/shop')
const isAuth = require('../middleware/is-auth')

const router = express.Router()

router.get('/', shopController.getIndex)

router.get('/menu', shopController.getMenu)

router.get('/menu/:productId', shopController.getProduct)

router.get('/cart', isAuth, shopController.getCart)

router.post('/cart', isAuth, shopController.postCart)

router.post('/cart-update-quantity', isAuth, shopController.postUpdateQuantityProduct)

router.post('/cart-delete-product', isAuth, shopController.postCartDeleteProduct)

router.get('/checkout', isAuth, shopController.getCheckout)

router.get('/checkout/success', isAuth, shopController.getCheckoutSuccess)

router.get('/checkout/cancel', shopController.getCheckout)

router.get('/orders', isAuth, shopController.getOrder)


module.exports = router
