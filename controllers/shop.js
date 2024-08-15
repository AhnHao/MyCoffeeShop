const Product = require('../models/product')
const Order = require('../models/order')
require('dotenv').config()

const stripe = require('stripe')(process.env.SECRET_KEY)

const ITEMS_PER_PAGE = 8

exports.getIndex = (req, res) => {
  Product.find()
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Home',
        path: '/'
      })
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(err)
    })
}

exports.getMenu = (req, res) => {
  const page = +req.query.page || 1
  let totalItems
  const currentUrl = req.protocol + '://' + req.get('host') + req.originalUrl

  Product.find()
    .countDocuments()
    .then(numProducts => {
      totalItems = numProducts
      return Product.find()
        .skip((page-1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
    })
    .then(products => {
      res.render('shop/menu', {
        products: products,
        pageTitle: 'Menu',
        path: '/menu',
        currentUrl: currentUrl,
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      })
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(err)
    })
}

exports.getProduct = (req, res) => {
  const proId = req.params.productId
  const currentUrl = req.protocol + '://' + req.get('host') + req.originalUrl
  Product.findById(proId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/product-detail',
        currentUrl: currentUrl
      })
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(err)
    })
}

exports.getCart = (req, res) => {
  req.user
    .populate('cart.items.productId')
    .then(user => {
      const products = user.cart.items
      res.render('shop/cart', {
        pageTitle: 'Your Cart',
        path: '/cart',
        products: products
      })
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(err)
    })
}

exports.postCart = (req, res) => {
  const prodId = req.body.productId
  const currentUrl = req.body.currentUrl
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product)
    })
    .then(result => {
      console.log(currentUrl)
      res.redirect(currentUrl)
    })
}

exports.postCartDeleteProduct = (req, res) => {
  const prodId = req.body.productId
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect('/cart')
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(err)
    })
}

exports.getCheckout = (req, res, next) => {
  let products
  let total = 0

  req.user
    .populate('cart.items.productId')
    .then(user => {
      products = user.cart.items
      total = 0
      products.forEach(p => {
        total += p.quantity * p.productId.price
      })

      return stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: products.map(p => {
          return {
            quantity: p.quantity,
            price_data: {
              currency: 'vnd',
              unit_amount: p.productId.price,
              product_data: {
                name: p.productId.title,
                description: p.productId.description
              }
            }
          }
        }),
        customer_email: req.user.email,
        success_url: req.protocol + '://' + req.get('host') + '/checkout/success',
        cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel'
      })
    })
    .then(session => {
      res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',
        products: products,
        totalSum: total,
        sessionId: session.id
      })
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(err)
    })
}

exports.getOrder = (req, res) => {
  Order.find({ 'user.userId': req.user._id })
    .then(orders => {
      res.render('shop/orders', {
        pageTitle: 'Your Orders',
        path: '/orders',
        orders: orders
      })
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(err)
    })
}

exports.getCheckoutSuccess = (req, res) => {
  req.user
    .populate('cart.items.productId')
    .then(user => {
      const products = user.cart.items.map(i => {
        return {quantity: i.quantity, product: {...i.productId._doc}}
      })
      const order = new Order({
        products: products,
        user: {
          username: req.user.username,
          userId: req.user
        }
      })
      return order.save()
    })
    .then(result => {
      return req.user.cleanCart()
    })
    .then(() => {
      res.redirect('/orders')
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(err)
    })
}