<template>
    <div class="mapbox">
        <div class="mapcontrol">
            <span
                v-for="(item, index) in btnData"
                :key="index"
                :class="{ active: menuIdnex == index }"
                @click="menuClick(index)"
            >
                <i :class="item.class"></i>{{ item.title }}
            </span>
        </div>
        <!-- <div :class="{ tuli: menuIdnex == 8 }"></div> -->
        <!-- <span style="border-right: none" @click="menuClick(8)" :class="{ active: menuIdnex == index }"><i class="legend"></i>图例</span> -->
        <el-dialog
            custom-class="selectSwipe"
            title="选择卷帘图层"
            :visible.sync="dialogVisible"
            :modal="false"
            :close-on-click-modal="false"
            destroy-on-close
            :before-close="closeDialog"
        >
            <el-form :inline="true" class="demo-form-inline">
                <el-form-item label="左侧图层">
                    <el-select
                        v-model="leftlayer.label"
                        value-key="value"
                        placeholder="选择左侧图层"
                        @change="leftLayerChange"
                        clearable
                    >
                        <el-option
                            v-for="item in swipelayer"
                            :label="item.label"
                            :key="item.id"
                            :value="item"
                        ></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="右侧图层">
                    <el-select
                        v-model="rightlayer.label"
                        value-key="value"
                        placeholder="选择右侧图层"
                        clearable
                        @change="rightlayerChange"
                    >
                        <el-option
                            v-for="item in swipelayer"
                            :label="item.label"
                            :key="item.id"
                            :value="item"
                        ></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="submit">确 定</el-button>
                <el-button @click="consoleSub">取 消</el-button>
            </span>
        </el-dialog>
        <div class="viewDiv" id="viewDiv" v-if="showSwipe">
            <!-- 关闭底图 -->
            <el-button
                type="primary"
                icon="el-icon-view"
                circle
                class="close-map"
                @click="closemap"
            ></el-button>
            <el-button
                type="primary"
                icon="el-icon-switch-button"
                circle
                class="close-swipe"
                @click="closeSwipe"
            ></el-button>
        </div>
        <AttrPopup :isShow="showAttr"></AttrPopup>
        <!--图层顺序调整框 -->
        <OnemapSort
            ref="mapsort"
            :dialogVisible="islayersort"
            @change="change"
        />
    </div>
</template>
<script>
import {
    large,
    small,
    initextent,
    length_area,
    clearmap,
    Lenged,
    initSplitMap,
} from "@/utils/arcgis_map";
import Basemap from "@arcgis/core/Basemap";
import Map from "@arcgis/core/Map";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import userconfig from "@/utils/userconfig.js";
import TileLayer from "@arcgis/core/layers/TileLayer";
// import MapView from '@arcgis/core/views/MapView'
import MapView from "@arcgis/core/views/MapView.js";
import WebTileLayer from "@arcgis/core/layers/WebTileLayer";
import Swipe from "@arcgis/core/widgets/Swipe";
import { mapMutations, mapState } from "vuex";
import AttrPopup from "@/views/onemap/vue/AttrPopup.vue";
import store from "@/store/index";
import { Notification, Loading, Message } from "element-ui";
import * as identify from "@arcgis/core/rest/identify";
import Graphic from "@arcgis/core/Graphic";
import IdentifyParameters from "@arcgis/core/rest/support/IdentifyParameters";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import TileInfo from "@arcgis/core/layers/support/TileInfo";
import Point from "@arcgis/core/geometry/Point";
import OnemapSort from "@/views/onemap/vue/OnemapSort.vue";
export default {
    name: "mapcontrol",
    components: {
        AttrPopup,
        OnemapSort,
    },
    props: ["treedata"],
    computed: {
        ...mapState("onemap-store", [
            "focusBtn",
            "isFocus",
            "mapview",
            "number",
            "mapconfig",
        ]),
    },
    data() {
        return {
            btnData: [
                { class: "big", title: "放大" },
                { class: "small", title: "缩小" },
                { class: "all", title: "全图" },
                { class: "length", title: "测距" },
                { class: "area", title: "面积" },
                { class: "clear", title: "清除" },
                { class: "attribute", title: "属性" },
                { class: "swipe", title: "卷帘" },
                { class: "el-icon-film", title: "图例" },
                { class: "el-icon-sort", title: "图层管理" },
            ],
            menuIdnex: 8,
            dialogVisible: false,
            leftlayer: {
                label: "",
                url: "",
                kind: "",
            },
            rightlayer: {
                label: "",
                url: "",
                kind: "",
            },
            swipelayer: [],
            showSwipe: false,
            attr_loading: null,
            allLayers: [], //地图上的全部图层
            openallLayers: [], //已打开的图层
            openfeaturelayers: [], //已打开的所有子图层
            //递归循环索引，代表查询图层的索引
            identifyCount: 0,
            mapIndex: 0,
            IdentifyResultArr: [],
            showAttr: false,
            isshow: false,
            mapnumber: null,
            mapdata: null,
            view: null,
            isLarge: false, //控制放大
            isSmall: false, //控制缩小
            isLength: false, //控制测距
            isArea: false, //控制测面
            ismapAttr: false, //控制属性查询
            islegend: true, //控制图例
            islayersort: false, //控制图层管理
            swipeflag: false,
            theBaseLayer: false,
        };
    },
    watch: {
        treedata(val) {
            if (val) {
                this.getswipelayer(this.treedata);
            }
        },
        showSwipe(val) {
            if (val == true) {
                this.mapdata = this.mapconfig;
                this.mapnumber = this.number;
            }
        },
        islayersort(val) {
            console.log(val);
        },
    },
    methods: {
        change(val) {
            this.islayersort = val;
        },
        menuClick(i) {
            this.menuIdnex = i;
            console.log(i, this.islayersort, "---this.islayersort");
            if (i == 0) {
                // clearmap();
                this.isLarge = !this.isLarge;
                large(this.isLarge);
                if (this.isLarge == false) {
                    this.menuIdnex = -1;
                }
            } else if (i == 1) {
                // clearmap();
                this.isSmall = !this.isSmall;
                small(this.isSmall);
                if (this.isSmall == false) {
                    this.menuIdnex = -1;
                }
            } else if (i == 2) {
                initextent();
                // clearmap();
            } else if (i == 3) {
                // clearmap();
                this.isLength = !this.isLength;
                length_area("length", this.isLength);
                if (this.isLength == false) {
                    this.menuIdnex = -1;
                }
            } else if (i == 4) {
                // clearmap();
                this.isArea = !this.isArea;
                length_area("area", this.isArea);
                if (this.isArea == false) {
                    this.menuIdnex = -1;
                }
            } else if (i == 5) {
                this.MapAttr(false);
                clearmap();
                this.menuIdnex = -1;
                this.ismapAttr = !this.ismapAttr;
                this.isArea = false;
                this.isLarge = false;
                this.isSmall = false;
                this.isLength = false;
            } else if (i == 6) {
                this.ismapAttr = !this.ismapAttr;
                this.MapAttr(this.ismapAttr);
                if (this.ismapAttr == false) {
                    this.menuIdnex = -1;
                }
            } else if (i == 7) {
                this.dialogVisible = true;
            } else if (i == 8) {
                // this.menuIdnex = 8;
                this.islegend = !this.islegend;
                Lenged();
                if (this.islegend == false) {
                    this.menuIdnex = -1;
                }
                // this.$message.error('该功能无法使用');
            } else if (i == 9) {
                // this.menuIdnex = 8;
                this.islayersort = !this.islayersort;
                console.log(i, this.islayersort, "---this.islayersort");
                if (this.islayersort == false) {
                    this.menuIdnex = -1;
                }
                // this.$message.error('该功能无法使用');
            }
        },
        closeDialog() {
            this.dialogVisible = false;
            this.menuIdnex = -1;
        },
        submit() {
            let app = this;
            if (this.leftlayer.label == "" && this.rightlayer.label == "") {
                this.$message.error("请选择图层");
                return;
            }
            this.showSwipe = true;
            this.$nextTick(function () {
                app.swipe(app.leftlayer, app.rightlayer);
            });

            this.dialogVisible = false;
            this.menuIdnex = -1;
        },
        consoleSub() {
            this.dialogVisible = false;
            this.menuIdnex = -1;
        },
        getswipelayer(treedata) {
            let app = this;
            let treelayer = treedata; //得到图层树数据
            for (let index = 0; index < treelayer.length; index++) {
                let d = treelayer[index];
                // if (d.childlist.length === 0) {
                if (d.level === "server") {
                    this.swipelayer.push(d);
                } else {
                    this.getswipelayer(d.childlist);
                }
            }
        },
        //跟随主页面底图显示
        showmap(view) {
            if (
                this.mapconfig.yxtlw.URL != "" &&
                this.mapconfig.sltlw.URL != ""
            ) {
                let img_wLayer = view.map.findLayerById("img_w");
                let cia_wLayer = view.map.findLayerById("cia_w");
                let vec_wLayer = view.map.findLayerById("vec_w");
                let cva_wLayer = view.map.findLayerById("cva_w");
                if (this.mapnumber == 1) {
                    //影像图显示
                    img_wLayer.visible = true; //影像图
                    cia_wLayer.visible = true; //影像图路网
                    vec_wLayer.visible = false; //矢量图
                    cva_wLayer.visible = false; //矢量图路网
                } else {
                    img_wLayer.visible = false; //影像图
                    cia_wLayer.visible = false; //影像图路网
                    vec_wLayer.visible = true; //矢量图
                    cva_wLayer.visible = true; //矢量图路网
                }
            } else {
                let img_wLayer = view.map.findLayerById("img_w");
                let vec_wLayer = view.map.findLayerById("vec_w");
                if (this.mapnumber == 1) {
                    //影像图显示
                    img_wLayer.visible = true; //影像图
                    vec_wLayer.visible = false; //矢量图
                } else {
                    img_wLayer.visible = false; //影像图
                    vec_wLayer.visible = true; //矢量图
                }
            }
        },
        //关闭卷帘底图
        closemap() {
            if (this.swipeflag == false) {
                this.view.map.basemap.baseLayers.map((item) => {
                    console.log(item.visible, item);
                    // item.visible = this.isshow;
                    if (item.visible == true) {
                        this.theBaseLayer = item;
                    }
                });
                this.swipeflag = true;
            }

            this.view.map.basemap.baseLayers.map((item) => {
                item.visible = this.isshow;
            });
            this.isshow = !this.isshow;
        },
        //卷帘
        swipe(obj0, obj1) {
            let app = this;
            let cia_w = null;
            let cva_w = null;
            var img_w = null;
            var vec_w = null;
            var basemap = null;
            switch (obj0.kind) {
                case 1:
                    var layer0 = new MapImageLayer({
                        id: obj0.label,
                        url: obj0.url,
                        opacity: 100,
                    });
                    break;
                case 5:
                    var layer0 = new TileLayer({
                        id: obj0.label,
                        url: obj0.url,
                        opacity: 100,
                    });
                    break;
            }
            switch (obj1.kind) {
                case 1:
                    var layer1 = new MapImageLayer({
                        id: obj1.label,
                        url: obj1.url,
                        opacity: 100,
                    });
                    break;
                case 5:
                    var layer1 = new TileLayer({
                        id: obj1.label,
                        url: obj1.url,
                        opacity: 100,
                    });
                    break;
            }

            app.view = initSplitMap("viewDiv");

            app.view.map.add(layer0);
            app.view.map.add(layer1);
            //app.showmap(app.view);
            const swipe = new Swipe({
                leadingLayers: [layer0],
                trailingLayers: [layer1],
                direction: "horizontal",
                position: 50, // set position of widget to 50%
                view: app.view,
            });
            app.view.ui.remove(["attribution", "zoom"]);
            //  add the widget to the view
            app.view.ui.add(swipe);
        },
        //左侧卷帘图层
        leftLayerChange(val) {
            this.leftlayer.label = val.label;
            this.leftlayer.url = val.url;
            this.leftlayer.kind = val.kind;
        },
        //右侧卷帘图层
        rightlayerChange(val) {
            this.rightlayer.label = val.label;
            this.rightlayer.url = val.url;
            this.rightlayer.kind = val.kind;
        },
        // 关闭卷帘
        closeSwipe() {
            this.showSwipe = false;
            this.leftlayer = {
                label: "",
                url: "",
                kind: "",
            };
            this.rightlayer = {
                label: "",
                url: "",
                kind: "",
            };

            this.view.map.basemap.baseLayers.map((item) => {
                item.visible = false;
            });
            this.isshow = false;
            this.swipeflag = false;
            this.theBaseLayer.visible = true;
        },
        //图层属性查询
        MapAttr(value) {
            let app = this;
            if (value) {
                //store.state["onemap-store"].mapview.map.
                store.commit("onemap-store/setSymbol");
                store.state["onemap-store"].mapview.viewClick = store.state[
                    "onemap-store"
                ].mapview.on("click", function (evt) {
                    // let attr_loading = null;
                    if (app.attr_loading != null) {
                        app.attr_loading.close();
                    }
                    // if (!store.state['onemap-store'].toolStatus.attr) {
                    //     return;
                    // }

                    app.mapIndex = 0;
                    app.identifyCount = 0;
                    app.IdentifyResultArr = [];
                    app.attr_loading = Message({
                        iconClass: "el-icon-loading",
                        message: "属性查询中......",
                        duration: 0,
                        customClass: "prop-search",
                    });

                    store.state["onemap-store"].mapview.graphics.removeAll();
                    if (store.state.userGraphicLayer != null) {
                        store.state.userGraphicLayer.graphics.removeAll();
                    }
                    app.getOpenAllLayers();

                    // var flayer=new FeatureLayer({
                    //   url:"http://192.168.1.132:6080/arcgis/rest/services/FQ/XZQHarcgis/MapServer/0"
                    // });
                    // store.state['onemap-store'].mapview.hitTest(evt).then(function (response) {
                    //   debugger
                    //   // if features are returned from the featureLayer, do something with results
                    //   if (response.results.length) {
                    //     // do something
                    //     console.log(response.results, "features returned");
                    //   }
                    // });

                    store.state["onemap-store"].mapview.when(async function () {
                        console.log(app.openallLayers, "app.openallLayers");
                        //循环查询打开图层的属性
                        for (
                            var i = 0, k = app.openallLayers.length;
                            i < k;
                            i++
                        ) {
                            app.mapIndex++;
                            var layername = app.openallLayers[i]["id"];
                            var childIdArr = new Array();
                            for (
                                var j = 0,
                                    jk =
                                        app.openallLayers[i]["allSublayers"]
                                            .items.length;
                                j < jk;
                                j++
                            ) {
                                if (
                                    app.openallLayers[i]["allSublayers"].items[
                                        j
                                    ].visible
                                ) {
                                    childIdArr.push(
                                        app.openallLayers[i]["allSublayers"]
                                            .items[j]["id"]
                                    );
                                }
                            }
                            if (childIdArr.length > 0) {
                                if (store.state.userGraphicLayer == null) {
                                    store.state.userGraphicLayer =
                                        new GraphicsLayer("attrGraphics");
                                }
                                var identifyparams = new IdentifyParameters();
                                identifyparams.tolerance = 1;
                                identifyparams.layerIds = childIdArr?.reverse();
                                identifyparams.layerOption = "all";
                                identifyparams.width =
                                    store.state["onemap-store"].mapview.width;
                                identifyparams.height =
                                    store.state["onemap-store"].mapview.height;
                                identifyparams.geometry = evt.mapPoint;
                                identifyparams.mapExtent =
                                    store.state["onemap-store"].mapview.extent;
                                IdentifyParameters.returnFieldName = true;
                                identifyparams.returnGeometry = true;
                                await identify
                                    .identify(
                                        app.openallLayers[i]["url"],
                                        identifyparams
                                    )
                                    .then(async function (result) {
                                        if (result != null) {
                                            if (result.results.length > 0) {
                                                for (
                                                    var i = 0,
                                                        ik =
                                                            result.results
                                                                .length;
                                                    i < ik;
                                                    i++
                                                ) {
                                                    var displayname =
                                                        result.results[i]
                                                            .displayFieldName;
                                                    var feature =
                                                        result.results[i]
                                                            .feature;
                                                    var fields = Object.keys(
                                                        feature.attributes
                                                    );
                                                    var attrArr = new Array();
                                                    var displayfiledvalue = "";
                                                    for (
                                                        var k = 0,
                                                            kk = fields.length;
                                                        k < kk;
                                                        k++
                                                    ) {
                                                        if (
                                                            fields[k].indexOf(
                                                                "SHAPE"
                                                            ) < 0
                                                        ) {
                                                            if (k == 1) {
                                                                let object =
                                                                    new Object();
                                                                object.name =
                                                                    "图层名称";
                                                                object.value =
                                                                    result.results[
                                                                        i
                                                                    ].layerName;
                                                                attrArr.push(
                                                                    object
                                                                );
                                                            }
                                                            var object =
                                                                new Object();
                                                            object.name =
                                                                fields[k];
                                                            object.value =
                                                                feature.attributes[
                                                                    fields[k]
                                                                ];
                                                            attrArr.push(
                                                                object
                                                            );

                                                            if (
                                                                object.name ==
                                                                displayname
                                                            ) {
                                                                displayfiledvalue =
                                                                    object.value;
                                                            }
                                                        }
                                                        if (
                                                            fields[k] ==
                                                            "SHAPE.AREA"
                                                        ) {
                                                            var object =
                                                                new Object();
                                                            object.name =
                                                                fields[k];

                                                            object.value =
                                                                feature.attributes[
                                                                    fields[k]
                                                                ];
                                                            attrArr.push(
                                                                object
                                                            );
                                                        }
                                                    }

                                                    //添加图形到临时图层
                                                    var graphic;
                                                    if (
                                                        result.results[i]
                                                            .feature.geometry
                                                            .type == "point"
                                                    ) {
                                                        graphic = new Graphic({
                                                            geometry:
                                                                feature.geometry,
                                                            symbol: {
                                                                type: "simple-marker",
                                                                outline: {
                                                                    width: 0.5,
                                                                    color: "red",
                                                                },
                                                            },
                                                        });
                                                    } else {
                                                        graphic = new Graphic({
                                                            geometry:
                                                                feature.geometry,
                                                            symbol: {
                                                                type: "simple-fill",
                                                                color: [
                                                                    255, 255, 0,
                                                                    0.2,
                                                                ],
                                                                style: "solid",
                                                                outline: {
                                                                    color: "red",
                                                                    width: 2,
                                                                },
                                                            },
                                                        });
                                                    }

                                                    //添加图形到临时图层
                                                    var graphic = new Graphic({
                                                        geometry:
                                                            feature.geometry,
                                                        symbol: {
                                                            type: "simple-fill",
                                                            color: [
                                                                255, 255, 0,
                                                                0.2,
                                                            ],
                                                            style: "solid",
                                                            outline: {
                                                                color: "red",
                                                                width: 2,
                                                            },
                                                        },
                                                    });
                                                    //添加到属性数组
                                                    var obj = new Object();
                                                    obj.value =
                                                        app.identifyCount;
                                                    obj.name = layername;
                                                    obj.displayfieldvalue =
                                                        displayfiledvalue
                                                            ? displayfiledvalue
                                                            : attrArr[0].value;
                                                    obj.fieldvalues = attrArr;
                                                    obj.graphic = graphic;
                                                    app.IdentifyResultArr.push(
                                                        obj
                                                    );

                                                    app.identifyCount++;
                                                    // store.state[
                                                    //   'onemap-store'
                                                    // ].mapview.graphics.add(graphic);
                                                    // store.state[
                                                    //   'onemap-store'
                                                    // ].mapview.extent =
                                                    //   graphic.geometry.extent;
                                                    // store.state[
                                                    //   'onemap-store'
                                                    // ].mapview.zoom =
                                                    //   store.state['onemap-store'].mapview
                                                    //     .zoom - 2;
                                                    store.state.userGraphicLayer.graphics.add(
                                                        graphic
                                                    );
                                                }
                                            }
                                        }
                                    })
                                    .catch(function (e) {
                                        app.$message.warning(e.message);
                                        return false;
                                    });
                            }
                        }
                        if (app.mapIndex == app.openallLayers.length) {
                            setTimeout(() => {
                                app.attr_loading.close();
                            }, 1000);
                            //callback(IdentifyResultArr);
                            store.commit(
                                "onemap-store/attrTableData",
                                app.IdentifyResultArr
                            );
                            if (app.IdentifyResultArr.length > 0) {
                                setTimeout(() => {
                                    app.attr_loading.close();
                                }, 1000);
                                store.commit(
                                    "onemap-store/attrdialogstatus",
                                    true
                                );
                            } else {
                                setTimeout(() => {
                                    app.attr_loading.close();
                                }, 1000);
                            }
                        } else {
                            setTimeout(() => {
                                app.attr_loading.close();
                            }, 1000);
                        }
                    });
                });
            } else {
                if (store.state["onemap-store"].mapview.viewClick != null) {
                    store.state["onemap-store"].mapview.viewClick.remove();
                    store.state["onemap-store"].mapview.viewClick == null;
                }
            }
        },
        //获取已打开的图层
        getOpenAllLayers() {
            let app = this;
            app.openallLayers = [];
            app.openfeaturelayers = [];
            //获取地图上的全部图层
            app.allLayers = store.state["onemap-store"].mapview.map.layers;
            //获取已打开的图层
            if (app.allLayers.length > 0) {
                for (let i = 0, k = app.allLayers.items.length; i < k; i++) {
                    if (
                        app.allLayers.items[i]["id"] != "lengthLrc" &&
                        app.allLayers.items[i]["id"] != "basemap_layer" &&
                        app.allLayers.items[i]["id"].indexOf("影像图") < 0 &&
                        app.allLayers.items[i]["id"] != "img_w" &&
                        app.allLayers.items[i]["id"] != "vec_w" &&
                        // app.allLayers.items[i].type != 'tile' &&
                        app.allLayers.items[i].title != null &&
                        app.allLayers.items[i].type != "graphics"
                    ) {
                        var layeritem = app.allLayers.items[i];
                        if (layeritem.visible) {
                            var isadd = false;
                            for (
                                var j = 0, jk = layeritem.sublayers.length;
                                j < jk;
                                j++
                            ) {
                                if (layeritem.sublayers.items[j].visible) {
                                    isadd = true;
                                    console.log(
                                        "layeritem",
                                        layeritem.sublayers.items[j]
                                    );

                                    // app.openfeaturelayers.push(new FeatureLayer({
                                    //   url:layeritem.sublayers.items[j].url
                                    // }));
                                    break;
                                }
                            }
                            if (isadd) {
                                app.openallLayers.push(layeritem);
                            }
                        }
                    }
                }
            }
        },
    },
};
</script>
<style lang="scss" scoped>
.mapcontrol {
    background: #ffffff;
    position: absolute;
    top: 10vh;
    right: 2vw;
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 3.5vh;

    .active {
        color: #0000ff;
    }

    span {
        font-size: 14px;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        border-right: solid #d3d3d3 1px;
        // width: 65px;
        height: 3vh;
        padding: 0 8px;
        cursor: pointer;

        i {
            width: 14px;
            height: 14px;
            display: block;
            margin-right: 3px;
        }
    }

    span:hover {
        cursor: pointer;
    }

    .big {
        background: url("../../../assets/onemap/big.png") no-repeat;
        background-size: contain;
    }

    .small {
        background-image: url("../../../assets/onemap/small.png");
    }

    .all {
        background-image: url("../../../assets/onemap/all.png");
    }

    .length {
        background-image: url("../../../assets/onemap/length.png");
    }

    .area {
        background-image: url("../../../assets/onemap/area.png");
    }

    .clear {
        background-image: url("../../../assets/onemap/clear.png");
    }

    .attribute {
        background-image: url("../../../assets/onemap/attribute.png");
    }

    .legend {
        background-image: url("../../../assets/onemap/legend.png");
    }

    .swipe {
        background-image: url("../../../assets/onemap/swipe.png");
        background-size: contain;
    }
}

::v-deep .selectSwipe {
    width: 380px;
    height: auto;
    margin: 0 !important;
    position: absolute;
    top: 10vh;
    left: 17vw;
    opacity: 0.9;

    .el-dialog__header {
        padding: 6px !important;
        padding-left: 20px !important;
        border-bottom: 1px solid #d7d7d7;
        background: #126ac4;

        .el-dialog__title {
            color: #fff;
            letter-spacing: 2px;
        }

        .el-dialog__headerbtn {
            top: 10px !important;

            .el-dialog__close {
                color: #fff;
            }
        }
    }

    .el-dialog__body {
        // padding: 20px !important;
        padding-left: 20px !important;
        padding-top: 20px !important;
        padding-right: 20px !important;
        padding-bottom: 0px !important;
    }

    .el-form-item__label {
        font-weight: 700;
    }

    .el-dialog__footer {
        text-align: center;
    }
}

::v-deep .viewDiv {
    width: 100vw;
    height: 92vh;
    position: absolute;
    z-index: 10;
    top: 8vh;
    left: 0;
    background: white;

    // border-right: 1px solid #ccc;
    .close-swipe {
        position: absolute;
        right: 20px;
        top: 20px;
    }

    .close-map {
        position: absolute;
        right: 80px;
        top: 20px;
    }
}

::v-deep .esri-swipe__container {
    outline: none;
}

.tuli {
    // display: none;
    width: 78vw;
    height: 25vh;
    position: absolute;
    top: 75vh;
    left: 48.9vw;
    background: url("@/assets/onemap/tuli.png") no-repeat;
    background-size: 65%;
}
</style>
