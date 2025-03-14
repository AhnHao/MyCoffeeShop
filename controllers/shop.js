const Product = require('../models/product')
const Order = require('../models/order')
require('dotenv').config()

const stripe = require('stripe')(process.env.SECRET_KEY)

const ITEMS_PER_PAGE = 8

exports.getIndex = (req, res, next) => {
  let successMessage = req.flash('success')
  Product.find()
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Home',
        path: '/',
        successMessage: successMessage.length > 0 ? successMessage[0] : null
      })
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(err)
    })
}

exports.getMenu = (req, res, next) => {
  let errorMessage = req.flash('error')
  const page = +req.query.page || 1
  let totalItems
  const currentUrl = req.protocol + '://' + req.get('host') + req.originalUrl

  Product.find()
    .countDocuments()
    .then(numProducts => {
      totalItems = numProducts
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
    })
    .then(products => {
      res.render('shop/menu', {
        products: products,
        pageTitle: 'Menu',
        path: '/menu',
        errorMessage: errorMessage.length > 0 ? errorMessage[0] : null,
        currentUrl: currentUrl,
        hasPagination: true,
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

exports.getProduct = (req, res, next) => {
  const proId = req.params.productId
  const currentUrl = req.protocol + '://' + req.get('host') + req.originalUrl
  let currentProduct
  Product.findById(proId)
    .then(product => {
      currentProduct = product
      const currentProductId = currentProduct._id
      return Product.aggregate([
        { $match: { _id: { $ne: currentProductId } } },
        { $sample: { size: 4 } }
      ])
    })
    .then(randomProducts => {
      res.render('shop/product-detail', {
        product: currentProduct,
        pageTitle: currentProduct.title,
        path: '/menu',
        currentUrl: currentUrl,
        randomProducts: randomProducts
      })
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(err)
    })
}

//
exports.getSearchProducts = (req, res, next) => {
  const query = req.query.q
  const currentUrl = req.protocol + '://' + req.get('host') + req.originalUrl

  if (!query) {
    req.flash('error', 'Please enter what you want to search for')
    return res.redirect('/menu')
  }

  Product.find({
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } }
    ]
  })
    .then(products => {
      res.render('shop/menu', {
        products: products,
        pageTitle: 'Menu',
        path: '/menu',
        errorMessage: null,
        currentUrl: currentUrl,
        hasPagination: false,
      })
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(err)
    })
}

//

exports.getCart = (req, res, next) => {
  let successMessage = req.flash('success')
  req.user
    .populate('cart.items.productId')
    .then(user => {
      const products = user.cart.items
      res.render('shop/cart', {
        pageTitle: 'Your Cart',
        path: '/cart',
        products: products,
        successMessage: successMessage.length > 0 ? successMessage[0] : null
      })
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(err)
    })
}

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId
  const currentUrl = req.body.currentUrl
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product)
    })
    .then(result => {
      req.session.cartItems = req.user.cart.items.length || []
      res.redirect(currentUrl)
    })
}

exports.postUpdateQuantityProduct = (req, res, next) => {
  const proId = req.body.productId
  const newQuantity = req.body.newQuantity
  req.user
    .updateCartQuantity(proId, newQuantity)
    .then(result => {
      req.flash('success', 'Product quantity updated successfully')
      return res.redirect('/cart')
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(err)
    })
}

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId
  req.user
    .removeFromCart(prodId)
    .then(result => {
      req.flash('success', 'Product removed from cart successfully')
      req.session.cartItems = req.user.cart.items.length || []
      return res.redirect('/cart')
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

exports.getOrder = (req, res, next) => {
  let successMessage = req.flash('success')
  Order.find({ 'user.userId': req.user._id })
    .sort({ createdAt: -1 })
    .then(orders => {
      res.render('shop/orders', {
        pageTitle: 'Your Orders',
        path: '/orders',
        successMessage: successMessage.length > 0 ? successMessage[0] : null,
        orders: orders
      })
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(err)
    })
}

exports.getCheckoutSuccess = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then(user => {
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } }
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
      req.flash('success', 'Congratulations on your successful order!')
      req.session.cartItems = req.user.cart.items.length || []
      return res.redirect('/orders')
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(err)
    })
}
