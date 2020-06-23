import http from '../http-common'

class DocumentDataService{
    getAll(){
        return http.get('/api/documents/all')
    }
    create(data){
        return http.post('/api/documents/document', data)
    }
    delete(id){
        return http.delete(`/api/documents/document=${id}`)

    }
    download(id){
        return http.get(`/api/documents/download=${id}`, { responseType: 'blob'})
    }
}

export default new DocumentDataService();
