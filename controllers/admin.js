const { validationResult } = require('express-validator')
const Product = require('../models/product')

exports.getAddProduct = (req, res) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: []
  })
}

exports.postAddProduct = (req, res) => {
  const title = req.body.title
  const imageUrl = req.body.imageUrl
  const price = req.body.price
  const description = req.body.description
  const errors = validationResult(req)

  if(!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
      product: {
        title: title,
        imageUrl: imageUrl,
        price: price,
        description: description
      }
    })
  }

  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user
  })
  product
    .save()
    .then(result => {
      console.log('Created Product')
      res.redirect('/admin/products')
    })
    .catch(err => {
      console.log(err)
    })
}

exports.getProducts = (req, res) => {
  Product.find()
    .then(products => {
      res.render('admin/products', {
        pageTitle: 'Admin Products',
        products: products,
        path: '/admin/products'
      })
    })
    .catch(err => console.log(err))
}

exports.getEditProduct = (req, res) => {
  const editmode = req.query.edit
  if (!editmode) {
    return res.redirect('/')
  }
  const prodId = req.params.productId
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/')
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editmode,
        product: product,
        errorMessage: null,
        validationErrors: []
      })
    })
    .catch(err => console.log(err))
}

exports.postEditProduct = (req, res) => {
  const proId = req.body.productId
  const updatedTitle = req.body.title
  const updatedPrice = req.body.price
  const updatedImageUrl = req.body.imageUrl
  const updatedDesc = req.body.description
  const errors = validationResult(req)

  if(!errors.isEmpty()) {
    return res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: editmode,
      product: {
        _id: proId,
        title: updatedTitle,
        imageUrl: updatedImageUrl,
        price: updatedPrice,
        description: updatedDesc
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    })
  }

  Product.findById(proId)
    .then(product => {
      product.title = updatedTitle
      product.price = updatedPrice
      product.description = updatedDesc
      product.imageUrl = updatedImageUrl
      return product.save()
    })
    .then(result => {
      console.log('Updated product')
      res.redirect('/admin/products')
    })
    .catch(err => {
      console.log(err)
    })
}

exports.postDeleteProduct = (req, res) => {
  const prodId = req.body.productId
  Product.findByIdAndDelete(prodId)
    .then(() => {
      console.log('Removed Product')
      res.redirect('/admin/products')
    })
    .catch(err => {
      console.log(err)
    })
}
