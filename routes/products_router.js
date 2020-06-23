module.exports = app => {
    const products = require('../controllers/product_controller')
    let router = require('express').Router()

    router.get('/', products.findAll)

    router.get('/:id', products.findOne)

    router.post('/', products.create)

    router.delete('/:id', products.delete)

    router.put('/:id', products.update)

    app.use('/api/products', router)
}