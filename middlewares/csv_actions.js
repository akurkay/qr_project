const csv = require('csv-writer')
const path = require('path')
const fs = require('fs')
const parser = require('papaparse')

exports.createCSV = (histories, title) => {
    const filePath = `../csv_files/${title}.csv`
    histories = histories.map(el=>{
        return {
            title: el.title,
            number: el.number,
            actual_cost: el.actual_cost,
            actual_presence: el.actual_presence
        }
    })
    let csvWriter = csv.createObjectCsvWriter({
        path: path.join(`${__dirname}`, filePath),
        header : [
            {id: 'title', title: 'title'},
            {id: 'number', title: 'number'},
            {id: 'actual_cost', title: 'actual_cost'},
            {id: 'actual_presence', title: 'actual_presence'},
        ]
    })
    return new Promise((resolve, reject) => {
        csvWriter.writeRecords(histories)
            .then(()=>{
                resolve(filePath)
            })
            .catch(()=>{
                reject('error with creating csv!')
            })
    })
}

exports.deleteCSV = (path) =>{
    fs.unlink(path, e=>{
        if (e)
            console.log(e)
    })
}

exports.parseCSV = (path) => {
    parser.parse(path, {
        complete: (res)=>{
            console.log(res);
        }
    })
}
