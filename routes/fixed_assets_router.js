module.exports = app => {
    const fixedAssets = require('../controllers/fixed_asset_controller')

    let router = require('express').Router()

    router.get('/items', fixedAssets.findAll)

    router.get('/item=:number', fixedAssets.findOne)

    router.post('/item', fixedAssets.create)

    router.delete('/item=:number', fixedAssets.delete)

    router.put('/item=:number', fixedAssets.update)

    router.post('/doc', fixedAssets.createDoc)

    router.get('/result_doc', fixedAssets.getDoc)

    router.post('/upload_file', fixedAssets.uploadFile)

    app.use('/api/fixed_assets', router)
}
