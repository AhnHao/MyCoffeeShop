const express = require('express')
const { body } = require('express-validator')

const adminController = require('../controllers/admin')
const isAuth = require('../middleware/is-auth')

const router = express.Router()

router.get('/add-product', isAuth, adminController.getAddProduct)

router.post(
  '/add-product',
  [
    body('title').isString().isLength({ min: 3 }).trim(),
    body('description').isLength({ min: 6, max: 200 }).trim()
  ],
  isAuth,
  adminController.postAddProduct
)

router.get('/products', isAuth, adminController.getProducts)

router.get('/search', isAuth, adminController.getSearchProducts)

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct)

router.post(
  '/edit-product',
  [
    body('title').isString().isLength({ min: 3 }).trim(),
    body('description').isLength({ min: 6, max: 200 }).trim()
  ],
  isAuth,
  adminController.postEditProduct
)

router.post('/delete-product', isAuth, adminController.postDeleteProduct)

module.exports = router
