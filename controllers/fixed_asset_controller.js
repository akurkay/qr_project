const db = require('../db/init_db')
const FixedAsset = db.fixedAsset
const qrActions = require('../middlewares/qr_actions')
const upload = require('../middlewares/upload')
const csv = require('../middlewares/csv_actions')

const docx = require('docx')
const fs = require('fs')

const { Document, Media, Packer, Paragraph, Table, TableCell, TableRow } = docx

exports.findAll= (req, res) => {
    FixedAsset.findAll({raw: true})
        .then(data => {
            res.send(data);
        })
        .catch(e => {
            res.status(500).send({
                message:
                    'Ошибка с выводом основных средств!'
            })
            console.log(e);
        })
}

exports.findOne = (req, res) => {
    const number = req.params.number.replace(/[_]/,'/')

    FixedAsset.findOne({where: {
                number: number
            }
    })
        .then(data => {
            res.send(data)
        })
        .catch(e => {
            res.status(500).send({
                message: `Error with retrieving ${number}  fixed asset: ` + e.message
            })
        })
}

exports.create = (req, res) =>{
    let number = req.body.number
    const title = req.body.title
    const actual_cost = req.body.actual_cost

    if(!number || !title || !actual_cost){
        res.status(400).send({
            message: 'нельзя оставлять все поля пустыми!'
        })
        return
    }

    if(!number.match(/^\d{1,3}[/]\d{1,3}$/)){
        res.status(400).send({
            message: 'некорретный номер!'
        })
        return
    }

    qrActions.createQR(number)
        .then(path=>{
            const newFixedAsset = {
                        number: number,
                        title: title,
                        actual_cost: actual_cost,
                        actual_presence: req.body.actual_presence,
                        qr_path: path
                    }

                    FixedAsset.create(newFixedAsset)
                        .then(data=>{
                            res.send(`Основное средство под номером ${data.number} было создано`)
                            console.log(`Fixed asset with number ${data.number} was created`)
                        })
                        .catch(e=>{
                            if(e.name === 'SequelizeUniqueConstraintError')
                                res.status(400).send({
                                    message: 'Основное средство с таким номером уже имеется в базе данных!'
                                })
                            else
                                res.status(500).send({
                                    message:'Ошибка при создании основного средства'
                                })
                            console.log(e);
                        })

    })
        .catch(()=>{
            console.log(`Error path!`);
        })
}

exports.delete = (req, res) => {
    let number = req.params.number
    number = number.replace(/[_]/,'/')
    FixedAsset.findOne({
        where:{
            number: number
        }
    })
        .then(data=>{
            qrActions.deleteQR(data.dataValues.qr_path)
            FixedAsset.destroy({
                where: {
                    number: number
                }
            })
                .then(() => {
                    res.send(`Основное средство под номером ${number} было удаленно!`)
                })
                    .catch(e => {
                        res.status(500).send(`Ошибка при попытке удаления основного средства под номером ${number}!`)
                    })
        })
        .catch(e => {
            console.log(e)
        })
}

exports.update = (req, res) => {
    const number = req.params.number.replace(/_/,'/')
    const body = req.body

    FixedAsset.update(req.body, {
        where: {number: number}
    })
        .then(() => {
            res.send(`Основное средство под номером ${number} было обновлено!`)
        })
        .catch(e => {
            res.status(500).send({
                message: `Ошибка обновление основного средства с номером ${number}`
            })
            console.log(e);
        })
}

exports.createDoc = (req, res) =>{
    const doc = new Document()
    FixedAsset.findAll({where:{number: req.body}})
        .then(data=>{
            let cells = []
            let rows = []
            let tmp = []
            for(let i = 0, j = data.length; i < j; i += 6){
                tmp.push(data.slice(i, i + 6))
            }
            for(let i = 0; i < tmp.length; i++){
                cells.length = 0
                for(let j = 0; j < tmp[i].length; j++){
                    let image = Media.addImage(doc, fs.readFileSync(tmp[i][j].dataValues.qr_path))
                    cells.push(new TableCell({
                        children: [
                            new Paragraph(`${tmp[i][j].dataValues.number}`),
                            new Paragraph(image)
                        ]
                    }))
                }
                rows.push(new TableRow({
                    children: cells
                }))
            }
            const table = new Table({
                rows: rows
            })
            doc.addSection({
                children:[table]
            })
            Packer.toBuffer(doc).then(buffer=>{
                fs.writeFileSync('./temp_docs_csv/result.docx', buffer)
                res.status(200).send(true)
            })
    })
}

exports.getDoc = (req, res) => {
    res.download('./temp_docs_csv/result.docx')
}

exports.uploadFile = async (req, res) =>{
    try{
        await upload(req, res)
        csv.parseCSV(req.file.path)
        // return res.send('success')
    } catch (e) {
        switch (e) {
            case 'empty_file':
            case 'invalid_type_file':
                res.send(e)
                break
            default:
                res.send('unknown_error')
        }
        console.log(e);
    }
}
