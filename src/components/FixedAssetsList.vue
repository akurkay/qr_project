<template>
    <b-container fluid>
        <b-row>
            <b-col md="auto" class="my-2">
                <b-dropdown variant="primary" text="Добавить новые основные средства">
                    <b-dropdown-item-button @click="open()">Вручную</b-dropdown-item-button>
                    <b-dropdown-item-button @click="$bvModal.show('modal-upload')">С помощью CSV файла</b-dropdown-item-button>
                </b-dropdown>
            </b-col>
            <b-modal id="modal-upload" hide-footer hide-header>
                <b-form @submit="uploadFile">
                    <b-form-file
                            accept=".csv"
                            v-show="!spinnerFLag"
                            v-model="file"
                            placeholder="Выберите файл или перетащите его в это поле"
                            drop-placeholder="Перетащите файл в это поле"
                            :value="file"
                    ></b-form-file>
                    <div v-show="spinnerFLag" class="mx-auto" style="width:150px">
                        <h3>Подождите...</h3>
                    </div>
                    <div v-show="spinnerFLag" class="mx-auto" style="width:20px">
                        <b-spinner></b-spinner>
                    </div>
                    <b-alert
                            class="my-2"
                            :show="modalInstance.dismissCountDownSuccessUpload"
                            dismissible
                            variant="success"
                            @dismissed="modalInstance.dismissCountDownSuccessUpload=0"
                            @dismiss-count-down="countDownChanged('success_upload', modalInstance.dismissSecs)"
                    >
                        {{textResultMessage}}
                    </b-alert>
                    <b-alert
                            class="my-2"
                            :show="modalInstance.dismissCountDownErrorUpload"
                            dismissible
                            variant="danger"
                            @dismissed="modalInstance.dismissCountDownErrorUpload=0"
                            @dismiss-count-down="countDownChanged('danger_upload', modalInstance.dismissSecs)"
                    >{{textResultMessage}}
                    </b-alert>
                    <b-button v-show="!spinnerFLag" block variant="success" class="my-2" type="submit">Загрузить</b-button>
                    <b-button v-show="!spinnerFLag" block variant="danger" @click="$bvModal.hide('modal-upload')">Закрыть окно</b-button>
                </b-form>
            </b-modal>
            <b-col md="auto" class="my-2">
                    <b-button variant="primary" @click="createQRFile">Получить файл с QR-кодами</b-button>
            </b-col>
            <b-col>
                <b-button md="auto" class="my-2" variant="danger" @click="$bvModal.show('delete-modal')">Удалить выбранное</b-button>
                <b-modal id="delete-modal" centered hide-footer>
                    <h3 align="center">Вы уверены?</h3>
                    <b-button block variant="success" @click="deleteFixedAsset">Да</b-button>
                    <b-button block variant="danger" @click="$bvModal.hide('delete-modal')">Нет</b-button>
                </b-modal>
                <b-modal id="success-delete" hide-footer>
                    <h4 align="center">Процесс удаления прошёл успешно!</h4>
                </b-modal>
            </b-col>
            <b-col class="my-3">
                <b-form-group>
                    <b-form-checkbox
                            size="lg"
                            v-model="allSelected"
                            :indeterminate="indeterminate"
                            @change="toggleAll"
                    >{{allSelected ? 'Убрать все': 'Выбрать все'}}</b-form-checkbox>
                </b-form-group>
            </b-col>
            <b-col lg="4" class="my-2">
                <b-form-group
                >
                    <b-input-group>
                        <b-form-input
                                v-model="filter"
                                type="search"
                                id="filterInput"
                                placeholder="Искать по таблице..."
                                @input="onFiltered"
                        ></b-form-input>
                        <b-input-group-append>
                            <b-button :disabled="!filter" @click="filter = ''">Очистить</b-button>
                        </b-input-group-append>
                    </b-input-group>
                </b-form-group>
            </b-col>
            <b-col sm="3" md="6">
                <b-form-group
                        description="Выберите фильтр, по которому нужно искать в таблице">
                    <b-form-checkbox-group v-model="filterOn">
                        <b-form-checkbox value="title">Название</b-form-checkbox>
                        <b-form-checkbox value="number">Номер</b-form-checkbox>
                        <b-form-checkbox value="actual_cost">Фактическая стоимость</b-form-checkbox>
                        <b-form-checkbox value="actual_presence">Фактическое наличие</b-form-checkbox>
                    </b-form-checkbox-group>
                </b-form-group>
            </b-col>
            <b-col sm="7" md="6" class="my-2">
                <b-pagination
                        align="fill"
                        size="sm"
                        class="my-0"
                        v-model="currentPage"
                        :total-rows.sync="totalRows"
                        :per-page="perPage"
                        ref="page"
                ></b-pagination>
            </b-col>
        </b-row>
        <b-row>
            <b-table
                    show-empty
                    stacked="md"
                    :items="items"
                    :fields="fields"
                    :bordered="bordered"
                    :no-border-collapse="noBorderCollapse"
                    ref="mainTable"
                    :filter="filter"
                    :current-page="currentPage"
                    :per-page="perPage"
                    :filterIncludedFields="filterOn"
                    @filtered="onFiltered"
            >
                <template v-slot:cell(select_item)="data">
                    <b-form-checkbox
                        size="lg"
                        v-model="selected"
                        :value="data.item.number"
                    ></b-form-checkbox>
                </template>
                <template v-slot:cell(change_data)="data">
                    <b-button
                            variant="primary"
                            @click="open(data)"
                    >
                        Обновить данные
                    </b-button>
                    <b-modal
                            :id="`update-item-${data.item.number}`"
                            :title="`Изменить данные основного средства с номером ${data.item.number.replace(/[_]/,'/')}`"
                            centered
                            hide-footer
                    >
                            <b-form @submit="onSubmitUpdate" @reset="onReset">
                                <label>Введите название основного средства:</label>
                                <b-form-input
                                        v-model="fixedAsset.title"
                                        required
                                        placeholder="Название..."
                                        type="text">
                                </b-form-input>
                                <label>
                                    Введите инвентарный номер основного средства по шаблону
                                    <span class="text-danger font-weight-bold">###/###</span>
                                    , где
                                    <span class="text-danger font-weight-bold">#</span>
                                    - число:
                                </label>
                                <b-form-input
                                        v-model="fixedAsset.number"
                                        required
                                        :state="checkNumber"
                                        placeholder="Инвентарный номер..."
                                        type="text">
                                </b-form-input>
                                <b-form-invalid-feedback>
                                    Необходимо ввести номер по шаблону: ###/###
                                </b-form-invalid-feedback>
                                <b-form-group>
                                    <label>Введите фактическую стоимость основного средства:</label>
                                    <b-form-input
                                            v-model="fixedAsset.actual_cost"
                                            :state="checkActualCost"
                                            placeholder="Фактическая стоимость..."
                                            type="text">
                                    </b-form-input>
                                    <b-form-invalid-feedback>
                                        Необходимо ввести число!
                                    </b-form-invalid-feedback>
                                    <b-form-checkbox
                                            v-model="fixedAsset.actual_presence"
                                            value="1"
                                            size="lg"
                                            unchecked-value="0"
                                            class="mt-3 mb-1 mx-1"
                                    >Фактическое наличие</b-form-checkbox>
                                </b-form-group>
                                <b-alert
                                        class="my-2"
                                        variant="success"
                                        :show="modalInstance.dismissCountDownSuccessUpdate"
                                        dismissible
                                        @dismissed="modalInstance.dismissCountDownSuccessUpdate=0"
                                        @dismiss-count-down="countDownChanged('success_update', modalInstance.dismissSecs)"
                                >
                                    {{textResultMessage}}
                                </b-alert>
                                <b-alert
                                        class="my-2"
                                        variant="danger"
                                        :show="modalInstance.dismissCountDownErrorUpdate"
                                        dismissible
                                        @dismissed="modalInstance.dismissCountDownErrorUpdate=0"
                                        @dismiss-count-down="countDownChanged('danger_update', modalInstance.dismissSecs)"
                                >
                                    {{textResultMessage}}
                                </b-alert>
                                <b-button block type="submit" variant="success">Обновить</b-button>
                                <b-button block type="reset" variant="danger">Очистить форму</b-button>
                                <b-button block variant="info" @click="$bvModal.hide(`update-item-${data.item.number}`)">Закрыть окно</b-button>
                            </b-form>
                        </b-modal>
                </template>
            </b-table>
        </b-row>
        <b-modal
                id="modal-create"
                title="Добавить новое основное средство"
                hide-footer
                hide-header
        >
            <b-form @submit="onSubmitCreate" @reset="onReset">
                <label>Введите название основного средства:</label>
                <b-form-input
                        v-model="fixedAsset.title"
                        required
                        placeholder="Название..."
                        type="text">
                </b-form-input>
                <label>
                    Введите инвентарный номер основного средства по шаблону
                    <span class="text-danger font-weight-bold">###/###</span>
                    , где
                    <span class="text-danger font-weight-bold">#</span>
                    - число:
                </label>
                <b-form-input
                        v-model="fixedAsset.number"
                        required
                        :state="checkNumber"
                        placeholder="Инвентарный номер..."
                        type="text">
                </b-form-input>
                <b-form-invalid-feedback>
                    Необходимо ввести номер по шаблону: ###/###
                </b-form-invalid-feedback>
                <b-form-group>
                    <label>Введите фактическую стоимость основного средства:</label>
                    <b-form-input
                            v-model="fixedAsset.actual_cost"
                            :state="checkActualCost"
                            placeholder="Фактическая стоимость..."
                            type="text">
                    </b-form-input>
                    <b-form-invalid-feedback>
                        Необходимо ввести число!
                    </b-form-invalid-feedback>
                    <b-container>
                        <b-row>
                            <b-col>
                                <b-form-checkbox
                                        v-model="fixedAsset.actual_presence"
                                        size="lg"
                                        class="mt-3 mb-1 mx-1"
                                >Фактическое наличие</b-form-checkbox>
                            </b-col>
                            <b-col class="my-4">
                            </b-col>
                            <b-col>
                            </b-col>
                        </b-row>
                    </b-container>
                </b-form-group>
                <b-alert
                        class="my-2"
                        variant="success"
                        :show="modalInstance.dismissCountDownSuccessCreate"
                        dismissible
                        @dismissed="modalInstance.dismissCountDownSuccessCreate=0"
                        @dismiss-count-down="countDownChanged('success_create', modalInstance.dismissSecs)"
                >
                    {{textResultMessage}}
                </b-alert>
                <b-alert
                        class="my-2"
                        variant="danger"
                        :show="modalInstance.dismissCountDownErrorCreate"
                        dismissible
                        @dismissed="modalInstance.dismissCountDownErrorCreate=0"
                        @dismiss-count-down="countDownChanged('danger_create', modalInstance.dismissSecs)"
                >
                    {{textResultMessage}}
                </b-alert>
                <b-button block type="submit" variant="success">Создать</b-button>
                <b-button block type="reset" variant="danger">Очистить форму</b-button>
                <b-button block variant="info" @click="$bvModal.hide('modal-create')">Закрыть окно</b-button>
            </b-form>
        </b-modal>
    </b-container>
</template>

<script>
    import FixedAssetsDataService from '../services/FixedAssetsDataService';

    export default {
        data() {
            return {
                items: [],
                rows: null,
                fields: [
                    {key: 'select_item', label:'Выбрать пункт', class: 'text-center'},
                    {key: 'title',
                        label: 'Наименование',
                        sortable: true,
                        class: 'text-center'},
                    {key: 'number', label: 'Номер', sortable: true, class: 'text-center'},
                    {key: 'actual_cost', label: 'Фактическая стоимость', sortable: true, class: 'text-center'},
                    {
                        key: 'actual_presence',
                        label: 'Фактическое наличие',
                        formatter: (value) => {
                            return value ? 'Есть' : 'Нет'
                        },
                        sortByFormatted: true,
                        filterByFormatted: true,
                        sortable: true,
                        class: 'text-center'},
                    {key: 'change_data', label: 'Изменить данные', sortable: false, class: 'text-center'},
                ],
                fixedAsset:{
                    title: '',
                    number: '',
                    actual_cost: '',
                    actual_presence: 0,
                },
                file: null,
                spinnerFLag: false,
                modalInstance:{
                    dismissSecs: 2
                },
                textResultMessage: null,
                bordered:true,
                noBorderCollapse: true,
                totalRows: 1,
                currentPage: 1,
                perPage: 5,
                filter: null,
                filterOn: [],
                selected: [],
                allSelected: false,
                indeterminate: false,
            }
        },
        watch:{
            selected(newVal) {
                if (newVal.length === 0) {
                    this.indeterminate = false
                    this.allSelected = false
                } else if (newVal.length === this.items.length) {
                    this.indeterminate = false
                    this.allSelected = true
                } else {
                    this.indeterminate = true
                    this.allSelected = false
                }
            }
        },
        computed: {
            checkActualCost(){
                if(!this.fixedAsset.actual_cost)
                    return null
                return !isNaN(this.fixedAsset.actual_cost);
            },
            checkNumber(){
                if(!this.fixedAsset.number.length)
                    return null
                else return !!this.fixedAsset.number.match(/^\d{1,3}[/]\d{1,3}$/);
            },
        },
        mounted(){
            this.getFixedAssets()
        },
        methods: {
            toggleAll(checked) {
                if(checked){
                    for(let item of this.items)
                        this.selected.push(item.number)
                } else {
                    this.selected = []
                }
            },
            getFixedAssets() {
                FixedAssetsDataService.getAll()
                    .then(res => {
                        this.items = res.data
                        this.totalRows = this.items.length
                    })
                    .catch(e => {
                        console.log(e)
                    });
            },
            deleteFixedAsset(){
                this.$bvModal.hide('delete-modal')
                for(let number of this.selected) {
                    number = number.replace(/[/]/,'_')
                    FixedAssetsDataService.delete(number)
                        .then(response => {
                            console.log(response.data)
                            this.getFixedAssets()
                            this.$bvModal.show('success-delete')
                        })
                        .catch(e => {
                            console.log(e)
                        })
                }
            },
            hideDeleteModal(){
                this.$refs['delete-modal'].hide()
            },
            createQRFile(){
                FixedAssetsDataService.createQRFile(this.selected)
                    .then(res =>{
                        if(res){
                            FixedAssetsDataService.downloadDoc()
                                .then(res=>{
                                    const FileSaver = require('file-saver');
                                    let blob = new Blob([res.data], {type:'application/msword'})
                                    FileSaver.saveAs(blob, 'test.docx')
                                }).catch(e=>{
                                console.log(e);
                            })
                        }
                    })
                    .catch(e => {
                        console.log(e)
                    })
            },
            onSubmitCreate(evt){
                evt.preventDefault()
                let nums = this.fixedAsset.number.split('/')
                nums[0] = nums[0].replace(/^0{1,2}/, '')
                nums[1] = nums[1].replace(/^0{1,2}/, '')
                this.fixedAsset.number = nums.join('/')
                FixedAssetsDataService.create(this.fixedAsset)
                    .then(res => {
                        this.modalInstance.dismissCountDownSuccessCreate = this.modalInstance.dismissSecs
                        this.textResultMessage = res.data
                        this.getFixedAssets()
                    })
                    .catch(e => {
                        this.modalInstance.dismissCountDownErrorCreate = this.modalInstance.dismissSecs
                        this.textResultMessage = `Невозможно добавить основное средство под номером ${e.response.data.message}`
                    })
            },
            countDownChanged(type, dismissCountDown) {
                switch (type) {
                    case 'success_upload':
                        this.modalInstance.dismissCountDownSuccessUpload = dismissCountDown
                        break
                    case 'danger_upload':
                        this.modalInstance.dismissCountDownErrorUpload = dismissCountDown
                        break
                    case 'success_create':
                        this.modalInstance.dismissCountDownSuccessCreate = dismissCountDown
                        break
                    case 'danger_create':
                        this.modalInstance.dismissCountDownErrorCreate = dismissCountDown
                        break
                    case 'success_update':
                        this.modalInstance.dismissCountDownSuccessUpdate = dismissCountDown
                        break
                    case 'danger_update':
                        this.modalInstance.dismissCountDownErrorUpdate = dismissCountDown
                        break
                }
            },
            onReset(evt){
                evt.preventDefault()
                this.fixedAsset.title = ''
                this.fixedAsset.number = ''
                this.fixedAsset.actual_cost = ''
                this.fixedAsset.actual_presence = false
            },
            onSubmitUpdate(evt){
                evt.preventDefault()
                let number = this.fixedAsset.number.replace(/[/]/,'_')
                FixedAssetsDataService.update(number, this.fixedAsset)
                    .then(res=>{
                        this.modalInstance.dismissCountDownSuccessUpdate = this.modalInstance.dismissSecs
                        this.textResultMessage = res.data
                        this.getFixedAssets()
                    })
                    .catch(e => {
                        this.modalInstance.dismissCountDownErrorUpdate = this.modalInstance.dismissSecs
                        this.textResultMessage = 'Не удалось обновить основное средство'
                        console.log(e)
                    })
            },
            onFiltered(filteredItems) {
                this.totalRows = filteredItems.length
            },
            open(data = null){
                if (!data){
                    this.$bvModal.show('modal-create')
                        this.fixedAsset.title = ''
                        this.fixedAsset.number = ''
                        this.fixedAsset.actual_cost = null
                        this.fixedAsset.actual_presence = false
                }
                else{
                    this.$bvModal.show(`update-item-${data.item.number}`)
                    this.fixedAsset.title = data.item.title
                    this.fixedAsset.number = data.item.number
                    this.fixedAsset.actual_cost = data.item.actual_cost
                    this.fixedAsset.actual_presence = data.item.actual_presence
                }
            },
            uploadFile(evt){
                evt.preventDefault()
                if(!this.file){
                    this.modalInstance.dismissCountDownErrorUpload = this.modalInstance.dismissSecs
                    this.textResultMessage = 'Нельзя отправить пустой файл!'
                    return
                }
                this.spinnerFLag = true
                FixedAssetsDataService.uploadFile(this.file)
                    .then(res=>{
                        if(res){
                            this.spinnerFLag = false
                            switch (res) {
                                case 'unknown_error':
                                    this.modalInstance.dismissCountDownErrorUpload = this.modalInstance.dismissSecs
                                    this.textResultMessage = 'Неизвестная ошибка!'
                                    break
                                case 'invalid_type_err':
                                    this.modalInstance.dismissCountDownErrorUpload = this.modalInstance.dismissSecs
                                    this.textResultMessage = 'Неверный тип файла!'
                                    break
                                case 'empty_file':
                                    this.modalInstance.dismissCountDownErrorUpload = this.modalInstance.dismissSecs
                                    this.textResultMessage = 'Вы отправили пустой файл!'
                                    break
                                case 'success':
                                    this.modalInstance.dismissCountDownSuccessUpload = this.modalInstance.dismissSecs
                                    this.textResultMessage = 'Данные из файлы были добавлены в таблицу'
                                    break
                            }
                        }
                    }).catch(e=>{
                    console.log(e);
                })
            }
        }
    }
</script>

