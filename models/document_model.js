module.exports = (sequelize, Sequelize) =>{
    const Document = sequelize.define('document',{
        id:{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        title:{
            type: Sequelize.STRING,
            allowNull: false
        },
        active_status:{
            type: Sequelize.BOOLEAN,
            allowNull: false
        },
        csv_path:{
            type: Sequelize.STRING,
            allowNull: true
        },
    })
    return Document
}
