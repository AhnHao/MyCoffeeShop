exports.get404 = (req, res) => {
  res.status(404).render('errors/404', {
    pageTitle: 'Page Not Found',
    path: '/404'
  })
}

exports.get500 = (req, res) => {
  res.status(500).render('errors/500', {
    pageTitle: 'Error',
    path: '/500'
  })
}
