const multer = require('multer')
const path = require('path')
const util = require('util')

const upload_path = path.join(__dirname, '../', '/temp_docs_csv/')
const storageConfig = multer.diskStorage({
    destination: (req, file, callback) =>{
        callback(null, upload_path)
    },
    filename: (req, file, callback)=>{
        if(file){
            if(file.mimetype === 'application/vnd.ms-excel' || file.mimetype === 'text/csv')
                callback(null, file.originalname)
            else
                return callback('invalid_type_err', null)
        } else
            return callback('empty_file', null)

    }
})
const uploadMulter = util.promisify(multer({storage: storageConfig}).single("csv_file"))
module.exports = uploadMulter
