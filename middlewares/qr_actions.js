const qrCode = require('qrcode')
const fs = require('fs')

exports.createQR = (number) => {
    const newNumber = number.replace(/[/]/,'_')
    function checkLength(){
        return new Promise((resolve, reject) =>{
            fs.readdir('./qr_codes',(e, files)=>{
                if (e)
                    console.log(e);
                files.length ? resolve() : reject('./qr_codes/1')
            })
        })
    }

    const createQRImage = () =>{
        return new Promise((resolve)=>{
            checkLength()
                .then(()=>{
                    fs.readdir('./qr_codes/',(e, folders)=>{
                        if (e)
                            console.log(e);
                        for(let folder of folders){
                            fs.readdir(`./qr_codes/${folder}`, (e, files)=>{
                                if(e)
                                    console.log(e);
                                if(files.length > 4){
                                    fs.mkdir(`./qr_codes/${folder.length + 1}`, e=>{
                                        qrCode.toFile(
                                            `./qr_codes/${folder.length + 1}/${newNumber}.png`,
                                            `Номер:${number}`,
                                            {},
                                            e => {
                                                if (e)
                                                    console.error(e)
                                            })
                                        resolve(`./qr_codes/${folder.length + 1}/${newNumber}.png`)
                                    })
                                } else {
                                    qrCode.toFile(
                                        `./qr_codes/${folder}/${newNumber}.png`,
                                        `Номер:${number}`,
                                        {},
                                        e => {
                                            if (e)
                                                console.error(e)
                                        })
                                    resolve(`./qr_codes/${folder}/${newNumber}.png`)
                                }
                            })
                        }
                    })
                })
                .catch(path =>{
                    fs.mkdir(path, e=>{
                        qrCode.toFile(
                            `${path}/${newNumber}.png`,
                            `Номер:${number}`,
                            {},
                            e => {
                                if (e)
                                    console.error(e)
                            })
                        resolve(`${path}/${newNumber}.png`)
                    })
                })
        })
    }
    return createQRImage()
}

exports.deleteQR = (path) => {
    fs.unlink(path, e=>{
        if (e)
            console.log(e)
    })
}
