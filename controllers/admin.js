const { validationResult } = require('express-validator')
const Product = require('../models/product')
const fileHelper = require('../util/file')

const ITEMS_PER_PAGE = 8

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
  const image = req.file
  const price = req.body.price
  const description = req.body.description
  const errors = validationResult(req)

  if (!image) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      errorMessage: 'Attached file is not an image.',
      validationErrors: [],
      product: {
        title: title,
        price: price,
        description: description
      }
    })
  }

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
      product: {
        title: title,
        price: price,
        description: description
      }
    })
  }

  const imageUrl = image.path

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
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(err)
    })
}

exports.getProducts = (req, res) => {
  const page = +req.query.page || 1
  let totalItems

  Product.find()
    .countDocuments()
    .then(numProducts => {
      totalItems = numProducts
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
    })
    .then(products => {
      res.render('admin/products', {
        pageTitle: 'Admin Products',
        products: products,
        path: '/admin/products',
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
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(err)
    })
}

exports.postEditProduct = (req, res) => {
  const proId = req.body.productId
  const updatedTitle = req.body.title
  const updatedPrice = req.body.price
  const image = req.file
  const updatedDesc = req.body.description
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
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
      if (image) {
        fileHelper.deleteFile(product.imageUrl)
        product.imageUrl = image.path
      }
      return product.save()
    })
    .then(result => {
      console.log('Updated product')
      res.redirect('/admin/products')
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(err)
    })
}

exports.postDeleteProduct = (req, res) => {
  const prodId = req.body.productId
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return next(new Error('Product not found.'))
      }
      fileHelper.deleteFile(product.imageUrl)
      return Product.findByIdAndDelete(prodId)
    })
    .then(() => {
      console.log('Removed Product')
      res.redirect('/admin/products')
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(err)
    })
    .catch(err => {
      return next(err)
    })
}
