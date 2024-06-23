const Product = require('../models/product')

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
      console.log(err)
    })
}

exports.getMenu = (req, res) => {
    Product.find()
        .then(products => {
            res.render('shop/menu', {
                products: products,
                pageTitle: 'Menu',
                path: '/menu'
            })
        })
        .catch(err => {
            console.log(err)
        })
}

exports.getProduct = (req, res) => {
  const proId = req.params.productId
  Product.findById(proId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/product-detail'
      })
    })
    .catch(err => {
      console.log(err)
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
      .catch(err => console.log(err))
}

exports.postCart = (req, res) => {
  const prodId = req.body.productId
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product)
    })
    .then(result => {
      console.log(result)
      res.redirect('/cart')
    })
}

exports.postCartDeleteProduct = (req, res) => {
  const prodId = req.body.productId
  req.user  
    .removeFromCart(prodId)
    .then((result) => {
      console.log(result)
      res.redirect('/cart')
    })
    .catch(err => console.log(err))
}

exports.getOrder = (req, res) => {
  
}