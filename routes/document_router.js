 module.exports = app => {
     const documents = require('../controllers/document_controller')
     let router = require('express').Router()

      router.get('/all', documents.findAll)

      router.post('/document', documents.create)

      router.delete('/document=:id', documents.delete)

      router.get('/download=:id', documents.downloadCSV)

     app.use('/api/documents/', router)
 }
