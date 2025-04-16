<template>
    <div class="">
        <el-dialog title="专题制图" :visible="dialogVisible" custom-class="define" :before-close="closeDialog"
            :close-on-click-modal="false">
            <div class="define-main">
                <div class="legend">
                    <el-form ref="form" :model="defineForm" label-width="auto" class="define-form" :rules="rules"
                        hide-required-asterisk size="mini">
                        <el-form-item label="标题" prop="title">
                            <el-input v-model="defineForm.title" placeholder="请输入标题"></el-input>
                        </el-form-item>
                        <el-form-item label="比例尺" prop="scale2">
                            <el-col :span="5">
                                <el-input v-model="defineForm.scale1" readonly></el-input>
                            </el-col>
                            <el-col class="line" :span="2">:</el-col>
                            <el-col :span="17">
                                <el-input @input="changeScale2" v-model.number="defineForm.scale2" placeholder="请输入比例">
                                </el-input>
                            </el-col>
                        </el-form-item>
                        <el-form-item label="打印纸张" prop="paperType">
                            <el-select v-model="defineForm.papertype" placeholder="请选择纸张类型" @change="choosePaperType">
                                <el-option label="A4横版" value="A4横版"></el-option>
                                <el-option label="A4竖版" value="A4竖版"></el-option>
                                <el-option label="A3横版" value="A3横版"></el-option>
                                <el-option label="A3竖版" value="A3竖版"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="制图时间" prop="date">
                            <el-date-picker type="date" placeholder="请选择日期" v-model="defineForm.date" style="width: 100%"
                                value-format="yyyy-MM-dd"></el-date-picker>
                        </el-form-item>
                        <el-form-item label="制图单位" prop="unit">
                            <el-input v-model="defineForm.unit" placeholder="请输入制图单位"></el-input>
                        </el-form-item>
                        <div class="label-module">
                            <el-form-item label="标注类型" prop="labeltype" class="labeltype">
                                <el-radio-group v-model="defineForm.labeltype" @change="labelChange">
                                    <el-radio v-for="(item, index) in labeltypeList" :key="index" :label="item.type">
                                        <el-upload v-if="item.type == 'import'" class="uploadFile" ref="uploadFile"
                                            action="action" :http-request="uploadFile" :show-file-list="false"
                                            accept=".dwg,.txt,.zip">
                                            <div class="label-item">
                                                <span class="iconfont" :class="item.icon"></span>
                                                <span>{{ item.text }}</span>
                                            </div>
                                        </el-upload>
                                        <div class="label-item" v-else>
                                            <span class="iconfont" :class="item.icon"></span>
                                            <span>{{ item.text }}</span>
                                        </div>
                                    </el-radio>
                                </el-radio-group>
                            </el-form-item>
                            <el-table :data="tableData" border size="mini" stripe @select="selectRow" ref="geoTable">
                                <el-table-column type="selection" width="55">
                                </el-table-column>
                                <el-table-column prop="name" label="名称" align="center">
                                </el-table-column>
                                <el-table-column label="操作" align="center">
                                    <template v-slot="scope">
                                        <el-button type="primary" size="mini" plain @click="delRow(scope.row)">删除
                                        </el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
                        <div class="btns">
                            <el-button type="primary" size="small" class="creat-pic" @click="onSubmit">导出专题</el-button>
                        </div>
                    </el-form>
                </div>
                <div class="map" id="define_zttmap" :class="verticalClass">
                    <div class="border_corner border_corner_left_top"></div>
                    <div class="border_corner border_corner_right_top"></div>
                    <div class="border_corner border_corner_left_bottom"></div>
                    <div class="border_corner border_corner_right_bottom"></div>
                </div>
            </div>
        </el-dialog>
    </div>
</template>
<script>
import { mapMutations, mapState } from 'vuex';
import Vue from 'vue';
import {
    initDefineMap,
    defineView,
    printMap,
    uploadDwg,
    readApi,
    createGraphic,
    createFile,
    mapScreenhot,
} from '@/utils/topic-map';
import { saveMapPrintImage } from '@/utils/common-map-method';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import Graphic from '@arcgis/core/Graphic';
import Font from '@arcgis/core/symbols/Font';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import { readFile } from '@/views/onemap/api/onemap';
import axios from "axios";
import * as print from "@arcgis/core/rest/print.js";
import PrintTemplate from "@arcgis/core/rest/support/PrintTemplate.js";
import PrintParameters from "@arcgis/core/rest/support/PrintParameters.js";
export default {
    name: '',
    props: ['btnClass'],
    components: {},
    data() {
        return {
            dialogVisible: false,
            comTitle: '',
            defineForm: {
                title: '',
                scale1: '1',
                scale2: '',
                papertype: 'A4横版',
                date: '',
                unit: '',
                labeltype: '',
                labeltable: [],
                doctype: '',
            },
            rules: {
                title: [
                    {
                        required: true,
                        message: '标题不能为空',
                        trigger: 'blur',
                    },
                ],
                scale2: [
                    {
                        required: true,
                        message: '比例尺不能为空',
                        trigger: 'blur',
                    },
                ],
                papertype: [
                    {
                        required: true,
                        message: '纸张类型不能为空',
                        trigger: 'change',
                    },
                ],
                date: [
                    {
                        required: true,
                        message: '日期不能为空',
                        trigger: 'blur',
                    },
                ],
                unit: [
                    {
                        required: true,
                        message: '单位不能为空',
                        trigger: 'blur',
                    },
                ],
                seal: [
                    {
                        required: true,
                        message: '请选择是否需要印章',
                        trigger: 'change',
                    },
                ],
            },
            labeltypeList: [
                { icon: 'icon-danhangwenben', text: '文本', type: 'text' },
                { icon: 'icon-dingwei1', text: '点', type: 'point' },
                {
                    icon: 'icon-yuanxingweixuanzhong',
                    text: '圆',
                    type: 'circle',
                },
                { icon: 'icon-zhexiantu', text: '线', type: 'polyline' },
                { icon: 'icon-juxing', text: '矩形', type: 'rectangle' },
                { icon: 'icon-duobianxing-', text: '多边形', type: 'polygon' },
                { icon: 'icon-bottom', text: '箭头', type: 'arrow' },
                { icon: 'icon-daoru', text: '导入', type: 'import' },
            ],
            tableData: [],
            verticalClass: '',
            viewClick: null,
            sketchViewModel: null, // 微件
            tableData: [], // 自定义专题图标注图形列表
            textIndex: 1, // 文本标注序号
            pointIndex: 1, // 点标注序号
            circleIndex: 1, // 圆标注序号
            lineIndex: 1, // 线标注序号
            rectangleIndex: 1, // 矩形标注序号
            polygonIndex: 1, // 多边形标注序号
            arrowIndex: 1, // 箭头标注序号
            fileIndex: 1, // 序号
            textTempGLayer: null, // 文本标注图层
            pointTempGLayer: null, // 点标注图层
            circleTempGLayer: null, // 圆标注图层
            polylineTempGLayer: null, // 线标注图层
            rectangleTempGLayer: null, // 矩形标注图层
            polygonTempGLayer: null, // 多边形标注图层
            arrowTempGLayer: null, // 箭头标注图层,
            upLoading: null, // 上传loading
            fileName: '', // 上传文件名
        };
    },
    computed: {
        ...mapState('onemap-store', ['zttScale']),
        ...mapState('onemap-store', ['pointSymbol', 'symbol']),
    },
    watch: {
        btnClass: {
            handler(val) {
                if (val == 3) {
                    this.dialogVisible = true
                    this.$nextTick(() => {
                        initDefineMap('define_zttmap');
                        this.createLabelLayer();
                    });
                } else {
                    this.dialogVisible = false
                }
            },
            immediate: true
        },

        // 监听地图范围变化的scale值
        zttScale: {
            handler(val) {
                // debugger
                this.defineForm.scale2 = val;
            },
            deep: true,
        },
    },
    created() { },
    mounted() {
    },
    methods: {
        ...mapMutations('onemap-store', [
            'handleOnemapPopup',
            'handleToggleIndex',
            'handleShowZttScale',
            'setBtn'
        ]),

        // 打开弹窗
        showDialog(obj) {
            this.comTitle = obj.title;
            this.dialogVisible = true;
            this.handleToggleIndex(false);
        },

        // 关闭弹窗
        closeDialog() {
            this.handleOnemapPopup({ code: 'init' });
            this.handleToggleIndex(true);
            this.handleShowZttScale(true);
            this.dialogVisible = false;
            // // 数据恢复初始
            // Object.assign(this.$data, this.$options.data());
            this.$emit('setBtnClass', -1)
            this.setBtn(false);
        },

        // 选择纸张类型
        choosePaperType(str) {
            if (str === 'A4横版' || str === 'A3横版') {
                this.verticalClass = '';
            } else {
                this.verticalClass = 'verticalClass';
            }
        },

        // 比例尺输入
        changeScale2(val) {
            this.handleShowZttScale(true);
            defineView.scale = val;
        },

        // 标注图层创建
        createLabelLayer() {
            this.textTempGLayer = new GraphicsLayer({ id: 'textTempGLayer' });
            this.pointTempGLayer = new GraphicsLayer({ id: 'pointTempGLayer' });
            this.circleTempGLayer = new GraphicsLayer({
                id: 'circleTempGLayer',
            });
            this.polylineTempGLayer = new GraphicsLayer({
                id: 'polylineTempGLayer',
            });
            this.rectangleTempGLayer = new GraphicsLayer({
                id: 'rectangleTempGLayer',
            });
            this.polygonTempGLayer = new GraphicsLayer({
                id: 'polygonTempGLayer',
            });
            this.arrowTempGLayer = new GraphicsLayer({ id: 'arrowTempGLayer' });
        },

        // 标注表格选中
        changeLabelTable() {
            this.defineForm.labeltype = '';
            this.tableData.forEach((element) =>
                this.$refs.geoTable.toggleRowSelection(element, true)
            );
        },

        // 标注类型选择
        labelChange(obj) {
            if (this.sketchViewModel != null) {
                this.sketchViewModel.cancel();
            }
            switch (obj) {
                // 文本
                case 'text':
                    this.createText('define_zttmap', obj);
                    break;
                // 点
                case 'point':
                    this.createPoint();
                    break;
                // 圆
                case 'circle':
                    this.createCircle();
                    break;
                // 线
                case 'polyline':
                    this.createPolyline();
                    break;
                // 矩形
                case 'rectangle':
                    this.createRectangle();
                    break;
                // 多边形
                case 'polygon':
                    this.createPolygon();
                    break;
                // 箭头
                case 'arrow':
                    this.createArrow();
                    break;

                default:
                    break;
            }
        },

        // 标注-文本
        createText(container, type) {
            let app = this;
            if (this.viewClick != null) {
                this.viewClick.remove();
            }
            let isTextComplete = false;

            let templayer = defineView.map.findLayerById('textTempGLayer');
            if (!Boolean(templayer)) {
                defineView.map.layers.add(this.textTempGLayer);
            }
            debugger
            this.viewClick = defineView.on('click', (evt) => {
                if (type != 'text' || isTextComplete) {
                    return;
                }
                let pt = evt.mapPoint;
                let screenPoint_x = evt.screenPoint.x;
                let screenPoint_y = evt.screenPoint.y;
                let Profile = Vue.extend({
                    template: `<el-input v-model='addInput' v-if="isShow" style='position:absolute;top:${screenPoint_y}px;left:${screenPoint_x}px; width:100px;'  @blur="onSubmit()"></el-input>`,
                    data() {
                        return {
                            addInput: '',
                            isShow: true,
                        };
                    },
                    methods: {
                        onSubmit() {
                            isTextComplete = true;
                            this.isShow = false;
                            let defaultFont = new Font({
                                size: '18px',
                                weight: 'bold',
                            });

                            let ptExtSymbol = new TextSymbol({
                                text: this.addInput,
                                font: defaultFont,
                                color: [255, 0, 0],
                                xoffset: 20,
                                yoffset: -10,
                            });

                            let g = new Graphic({
                                geometry: pt,
                                symbol: ptExtSymbol,
                            });

                            debugger;
                            app.textTempGLayer.graphics.add(g);
                            // 记录图形
                            let graphicIndex = {
                                id: app.textIndex,
                                name: '文本' + app.textIndex,
                                geo: g,
                                type: 'text',
                                layerid: 'textTempGLayer',
                            };

                            app.tableData.push(graphicIndex);
                            app.textIndex++;
                            app.changeLabelTable();
                        },
                    },
                });

                let component = new Profile().$mount();
                document.getElementById(container).appendChild(component.$el);
            });
        },

        // 标注-点
        createPoint() {
            this.sketchViewModel = new SketchViewModel({
                layer: this.pointTempGLayer,
                view: defineView,
                pointSymbol: this.pointSymbol,
            });
            defineView.map.layers.add(this.pointTempGLayer);
            this.sketchViewModel.create('point');
            this.sketchViewModel.on('create', (evt) => {
                if (evt.state == 'complete') {
                    // 记录图形
                    let graphicIndex = {
                        id: this.pointIndex,
                        name: '点' + this.pointIndex,
                        geo: evt.graphic,
                        type: 'point',
                        layerid: 'pointTempGLayer',
                    };
                    this.tableData.push(graphicIndex);
                    this.pointIndex++;
                    this.changeLabelTable();
                }
            });
        },

        // 标记-圆
        createCircle() {
            let symbol = {
                type: 'simple-fill',
                color: [51, 51, 204, 0.2],
                style: 'solid',
                outline: {
                    color: 'red',
                    width: 1,
                },
            };
            this.sketchViewModel = new SketchViewModel({
                layer: this.circleTempGLayer,
                view: defineView,
                polygonSymbol: symbol,
            });

            defineView.map.layers.add(this.circleTempGLayer);
            this.sketchViewModel.create('circle');
            this.sketchViewModel.on('create', (evt) => {
                if (evt.state == 'complete') {
                    // 记录图形
                    let graphicIndex = {
                        id: this.circleIndex,
                        name: '圆' + this.circleIndex,
                        geo: evt.graphic,
                        type: 'circle',
                        layerid: 'circleTempGLayer',
                    };

                    this.tableData.push(graphicIndex);
                    this.circleIndex++;
                    this.changeLabelTable();
                }
            });
        },

        // 标记-线
        createPolyline() {
            let symbol = {
                type: 'simple-line',
                color: [255, 0, 0],
                width: 2,
                cap: 'round',
                join: 'round',
            };
            this.sketchViewModel = new SketchViewModel({
                layer: this.polylineTempGLayer,
                view: defineView,
                polylineSymbol: symbol,
            });
            defineView.map.layers.add(this.polylineTempGLayer);
            this.sketchViewModel.create('polyline');
            this.sketchViewModel.on('create', (evt) => {
                if (evt.state == 'complete') {
                    this.sketchViewModel.complete();
                    this.sketchViewModel.destroy();
                    // 记录图形
                    let graphicIndex = {
                        id: this.lineIndex,
                        name: '线' + this.lineIndex,
                        geo: evt.graphic,
                        type: 'polyline',
                        layerid: 'polylineTempGLayer',
                    };
                    this.tableData.push(graphicIndex);
                    this.lineIndex++;
                    this.changeLabelTable();
                }
            });
        },

        // 标记-矩形
        createRectangle() {
            let symbol = {
                type: 'simple-fill',
                color: [51, 51, 204, 0.2],
                style: 'solid',
                outline: {
                    color: 'red',
                    width: 1,
                },
            };
            this.sketchViewModel = new SketchViewModel({
                layer: this.rectangleTempGLayer,
                view: defineView,
                polygonSymbol: symbol,
            });
            defineView.map.layers.add(this.rectangleTempGLayer);
            this.sketchViewModel.create('rectangle');
            this.sketchViewModel.on('create', (evt) => {
                if (evt.state == 'complete') {
                    // 记录图形
                    let graphicIndex = {
                        id: this.rectangleIndex,
                        name: '矩形' + this.rectangleIndex,
                        geo: evt.graphic,
                        type: 'rectangle',
                        layerid: 'rectangleTempGLayer',
                    };
                    this.tableData.push(graphicIndex);
                    this.rectangleIndex++;
                    this.changeLabelTable();
                }
            });
        },

        // 标记-多边形
        createPolygon() {
            let symbol = {
                type: 'simple-fill',
                color: [51, 51, 204, 0.2],
                style: 'solid',
                outline: {
                    color: 'red',
                    width: 1,
                },
            };
            this.sketchViewModel = new SketchViewModel({
                layer: this.polygonTempGLayer,
                view: defineView,
                polygonSymbol: symbol,
            });
            defineView.map.layers.add(this.polygonTempGLayer);
            this.sketchViewModel.create('polygon');
            this.sketchViewModel.on('create', (evt) => {
                if (evt.state == 'complete') {
                    //this.polygonGraphic(evt.graphic.geometry.rings);
                    let graphicIndex = {
                        id: this.polygonIndex,
                        name: '面' + this.polygonIndex,
                        geo: evt.graphic,
                        type: 'polygon',
                        layerid: 'polygonTempGLayer',
                    };
                    this.tableData.push(graphicIndex);
                    this.polygonIndex++;
                    this.changeLabelTable();
                }
            });
        },

        // 标记-箭头
        createArrow() {
            let symbol = {
                type: 'simple-line',
                color: [255, 0, 0],
                width: 2,
                cap: 'round',
                join: 'round',
                marker: {
                    style: 'arrow',
                    color: 'red',
                    placement: 'end',
                },
            };
            this.sketchViewModel = new SketchViewModel({
                layer: this.arrowTempGLayer,
                view: defineView,
                polylineSymbol: symbol,
            });
            defineView.map.layers.add(this.arrowTempGLayer);
            this.sketchViewModel.create('polyline');
            this.sketchViewModel.on('create', (evt) => {
                if (evt.state == 'complete') {
                    this.sketchViewModel.complete();
                    this.sketchViewModel.destroy();

                    // 记录图形
                    let graphicIndex = {
                        id: this.arrowIndex,
                        name: '箭头' + this.arrowIndex,
                        geo: evt.graphic,
                        type: 'arrow',
                        layerid: 'arrowTempGLayer',
                    };
                    this.tableData.push(graphicIndex);
                    this.arrowIndex++;
                    this.changeLabelTable();
                }
            });
        },

        // 导入文件
        async uploadFile(params) {
            this.upLoading = this.$message({
                iconClass: 'el-icon-loading',
                message: '上传中...',
                duration: 0,
                customClass: 'prop-search',
            });
            // 文件名称
            this.fileName = params.file.name;
            // 文件扩展名
            let fileExt = params.file.name.split('.')[1];
            let form = new FormData();
            // form.append('filepath', 'ZTT');
            form.append('file', params.file);
            if (fileExt == 'dwg') {
                this.readDWG(form, params.file.name);
            }
            if (fileExt == 'txt') {
                this.readTXT(form, params.file.name);
            }
            if (fileExt == 'zip' || fileExt == 'rar') {
                this.readSHP(form, params.file.name);
            }
            this.upLoading.close();

        },

        // 读取DWG
        async readDWG(params, name) {
            let data = await readFile(params);
            if (data.code === 200) {
                this.overLayer(data.data, name);
            } else {
                this.upLoading.close();
                this.$message.error(data.msg);
            }
        },

        //读取TXT
        async readTXT(params, name) {
            let data = await readFile(params);
            if (data.code === 200) {
                this.overLayer(data.data, name);
            } else {
                this.upLoading.close();
                this.$message.error(data.msg);
            }
        },

        //读取shp
        async readSHP(params, name) {
            let data = await readFile(params);
            if (data.code === 200) {
                this.overLayer(data.data, name);
            } else {
                this.upLoading.close();
                this.$message.error(data.msg);
            }
        },

        // 叠加图形到地图
        async overLayer(data, name) {
            defineView.graphics.removeAll();
            const graphic = await createGraphic(data, defineView);
            if (graphic) {
                this.upLoading.close();
                let graphicIndex = {
                    id: this.fileIndex,
                    name: this.fileName,
                    geo: graphic,
                    type: 'import',
                    layerid: '',
                };
                this.tableData.push(graphicIndex);
                this.fileIndex++;
                this.changeLabelTable();
                defineView.graphics.add(graphic);
                defineView.extent = graphic.geometry.extent;
                defineView.zoom = defineView.zoom - 2;
            }
        },

        // 勾选表格当前行
        selectRow(selection, row) {
            switch (row.type) {
                case 'text':
                    this.labelVisible(this.textTempGLayer, selection, row);
                    break;
                case 'point':
                    this.labelVisible(this.pointTempGLayer, selection, row);
                    break;
                case 'circle':
                    this.labelVisible(this.circleTempGLayer, selection, row);
                    break;
                case 'polyline':
                    this.labelVisible(this.polylineTempGLayer, selection, row);
                    break;
                case 'rectangle':
                    this.labelVisible(this.rectangleTempGLayer, selection, row);
                    break;
                case 'polygon':
                    this.labelVisible(this.polygonTempGLayer, selection, row);
                    break;
                case 'arrow':
                    this.labelVisible(this.arrowTempGLayer, selection, row);
                    break;
                case 'import':
                    this.labelVisible(defineView, selection, row);
                    break;
                default:
                    break;
            }
        },

        // 标签标注项显示
        labelVisible(layer, selection, row) {
            if (selection.indexOf(row) > -1) {
                if (layer != null) {
                    layer.graphics.items[row.id - 1].visible =
                        !layer.graphics.items[row.id - 1].visible;
                }
            } else {
                if (layer != null) {
                    layer.graphics.items[row.id - 1].visible =
                        !layer.graphics.items[row.id - 1].visible;
                }
            }
        },

        // 当前行删除
        delRow(obj) {
            switch (obj.type) {
                case 'text':
                    this.textTempGLayer.graphics.remove(obj.geo);
                    break;
                case 'point':
                    this.pointTempGLayer.graphics.remove(obj.geo);
                    break;
                case 'circle':
                    this.circleTempGLayer.graphics.remove(obj.geo);
                    break;
                case 'polyline':
                    this.polylineTempGLayer.graphics.remove(obj.geo);
                    break;
                case 'rectangle':
                    this.rectangleTempGLayer.graphics.remove(obj.geo);
                    break;
                case 'polygon':
                    this.polygonTempGLayer.graphics.remove(obj.geo);
                    break;
                case 'arrow':
                    this.arrowTempGLayer.graphics.remove(obj.geo);
                    break;
                case 'import':
                    debugger
                    defineView.graphics.remove(obj.geo);
                    break;
                default:
                    break;
            }
            let index = this.tableData.indexOf(obj);
            this.tableData.splice(index, 1);
        },

        // 导出专题
        onSubmit() {
            this.$refs.form.validate(async (valid) => {
                if (!valid) return this.$message.error('请补充必填项');
                this.upLoading = this.$message({
                    iconClass: 'el-icon-loading',
                    message: '正在生成报告...',
                    duration: 0,
                    customClass: 'prop-search',
                });
                // const res = await printMap(
                //     this.defineForm.dpi,
                //     this.defineForm.scale2,
                //     defineView
                // )
                //     .then((res) => {
                //         return { status: true, data: res };
                //     })
                //     .catch((err) => {
                //         return { status: false, data: err };
                //     });

                let imagedata = await mapScreenhot(defineView);
                debugger
                let res = await saveMapPrintImage(
                    this.defineForm.title,
                    'ZTT',
                    imagedata,
                    1
                );
                if (imagedata) {
                    // 传参
                    // type:4 自定义专题图
                    let params = {
                        type: 4,
                        title: this.defineForm.title,
                        scale: this.defineForm.scale2,
                        size: this.defineForm.papertype,
                        time: this.defineForm.date,
                        imagepath: res,
                        yz: '否',
                        ztdw: this.defineForm.unit,
                    };
                    this.exportPDF(params);
                } else {
                    this.upLoading.close();
                    this.$message.error(res.msg);
                }
            });
        },

        // 导出自定义图PDF
        // ! 生成PDF地图是蓝色的
        async exportPDF(params) {
            const data = await createFile(params);
            debugger
            if (data.code === 200) {
                this.upLoading.close();
                window.open(Vue.prototype.apiURL_file +'/'+ data.data);
            } else {
                this.upLoading.close();
                this.$message.error(data.msg);
            }
        },
    },
}
</script>
<style scoped lang="scss">
@import '../style/ztzt.scss';
</style>