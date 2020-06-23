module.exports = (sequelize, Sequelize) =>{
    const History = sequelize.define('history',{
        id:{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        history_info:{
            type: Sequelize.TEXT,
            allowNull:true
        }
    })
    return History
}