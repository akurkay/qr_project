const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(cors())

const db = require('./db/init_db')
db.sequelize.sync()

require('./routes/fixed_assets_router')(app)
require('./routes/products_router')(app)
require('./routes/document_router')(app)
require('./routes/history_router')(app)

const port = process.env.PORT || 5000

app.listen(port, function () {
    console.log(`Server listens ${port}`);
})
