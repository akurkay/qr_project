const config = require('./db_config')

const Sequelize = require('sequelize')
const sequelize = new Sequelize(
    config.DB,
    config.USER,
    config.PASSWORD,
    {
        host: config.HOST,
        dialect: config.dialect,
        define: {timestamps: false},
        pool:{
            max: config.pool.max,
            min: config.pool.min,
            acquire: config.pool.acquire,
            idle: config.pool.idle
        }
    }
)

db = {}
db.sequelize = sequelize
db.Sequelize = Sequelize

db.product = require('../models/product_model')(sequelize, Sequelize)
db.fixedAsset = require('../models/fixed_asset_model')(sequelize, Sequelize)

db.document = require('../models/document_model')(sequelize, Sequelize)
db.history = require('../models/history_model')(sequelize, Sequelize)

// db.history.belongsTo(db.document);
db.document.hasMany(db.history, { onDelete: 'CASCADE' })

module.exports = db
