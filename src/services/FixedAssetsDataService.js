import http from '../http-common'

class FixedAssetsDataService{
    getAll(){
        return http.get('/api/fixed_assets/items')
    }

    get(number){
        return http.get(`/api/fixed_assets/item=${number}`)
    }

    create(data){
        return http.post('/api/fixed_assets/item', data)
    }

    delete(number){
        return http.delete(`/api/fixed_assets/item=${number}`)

    }

    update(number, data){
        return http.put(`/api/fixed_assets/item=${number}`, data)
    }

    createQRFile(data){
        return http.post('/api/fixed_assets/doc', data)
    }

    downloadDoc(){
        return http.get('/api/fixed_assets/result_doc',{ responseType: 'blob'})
    }

    uploadFile(file){
        console.log(file);
        let formData = new FormData()
        formData.append('csv_file', file)
        return http.post('/api/fixed_assets/upload_file', formData, {
            headers:{
                'Content-Type': 'multipart/form-data'
            }
        })
    }
}

export default new FixedAssetsDataService();
