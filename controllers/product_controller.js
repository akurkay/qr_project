const db = require('../db/init_db')
const Product = db.product
const Op = db.Sequelize.Op

exports.findAll= (req, res) => {
    Product.findAll({raw: true})
        .then(data => {
            res.send(data);
        })
        .catch(e => {
            res.status(500).send({
                message:
                    'Error with retrieving all product: ' + e.message
            })
        })
}

exports.create = (req, res) =>{
    if(!req.body.title){
        res.status(400).send({
            message: "Content can not be empty!"
        })
        return
    }

    const newProduct = {
        number: req.body.number,
        title: req.body.title,
        actual_count: req.body.actual_count,
        count_by_accounting: req.body.count_by_accounting,
        cost: req.body.cost,
        retail_cost: req.body.retail_cost,
        actual_sum: req.body.actual_sum,
        sum_by_accounting: req.body.sum_by_accounting
    }

    Product.create(newProduct)
        .then(data => {
            res.send(data);
        })
        .catch(e => {
            res.status(500).send({
                message:
                    `Error with creating ${id} id product: ` + e.message
            })
        })
}

exports.findOne = (req, res) => {
    const id = req.params.id

    Product.findByPk(id)
        .then(data => {
            res.send(data)
        })
        .catch(e => {
            res.status(500).send({
                message: `Error with retrieving ${id} id product: ` + e.message
            })
        })
}

exports.delete = (req, res) => {
    const id = req.params.id

    Product.destroy({
        where: {id: id}
    })
        .then(() => {
            res.send({
                message: `Product with ${id} id was deleted`
            })
        })
        .catch(e => {
            res.status(500).send({
                message: `Error with deleting ${id} id product: ` + e.message
            })
        })
}

exports.update = (req, res) => {
    const id = req.params.id

    Product.update(req.body, {
        where: {id: id}
    })
        .then(() => {
            res.send({
                message: `Product with ${id} id was updated`
            })
        })
        .catch(e => {
            res.status(500).send({
                message: `Error with updating ${id} id product: ` + e.message
            })
        })
}