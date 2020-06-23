import http from '../http-common'

class HistoryDataService{
    getAll(){
        return http.get('/api/history/all')
    }
    get(title){
        return http.get(`/api/history/doc=${title}`)
    }
    create(data){
        return http.post(`/api/history/`, data)
    }
}

export default new HistoryDataService();
