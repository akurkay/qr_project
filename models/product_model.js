module.exports = (sequelize, Sequelize) =>{
    const Product = sequelize.define('product',{
        id:{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        number:{
            type: Sequelize.STRING,
            allowNull: false
        },
        title:{
            type: Sequelize.STRING,
            allowNull: false
        },
        actual_count:{
            type: Sequelize.INTEGER,
            allowNull: true
        },
        count_by_accounting:{
            type: Sequelize.INTEGER,
            allowNull: true
        },
        cost:{
            type: Sequelize.DOUBLE,
            allowNull: true
        },
        retail_cost:{
            type: Sequelize.DOUBLE,
            allowNull: true
        },
        actual_sum:{
            type: Sequelize.DOUBLE,
            allowNull: true
        },
        sum_by_accounting:{
            type: Sequelize.DOUBLE,
            allowNull: true
        }
    })
    return Product
}