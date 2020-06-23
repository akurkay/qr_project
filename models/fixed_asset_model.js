module.exports = (sequelize, Sequelize) =>{
    const FixedAsset = sequelize.define('fixed_asset',{
        id:{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        number:{
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        },
        title:{
            type: Sequelize.STRING,
            allowNull: false
        },
        actual_cost:{
            type: Sequelize.DOUBLE,
            allowNull: true
        },
        actual_presence:{
            type: Sequelize.BOOLEAN,
            allowNull: true
        },
        qr_path:{
            type: Sequelize.STRING,
            allowNull: true
        },
    })
    return FixedAsset
}
