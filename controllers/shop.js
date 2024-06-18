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
        path: '/menu'
      })
    })
    .catch(err => {
      console.log(err)
    })
}
