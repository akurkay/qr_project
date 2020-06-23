<template>
    <b-container fluid>
        <b-row>
            <canvas ref="canvas" width="320" height="240" class="my-3"></canvas>
        </b-row>
        <b-row>
            <b-button variant="danger" @click="clearCode" class="mx-1 mb-3">Просканировать заново</b-button>
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
                    {key: 'title', label:'Наименование'},
                    {key: 'number', label: 'Номер'},
                    {key: 'actual_cost', label: 'Фактическая стоимость'},
                    {key: 'actual_presence',
                        formatter: (value) => {
                            return value ? 'Есть' : 'Нет'
                        },
                        label: 'Фактическое наличие'},
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
                                this.items = [this.result]
                            }
                        }).catch(e=>{
                            console.log(e);
                        })
                    } else
                        this.number = 'Ошибка чтения'
                }
                requestAnimationFrame(this.paintFrame);
            },
            clearCode(){
                this.items = []
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
            }
        }
    }
</script>
