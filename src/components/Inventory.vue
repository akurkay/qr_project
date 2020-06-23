<template>
    <div>
        <div v-for="item in documents" :key="item.title">
            <b-button block v-b-toggle="`document-${item.id}`" variant="primary" class="my-1"><h4>{{item.title}}</h4></b-button>
            <b-collapse :id="`document-${item.id}`">
                <b-col lg="12" class="my-2">
                    <b-input-group> <b-form-input
                            v-model="filter"
                            type="search"
                            id="filterInput"
                            placeholder="Искать по таблице...">
                    </b-form-input>
                        <b-input-group-append>
                            <b-button :disabled="!filter" @click="filter = ''">Очистить</b-button>
                        </b-input-group-append>
                        <b-button variant="danger" class="mx-2" @click="$bvModal.show(`delete-modal-${item.id}`)">Удалить документ</b-button>
                        <b-modal :id="`delete-modal-${item.id}`" centered hide-footer>
                            <h3 align="center">Вы уверены?</h3>
                            <b-button block variant="success" @click="deleteDocument(item)">Да</b-button>
                            <b-button block variant="danger" @click="$bvModal.hide('delete-modal')">Нет</b-button>
                        </b-modal>
                        <b-button variant="success" @click="downloadCSV(item)">Скачать CSV файл</b-button>
                    </b-input-group>

                </b-col>
                <b-container fluid>
                    <b-table
                        show-empty
                        stacked="md"
                        :filter="filter"
                        :items="item.history"
                        :fields="fields"
                ></b-table>
                </b-container>
            </b-collapse>
        </div>
    </div>
</template>

<script>
     import DocumentDataService from "@/services/DocumentDataService";
     import HistoryDataService from "@/services/HistoryDataService";

export default {
    data() {
       return {
           documents: [],
           fields: [
               {key: 'title', label:'Наименование', sortable: true},
               {key: 'number', label: 'Номер', sortable: true},
               {key: 'actual_cost', label: 'Фактическая стоимость', sortable: true},
               {key: 'actual_presence',
                   formatter: (value) => {
                       return value ? 'Есть' : 'Нет'
                   },
                   label: 'Фактическое наличие', sortable: true},
           ],
           filter: null,
       }
    },
    mounted(){
        this.getDocumentsAndHistories()
    },
    methods: {
        getDocumentsAndHistories(){
            DocumentDataService.getAll()
                .then(res=>{
                    let docArray = []
                    for(let document of res.data){
                        if(!document.active_status){
                            let resultDocument = {
                                id : document.id,
                                title : document.title,
                                active_status : document.active_status,
                                history : [],
                            }
                            HistoryDataService.getAll()
                                .then(res=>{
                                    for(let history of res.data){
                                        if(document.id === history.documentId){
                                            resultDocument.history.push(JSON.parse(history.history_info))
                                        }
                                    }
                                })
                                .catch(e=>{
                                    console.log(e);
                                })
                            docArray.push(resultDocument)
                        }
                    }
                    this.documents = docArray
                })
                .catch(e=>{
                    console.log(e);
                })
        },
        deleteDocument(item){
            const id = item.id
            DocumentDataService.delete(id).then(res=>{
                console.log(res.data);
                this.getDocumentsAndHistories()
            })
            .catch(e=>{
                console.log(e);
            })
        },
        downloadCSV(item){
            DocumentDataService.download(item.id)
            .then(res=>{
                const FileSaver = require('file-saver');
                let blob = new Blob([res.data], {type:'text/csv'})
                FileSaver.saveAs(blob, `${item.title}.csv`)
            })
            .catch(e=>{
                console.log(e);
            })
        },
    }
}
</script>
