const Product = require('../models/product')

exports.getAddProduct = (req, res) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  })
}

exports.postAddProduct = (req, res) => {
  const title = req.body.title
  const imageUrl = req.body.imageUrl
  const price = req.body.price
  const description = req.body.description
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
      res.redirect('/')
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
        product: product
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
  Product.findOneAndDelete(prodId)
    .then(() => {
      console.log('Removed Product')
      res.redirect('/admin/products')
    })
    .catch(err => {
      console.log(err)
    })
}
