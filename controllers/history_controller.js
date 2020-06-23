const db = require('../db/init_db')
const History = db.history

exports.findAll= (req, res) => {
    History.findAll()
        .then(data=>{
            res.send(data)
        })
        .catch(e=>{
            console.log(e);
        })
}
