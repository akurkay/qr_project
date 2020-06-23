<template>
    <b-container fluid>
        <b-row>
            <canvas ref="canvas" width="320" height="240"></canvas>
        </b-row>
        <b-row class="my-2">
            <h5>Результат: {{number}}</h5>
        </b-row>
        <b-row>
            <b-button variant="primary" @click="addFixedAsset" class="mx-1 mb-3">Записать основное средство</b-button>
            <b-button variant="danger" @click="clearCode" class="mx-1 mb-3">Отменить</b-button>
            <b-button variant="success" @click="addNewDocument" class="mx-1 mb-3">Записать документ</b-button>
            <b-modal id="modal-create-doc" hide-footer>
                <h3 align="center">Пустой документ!</h3>
            </b-modal>
        </b-row>
        <b-col>
            <b-table
                    show-empty
                    stacked="md"
                    :items="items"
                    :fields="fields"
            >
                <template v-slot:cell(delete_item)="data">
                    <b-button variant="danger" @click="deleteItem(data)">Удалить из таблицы</b-button>
                </template>
            </b-table>
        </b-col>
    </b-container>

</template>
<script>
    import FixedAssetsDataService from "@/services/FixedAssetsDataService";
    import DocumentDataService from "@/services/DocumentDataService";

    const jsQR = require('jsqr')

    export default {
        name: 'app',
        data() {
            return {
                video: null,
                canvas: null,
                context: null,
                width: 320,
                height: 240,
                result: null,
                number: null,
                items : [],
                fields:[
                    {key: 'title', label:'Наименование', sortable: true},
                    {key: 'number', label: 'Номер', sortable: true},
                    {key: 'actual_cost', label: 'Фактическая стоимость', sortable: true},
                    {key: 'actual_presence',
                        formatter: (value) => {
                            return value ? 'Есть' : 'Нет'
                        },
                        label: 'Фактическое наличие', sortable: true},
                    {key: 'delete_item', label: 'Удалить из документа основное средство', sortable: true},

                ]
            }
        },
        mounted() {
                this.video = document.createElement('video')
                this.canvas = this.$refs.canvas
                this.context = this.canvas.getContext('2d')
                if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
                        this.video.srcObject = stream;
                        this.video.play();
                        this.video.addEventListener("play", this.paintFrame, false);
                    })
                    .catch(e=>{
                        console.log(e);
                    });

                }
        },
            methods: {
                paintFrame(){
                    this.context.drawImage(this.video, 0, 0, this.width, this.height)
                    let imageData = this.context.getImageData(0, 0, this.width, this.height)
                    const code = jsQR(imageData.data, imageData.width, imageData.height, {
                                    inversionAttempts: "dontInvert",
                                });
                    let number = ''
                    if(code){
                        if(code.data.match(/\d+[/]\d+$/)){
                            number = code.data.split(':')[1].replace(/[/]/,'_')
                            FixedAssetsDataService.get(number).then(res=>{
                                if(!res.data)
                                    this.number = 'Нету такого номера'
                                else {
                                    this.canvas.hidden = true
                                    this.result = res.data
                                    this.number = res.data.number
                                }
                            }).catch(e=>{
                                console.log(e);
                            })
                        } else
                            this.number = 'Ошибка чтения'
                    }
                    requestAnimationFrame(this.paintFrame);
            },
                addFixedAsset(){
                    this.items.push(this.result)
                    this.result = null
                    this.number = null
                    this.canvas.hidden = false
                },
                clearCode(){
                    this.result = null
                    this.number = null
                    this.canvas.hidden = false
                },
                addNewDocument(){
                    if(this.items.length === 0){
                        this.$bvModal.show('modal-create-doc')
                        return
                    } else{
                        const newDocument = {
                            active_status: 0,
                            history: this.items
                        }
                        console.log(newDocument);
                        DocumentDataService.create(newDocument)
                            .then(res=>{
                                console.log(res.data);
                                this.$router.push({ path: "inventory"})
                            })
                            .catch(e=>{
                                console.log(e);
                            })
                    }
                },
                deleteItem(data){
                    this.items.splice(data.index, 1)
                },
            }
    }
</script>
