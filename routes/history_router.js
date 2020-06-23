module.exports = app => {
    const documents = require('../controllers/history_controller')
    let router = require('express').Router()
    router.get('/all', documents.findAll)
    app.use('/api/history/', router)
}