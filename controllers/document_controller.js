const db = require('../db/init_db')
const path = require('path')
const Document = db.document
const History = db.history

const CSVActions = require('../middlewares/csv_actions')

exports.findAll = (req, res) => {
    Document.findAll()
        .then(data=>{
            const docId = data.id
            res.send(data)
        })
        .catch(e=>{
            console.log(e);
        })
}
exports.create = (req, res) => {
    let histories = req.body.history
    if(!histories.length){
        res.status(400).send({
            message: 'нельзя создать пустой документ!'
        })
        return
    }
    Document.count()
        .then(data=>{
            for(let history of histories)
                history = JSON.stringify(history)
            const activeStatus = req.body.active_status
            const date = new Date()
            const title = `№${data+1}_${date.getDate()}.${date.getMonth()+1}.${date.getFullYear()}`
            let filePath = CSVActions.createCSV(histories, title)
            filePath
                .then(path=>{
                    Document.create({
                        title: title,
                        active_status: activeStatus,
                        csv_path: path
                    })
                        .then(doc=>{
                            for(let history of histories){
                                history = JSON.stringify(history)
                                const newHistory = {
                                history_info: history,
                                documentId : doc.id
                            }
                                History.create(newHistory)
                                    .then(data=>{
                                        res.status(200).send(`create history ${data.id} success`)
                                    })
                                    .catch(e=>{
                                        console.log(e);
                                    })
                            }
                            console.log(`doc ${doc.id} success`)
                        }).catch(e=>{
                        console.log(`error with creating doc:` + e);
                    })
                })
                .catch(e=>{
                    console.log(e);
                })
        })
        .catch(e=>{
            console.log(e);
        })
}
exports.delete = (req, res) => {
    let id = req.params.id

    Document.findOne({
        where:{
            id: id
        }
    })
        .then(data=>{
            CSVActions.deleteCSV(path.join(__dirname, data.dataValues.csv_path))
            Document.destroy({
                where:{
                    id: id
                }
            })
                .then(()=>{
                    res.send(`Document  was deleted`)
                })
                .catch(e=>{
                    console.log(e);
                })
        }).catch(e=>{
        console.log(e);
    })
}
exports.downloadCSV = (req, res) => {
    Document.findByPk(req.params.id)
        .then(data=>{
            const pathFile = path.join(__dirname, data.dataValues.csv_path)
            res.download(pathFile)
        })
        .catch(e=>{
            console.log(e);
        })
}
