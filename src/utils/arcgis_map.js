import Basemap from "@arcgis/core/Basemap";
import Map from "@arcgis/core/Map";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";
import TileLayer from "@arcgis/core/layers/TileLayer";
import Sketch from "@arcgis/core/widgets/Sketch";
import Zoom from "@arcgis/core/widgets/Zoom";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import WebTileLayer from "@arcgis/core/layers/WebTileLayer";
import MapView from "@arcgis/core/views/MapView";
import Font from "@arcgis/core/symbols/Font";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";
import TextSymbol from "@arcgis/core/symbols/TextSymbol";
import LengthsParameters from "@arcgis/core/rest/support/LengthsParameters";
import Point from "@arcgis/core/geometry/Point";
import Polyline from "@arcgis/core/geometry/Polyline";
import * as intl from "@arcgis/core/intl";
import AreasAndLengthsParameters from "@arcgis/core/rest/support/AreasAndLengthsParameters";
import Graphic from "@arcgis/core/Graphic";
import * as geometryService from "@arcgis/core/rest/geometryService";
import Legend from "@arcgis/core/widgets/Legend";
import IdentifyParameters from "@arcgis/core/rest/support/IdentifyParameters";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import * as identify from "@arcgis/core/rest/identify";
import Popup from "@arcgis/core/widgets/Popup";
import Swipe from "@arcgis/core/widgets/Swipe";
import BasemapGallery from "@arcgis/core/widgets/BasemapGallery";
import TileInfo from "@arcgis/core/layers/support/TileInfo";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import * as projection from "@arcgis/core/geometry/projection";

import esriId from "@arcgis/core/identity/IdentityManager";

import * as query from "@arcgis/core/rest/query";
import Query from "@arcgis/core/rest/support/Query";
//以上为新添加 2022/9/16
import http from "./request";
import userconfig from "@/utils/userconfig.js";
import Vue from "vue";
import { getMapConfig, getMapConfigList } from "../api/arcgis-api";
import {
    writeMapServerLog,
    getMapGeometryService,
} from "@/views/onemap/api/onemap";
import { getServer } from "@/views/onemap/api/onemapAPi";
import { getBaseMapAPI } from "../api/arcgis-api";
import { getPargrams, authfields } from "../views/paint/api/paint";
import store from "@/store/index";
import { mapGetters, mapMutations, mapState } from "vuex";
import { Notification, Loading, Message } from "element-ui";
import ScaleBar from "@arcgis/core/widgets/ScaleBar";

var rjhj_layer = null;
// var userconfig = userconfig
var usergeometry = null;
var defaultlayerlist = []; //加载到地图的所有图层
var Name_Layer_obj = []; //记录图层的id
var zoom = null;
var view = null;
var sketch = null;
var sketch_area = null;
var sketch_LS = null;
var toolGraphicLayer = null;
var graphicLengthLrc = null;
var lengedLayerlist = [];
var maplegend = null;
var openlayerlist = []; //所有打开的图层
var usercode = 1;
var mapcenter = []; //底图中心点
var viewClickevent = null;
var layerdata = null;
var identifylayers = [];
//属性查询所用参数↓
var identifyCount = 0;
var mapIndex = 0;
var IdentifyResultArr = []; //保存属性查询的结果数据
var areaURL = null;
var legendLayers = []; //图层图例存放
var view2 = null; //业绩画像view对象
var graphic1 = null; //业绩画像线图形
var isyxtlw = true; //判断是否存在影像图路网
var issltlw = true; //判断是否存在矢量图路网
var mapscale = null;
var app = this;

let showGraphics = null;
let clickmappoint = null;
//初始化参数
export async function initparams() {
    const { data: res } = await http.get("/UserConfig/GetBaseMap");
    var d = res.data;
    basemap = {
        basemapurl: d.url,
        basetype: d.type,

        mapwkid: d.wkid,
        ///mapwkid:4490,
        //全图坐标范围
        startExtent: {
            min_x: d.xmin,
            min_y: d.ymin,
            max_x: d.xmax,
            max_y: d.ymax,
        },
        serverUrl: [d.serverurl],
        // proxyUrl: window.location.protocol + '//' + window.location.host + "/DotNet/proxy.ashx"
        proxyUrl: "/DotNet/proxy.ashx",
    };
}

//获取底图配置
async function getmap(name) {
    const data = await getMapConfig({
        modulename: name,
    });
    if (data.code === 200) {
        if (data.data != "") {
            return data.data;
        }
    }
}

async function getServiceUrl() {
    const data = await getMapGeometryService();
    if (data.code === 200) {
        return data.data.MAPGEOMETRYSERVICEURL;
    }
}

//初始化地图
export async function init() {
    // 创建二维底图
    // 创建二维底图
    let yxtData = await getMapConfigList({ modulename: "影像图" });
    let sltData = await getMapConfigList({ modulename: "矢量图" });

    let yxtDatas = yxtData.data.flat();
    let sltDatas = sltData.data.flat();

    areaURL = await getServiceUrl();
    var spatialRef = new SpatialReference({
        wkid: 4490,
    });
    let basemap = new Basemap({
        baseLayers: [],
        title: "basemap",
        id: "basemap",
    });

    mapscale = 3300000; //初始化地图比例
    if (yxtDatas.length > 0) {
        await loadBaseMapLayer(basemap, yxtDatas);
        mapscale = Number(yxtDatas[0].SERVERURL); //初始化地图比例
    }

    if (sltDatas.length > 0) {
        await loadBaseMapLayer(basemap, sltDatas);
    }

    let map = new Map({
        basemap: basemap,
    });

    mapcenter = [117.44, 25.86];
    view = new MapView({
        map: map,
        container: "map",
        navigation: {
            momentumEnabled: false,
        },
        scale: mapscale,
        center: mapcenter,
    });

    view.ui.remove(["attribution", "zoom"]);
    //添加比例尺
    let scaleBar = new ScaleBar({
        view: view,
        unit: "metric",
        style: "ruler",
    });
    view.ui.add(scaleBar, { position: "bottom-right" });
    //初始化底图控件
    zoom = new Zoom({
        view: view,
    });
    toolGraphicLayer = new GraphicsLayer({
        listMode: "hide",
    });
    graphicLengthLrc = new GraphicsLayer({ id: "lengthLrc", listMode: "hide" });

    sketch = new Sketch({
        layer: graphicLengthLrc,
        view: view,
    });
    sketch_area = new Sketch({
        layer: graphicLengthLrc,
        view: view,
    });
    sketch_LS = new Sketch({
        layer: graphicLengthLrc,
        view: view,
    });
    store.commit("onemap-store/mapview", view);
    view.map.add(graphicLengthLrc);
    view.map.add(toolGraphicLayer);
    view.when(async function () {
        Lenged();
    });
}

/**
 * 加载底图
 */
var tk = "a6798a0c841004f84487f874a146cba6";

var spatialRef = new SpatialReference({
    wkid: 4490,
});

var origin = new Point({
    x: -180,
    y: 90,
    spatialReference: spatialRef,
});
var tileInfoGJ = new TileInfo({
    dpi: 96,
    //compressionQuality: 0,
    format: "image/png",
    spatialReference: spatialRef,
    size: 256,
    origin: origin,
    lods: [
        {
            level: 0,
            levelValue: 1,
            resolution: 0.703125,
            scale: 295497593.05875003,
        },
        {
            level: 1,
            levelValue: 2,
            resolution: 0.3515625,
            scale: 147748796.52937502,
        },
        {
            level: 2,
            levelValue: 3,
            resolution: 0.17578125,
            scale: 73874398.264687508,
        },
        {
            level: 3,
            levelValue: 4,
            resolution: 0.087890625,
            scale: 36937199.132343754,
        },
        {
            level: 4,
            levelValue: 5,
            resolution: 0.0439453125,
            scale: 18468599.566171877,
        },
        {
            level: 5,
            levelValue: 6,
            resolution: 0.02197265625,
            scale: 9234299.7830859385,
        },
        {
            level: 6,
            levelValue: 7,
            resolution: 0.010986328125,
            scale: 4617149.8915429693,
        },
        {
            level: 7,
            levelValue: 8,
            resolution: 0.0054931640625,
            scale: 2308574.9457714846,
        },
        {
            level: 8,
            levelValue: 9,
            resolution: 0.00274658203125,
            scale: 1154287.4728857423,
        },
        {
            level: 9,
            levelValue: 10,
            resolution: 0.001373291015625,
            scale: 577143.73644287116,
        },
        {
            level: 10,
            levelValue: 11,
            resolution: 0.0006866455078125,
            scale: 288571.86822143558,
        },
        {
            level: 11,
            levelValue: 12,
            resolution: 0.00034332275390625,
            scale: 144285.93411071779,
        },
        {
            level: 12,
            levelValue: 13,
            resolution: 0.000171661376953125,
            scale: 72142.967055358895,
        },
        {
            level: 13,
            levelValue: 14,
            resolution: 8.58306884765625e-5,
            scale: 36071.483527679447,
        },
        {
            level: 14,
            levelValue: 15,
            resolution: 4.291534423828125e-5,
            scale: 18035.741763839724,
        },
        {
            level: 15,
            levelValue: 16,
            resolution: 2.1457672119140625e-5,
            scale: 9017.8708819198619,
        },
        {
            level: 16,
            levelValue: 17,
            resolution: 1.0728836059570313e-5,
            scale: 4508.9354409599309,
        },
        {
            level: 17,
            levelValue: 18,
            resolution: 5.3644180297851563e-6,
            scale: 2254.4677204799655,
        },
        {
            level: 18,
            levelValue: 19,
            resolution: 2.68220901489257815e-6,
            scale: 1127.23386023998275,
        },
        {
            level: 19,
            levelValue: 20,
            resolution: 1.341104507446289075e-6,
            scale: 563.616930119991375,
        },
    ],
});
export function getBaseMapLayer(baseMapData) {
    // var tk = "a6798a0c841004f84487f874a146cba6";

    // var spatialRef = new SpatialReference({
    //     wkid: 4490,
    // });

    // var origin = new Point({
    //     x: -180,
    //     y: 90,
    //     spatialReference: spatialRef,
    // });
    // var tileInfoGJ = new TileInfo({
    //     dpi: 96,
    //     //compressionQuality: 0,
    //     format: "image/png",
    //     spatialReference: spatialRef,
    //     size: 256,
    //     origin: origin,
    //     lods: [
    //         {
    //             level: 0,
    //             levelValue: 1,
    //             resolution: 0.703125,
    //             scale: 295497593.05875003,
    //         },
    //         {
    //             level: 1,
    //             levelValue: 2,
    //             resolution: 0.3515625,
    //             scale: 147748796.52937502,
    //         },
    //         {
    //             level: 2,
    //             levelValue: 3,
    //             resolution: 0.17578125,
    //             scale: 73874398.264687508,
    //         },
    //         {
    //             level: 3,
    //             levelValue: 4,
    //             resolution: 0.087890625,
    //             scale: 36937199.132343754,
    //         },
    //         {
    //             level: 4,
    //             levelValue: 5,
    //             resolution: 0.0439453125,
    //             scale: 18468599.566171877,
    //         },
    //         {
    //             level: 5,
    //             levelValue: 6,
    //             resolution: 0.02197265625,
    //             scale: 9234299.7830859385,
    //         },
    //         {
    //             level: 6,
    //             levelValue: 7,
    //             resolution: 0.010986328125,
    //             scale: 4617149.8915429693,
    //         },
    //         {
    //             level: 7,
    //             levelValue: 8,
    //             resolution: 0.0054931640625,
    //             scale: 2308574.9457714846,
    //         },
    //         {
    //             level: 8,
    //             levelValue: 9,
    //             resolution: 0.00274658203125,
    //             scale: 1154287.4728857423,
    //         },
    //         {
    //             level: 9,
    //             levelValue: 10,
    //             resolution: 0.001373291015625,
    //             scale: 577143.73644287116,
    //         },
    //         {
    //             level: 10,
    //             levelValue: 11,
    //             resolution: 0.0006866455078125,
    //             scale: 288571.86822143558,
    //         },
    //         {
    //             level: 11,
    //             levelValue: 12,
    //             resolution: 0.00034332275390625,
    //             scale: 144285.93411071779,
    //         },
    //         {
    //             level: 12,
    //             levelValue: 13,
    //             resolution: 0.000171661376953125,
    //             scale: 72142.967055358895,
    //         },
    //         {
    //             level: 13,
    //             levelValue: 14,
    //             resolution: 8.58306884765625e-5,
    //             scale: 36071.483527679447,
    //         },
    //         {
    //             level: 14,
    //             levelValue: 15,
    //             resolution: 4.291534423828125e-5,
    //             scale: 18035.741763839724,
    //         },
    //         {
    //             level: 15,
    //             levelValue: 16,
    //             resolution: 2.1457672119140625e-5,
    //             scale: 9017.8708819198619,
    //         },
    //         {
    //             level: 16,
    //             levelValue: 17,
    //             resolution: 1.0728836059570313e-5,
    //             scale: 4508.9354409599309,
    //         },
    //         {
    //             level: 17,
    //             levelValue: 18,
    //             resolution: 5.3644180297851563e-6,
    //             scale: 2254.4677204799655,
    //         },
    //         {
    //             level: 18,
    //             levelValue: 19,
    //             resolution: 2.68220901489257815e-6,
    //             scale: 1127.23386023998275,
    //         },
    //         {
    //             level: 19,
    //             levelValue: 20,
    //             resolution: 1.341104507446289075e-6,
    //             scale: 563.616930119991375,
    //         },
    //     ],
    // });
    const fullextent = {
        xmin: 119.14776259989209,
        ymin: 25.318505205651761,
        xmax: 119.69494497709333,
        ymax: 25.836816150890314,
        spatialReference: { wkid: 4490 },
    };
    let baseUrl = baseMapData.URL;

    if (baseMapData.TYPE == "Tile") {
        if (baseUrl.includes("tianditu")) {
            return new WebTileLayer({
                urlTemplate: baseUrl + tk,
                subDomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"],
                id: baseMapData.PID,
                tileInfo: tileInfoGJ,
                spatialReference: spatialRef,
                visible: baseMapData.defaultchoose,
            }); //影像图
        }
        // else if (baseUrl.includes("MapServer")) {
        //     return new MapImageLayer({
        //         url: baseUrl,
        //         id: baseMapData.PID,
        //         visible: baseMapData.defaultchoose
        //     })
        // }
        else {
            return new TileLayer({
                url: baseUrl,
                id: baseMapData.PID,
                visible: baseMapData.defaultchoose,
            });
        }
    } else if (baseMapData.TYPE == "Image") {
        return new MapImageLayer({
            url: baseUrl,
            id: baseMapData.PID,
            visible: baseMapData.defaultchoose,
        });
    } else {
        return null;
    }
}

/**
 * 加载底图
 */
export async function loadBaseMapLayer(basemap, baseMapData) {
    baseMapData.forEach(async (element) => {
        let layer = await getBaseMapLayer(element);
        basemap.baseLayers.add(layer);
    });
}

/**
 * 根据当前地图初始化其他地图
 */
export function initSplitMap(mapContainer) {
    let basemap = new Basemap({
        baseLayers: view.map.basemap.baseLayers,
        title: "basemap",
        id: "basemap",
    });
    let map = new Map({
        basemap: basemap,
    });

    return new MapView({
        map: map,
        container: mapContainer,

        navigation: {
            momentumEnabled: false,
        },
        scale: view.scale,
        center: view.center,
    });
}

export let mapShow = false;
export let isshow = false;

let fieldsName = [];
let showFields = [];
//历史画像地图加载
export async function init2(x, y) {
    const mapURL = await getmap("历史画像");
    let app = this;
    var url = mapURL.URL;
    // 获取属性别名
    let { data: res } = await authfields();
    fieldsName = res;
    let queryObject = new Query({
        where: "1=1",
        outFields: ["*"],
        returnGeometry: false,
    });
    query.executeQueryJSON(url + "/0", queryObject).then(function (response) {
        let c = [...fieldsName].filter((x) =>
            [...response.fields].some((y) => {
                return y.name === x.fieldName ? (x.alias = y.alias) : "";
            })
        );
    });

    // var url = 'http://192.168.1.154:6080/arcgis/rest/services/FJSY/FJSY/MapServer'
    let baselayer = new MapImageLayer({
        url: url,
        id: "basemap0",
        // dpi:64,
        imageFormat: "png8",
        // sublayers:[
        //     {
        //         id:0
        //     }
        // ]
    });
    let basemap = new Basemap({
        baseLayers: [baselayer],
        title: "basemap",
        id: "basemap",
    });

    let map = new Map({
        basemap: basemap,
        // maxScale: 5000000,//最大空间等级
        // minScale: 100000,//最小空间等级
    });
    view2 = new MapView({
        map: map,
        container: "mapbox",
        constraints: {
            maxScale: 2500000,
            minScale: 300000,
        },
        center: [118.15, 25.83],
        scale: 2600000,
    });

    const graphicsLayer = new GraphicsLayer();
    map.add(graphicsLayer);
    graphicLyr = map.findLayerById("lineGraphic");
    if (!graphicLyr) {
        graphicLyr = new GraphicsLayer({
            id: "lineGraphic",
        });
        map.layers.add(graphicLyr);
    }
    graphicLyr.removeAll();

    view2.ui.remove(["attribution", "zoom"]);
    view2.when(() => {
        view2.watch("scale", function (event) {
            if (mapShow) {
                drawLeadLine("mappop");
            }
            if (isshow) {
                drawLeadLine("parnum");
            }
        });
        view2.on("drag", function (event) {
            if (mapShow) {
                drawLeadLine("mappop");
            }
            if (isshow) {
                drawLeadLine("parnum");
            }
        });

        view2.on("click", async (evt) => {
            if (view2.scale <= 1500000) {
                return false;
            }
            // graphicsLayer.removeAll();
            view2.graphics.removeAll();
            let identifyparams = new IdentifyParameters({
                tolerance: 1,
                layerOption: "visible",
                geometry: evt.mapPoint,
                width: view2.width,
                height: view2.height,
                returnGeometry: true,
                mapExtent: view2.extent,
            });
            let point = new Point({
                x: x,
                y: y,
            });
            // let diglt = view2.toMap(point);
            const data = await identify.identify(url, identifyparams);
            if (data.results.length > 0) {
                isshow = true;
                mapShow = false;
                store.commit("onemap-store/setAttrData", { show: false });
            }
            let geometry = data.results[0]?.feature.geometry;
            // let paths = [[geometry?.centroid.x, geometry?.centroid.y],
            // [diglt.x - 0.1, diglt.y - 0.1],
            // [diglt.x + 0.01, diglt.y - 0.1]];
            clickmappoint = geometry.extent.center;
            drawLeadLine("parnum");
            let graphic = new Graphic({
                geometry: geometry,
                symbol: {
                    type: "simple-fill", // autocasts as new SimpleMarkerSymbol()
                    color: [0, 183, 248, 0.8],
                    size: 8,
                    outline: {
                        color: [255, 255, 255],
                        width: 1,
                    },
                },
            });
            view2.graphics.add(graphic); //添加地图高亮
            // graphicsLayer.add(graphic);//添加地图高亮
            // view2.graphics.add(graphic1);//添加线
            // showline(evt.x,evt.y);
            let updata = null;
            let getNum = null;
            updata = data.results[0]?.feature.attributes["行政区名称"];
            if (data.results[0]?.layerId == 0) {
                getNum = await getPargrams({ district: updata });
            } else {
                getNum = await getPargrams({ city: updata });
            }
            let is = {
                boolean: true,
                getnum: getNum.data,
                name: updata,
            };
            store.commit("onemap-store/setishow", is);
        });
        // 添加点击事件监听器
        view2.on("click", function (event) {
            console.log(view2.scale);
            if (view2.scale > 1500000) {
                return false;
            }
            console.log(event.mapPoint);
            // let queryObject = new Query({
            //     where: '1=1',
            //     outFields: ['*'],
            //     geometry:event.mapPoint,
            //     returnGeometry: true,
            //     distance:100,
            //     units:'meters'

            //   });
            //  query.executeQueryJSON(url+'/0', queryObject).then(function (response) {
            let identifyparams = new IdentifyParameters({
                tolerance: 3,
                layerOption: "visible",
                geometry: event.mapPoint,
                // width: view2.width,
                // height: view2.height,
                returnGeometry: true,
                mapExtent: view2.extent,
                layerIds: [0],
            });

            identify
                .identify(url, identifyparams)
                .then(function (response) {
                    console.log(response.features);
                    if (response.results.length > 0) {
                        isshow = false;
                        mapShow = true;
                        store.commit("onemap-store/setishow", {
                            boolean: false,
                        });
                        showGraphics = response.results;
                        getShowContent(1);
                    }
                })
                .catch(function (error) {
                    console.log("Error: ", error);
                });
        });
    });
}
export const currentMapChange = (val) => {
    // mpageNo = val
    if (val - 1 <= showGraphics.length) {
        getShowContent(val);
    }
};

export const getShowContent = (val) => {
    if (val > showGraphics.length) {
        return;
    }
    isshow = false;
    mapShow = true;
    let curGraphic = showGraphics[val - 1];
    let graphicAttributes = null;
    let mapPoint = null;
    let content = null;

    const highFeature = curGraphic.feature;
    if (highFeature.geometry.type.toLowerCase() == "point") {
        mapPoint = highFeature.geometry;
    } else {
        mapPoint = highFeature.geometry.extent.center;
    }
    graphicAttributes = highFeature.attributes;
    console.log(graphicAttributes);

    if (highFeature.geometry.type == "point") {
        let graphic = new Graphic({
            geometry: highFeature.geometry,
            symbol: {
                type: "simple-marker",
                color: "green",
                style: "circle",
                size: "7px",
            },
        });

        view2.graphics.removeAll();
        view2.graphics.add(graphic);
    }

    if (Boolean(graphicAttributes)) {
        showFields = [];
        // if ('OBJECTID' in graphicAttributes) {
        //     getLayerInfoFile(graphicAttributes['OBJECTID']);
        // }
        fieldsName.forEach(function (item) {
            console.log(item);
            let fieldName = item.alias;

            if (fieldName in graphicAttributes) {
                let fieldValue = graphicAttributes[fieldName];
                // if (item.fieldType.toLowerCase() == "date") {
                //     var date = getDate('yyyy-MM-dd', fieldValue); //获取一个时间对象
                //     fieldValue = date;
                // }
                showFields.push({
                    fieldDesc: item.fieldDesc,
                    fieldValue: fieldValue,
                });
            }
            // for (const key in graphicAttributes) {
            //     if (Object.hasOwnProperty.call(graphicAttributes, key)) {

            //         const element = graphicAttributes[key];
            //         showFields.push({
            //             fieldDesc: key,
            //             fieldValue: element
        });

        // }
        // }

        let is = {
            show: true,
            // showGraphics: showGraphics,
            mtotal: showGraphics.length,
            fileds: showFields,
        };
        store.commit("onemap-store/setAttrData", is);

        clickmappoint = mapPoint;
        drawLeadLine("mappop");
    }
};

export function clearShowMap() {
    if (graphicLyr) {
        view2.graphics.removeAll();
        graphicLyr.removeAll();
    }
    // if (highlightLayer) {
    //   highlightLayer.removeAll();
    // }
    mapShow = false;
    isshow = false;
    showGraphics = [];
    polylineGraphic = null;
}

let graphicLyr = null;
let polylineGraphic = null;
let dockscreenpoint = null;
export function drawLeadLine(classNamee) {
    // mapShow = true
    let focusDom = document.getElementsByClassName(classNamee)[0];

    let divHeight = 428.95;
    let divWidth = 320;
    let dOffLenght = 30;
    if (classNamee == "parnum") {
        console.log(classNamee);
        divHeight = 295;
        divWidth = 320;
    }
    if (focusDom.offsetHeight > 0) {
        divHeight = focusDom.offsetHeight;
    }

    if (focusDom.offsetWidth > 0) {
        divWidth = focusDom.offsetWidth;
    }

    // 地图坐标点转屏幕点
    const screenPoint = view2.toScreen({
        x: clickmappoint.x,
        y: clickmappoint.y,
        spatialReference: view2.spatialReference,
    });

    let pathRight = view2.toMap({
        x: screenPoint.x + 30,
        y: screenPoint.y,
        spatialReference: view2.spatialReference,
    });

    const screenLeftTop = view2.toScreen({
        x: view2.extent.xmin,
        y: view2.extent.ymax,
        spatialReference: view2.spatialReference,
    });

    const screenRightBottom = view2.toScreen({
        x: view2.extent.xmax,
        y: view2.extent.ymin,
        spatialReference: view2.spatialReference,
    });

    let mapExtentCenter = view2.center;
    //判断点击点和中心点的位置关系
    let dockPosition = 4; //象限 1-左上 2-右上 3-左下 4-右下
    //右上
    if (
        clickmappoint.x >= mapExtentCenter.x &&
        clickmappoint.y >= mapExtentCenter.y
    ) {
        dockPosition = 1;
    } //左上
    else if (
        clickmappoint.x <= mapExtentCenter.x &&
        clickmappoint.y >= mapExtentCenter.y
    ) {
        dockPosition = 2;
    } //左下
    else if (
        clickmappoint.x <= mapExtentCenter.x &&
        clickmappoint.y <= mapExtentCenter.y
    ) {
        dockPosition = 3;
    } //右下
    else if (
        clickmappoint.x >= mapExtentCenter.x &&
        clickmappoint.y <= mapExtentCenter.y
    ) {
        dockPosition = 4;
    }

    //弹框在斜对角
    if (focusDom) {
        switch (dockPosition) {
            case 1:
                focusDom.style.left = "1%";
                focusDom.style.bottom = "1%";
                focusDom.style.right = "inherit";
                focusDom.style.top = "inherit";

                pathRight = view2.toMap({
                    x: screenPoint.x - dOffLenght,
                    y: screenPoint.y,
                    spatialReference: view2.spatialReference,
                });

                dockscreenpoint = {
                    x: screenRightBottom.x * 0.01 + divWidth / 2,
                    y: screenRightBottom.y * 0.99 - divHeight,
                };

                break;
            case 2:
                focusDom.style.left = "inherit";
                focusDom.style.top = "inherit";
                focusDom.style.right = "1%";
                focusDom.style.bottom = "1%";

                pathRight = view2.toMap({
                    x: screenPoint.x + dOffLenght,
                    y: screenPoint.y,
                    spatialReference: view2.spatialReference,
                });

                dockscreenpoint = {
                    x: screenRightBottom.x * 0.99 - divWidth / 2,
                    y: screenRightBottom.y * 0.99 - divHeight,
                };
                break;
            case 3:
                focusDom.style.right = "1%";
                focusDom.style.top = "1%";
                focusDom.style.left = "inherit";
                focusDom.style.bottom = "inherit";

                pathRight = view2.toMap({
                    x: screenPoint.x + dOffLenght,
                    y: screenPoint.y,
                    spatialReference: view2.spatialReference,
                });

                dockscreenpoint = {
                    x: screenRightBottom.x * 0.99 - divWidth / 2,
                    y: screenRightBottom.y * 0.01 + divHeight,
                };

                break;
            case 4:
                focusDom.style.top = "1%";
                focusDom.style.left = "12%";
                focusDom.style.bottom = "inherit";
                focusDom.style.right = "inherit";

                pathRight = view2.toMap({
                    x: screenPoint.x - dOffLenght,
                    y: screenPoint.y,
                    spatialReference: view2.spatialReference,
                });

                dockscreenpoint = {
                    x: screenRightBottom.x * 0.12 + divWidth / 2,
                    y: screenRightBottom.y * 0.01 + divHeight,
                };
                break;
        }
    }

    let pathDock = view2.toMap({
        x: dockscreenpoint.x,
        y: dockscreenpoint.y,
        spatialReference: view2.spatialReference,
    });
    const polyline = {
        type: "polyline", // autocasts as new Polyline()
        paths: [
            [clickmappoint.x, clickmappoint.y],
            [pathRight.x, pathRight.y],
            [pathDock.x, pathDock.y],
        ],
        spatialReference: view2.spatialReference,
    };

    if (!Boolean(polylineGraphic)) {
        // Create a symbol for drawing the line
        const lineSymbol = {
            type: "simple-line", // autocasts as SimpleLineSymbol()
            color: [51, 255, 204],
            width: 1,
        };
        polylineGraphic = new Graphic({
            geometry: polyline,
            symbol: lineSymbol,
        });
        graphicLyr.add(polylineGraphic);
    } else {
        polylineGraphic.geometry = polyline;
    }
}

//业绩画像模块移除地图连线
export function removeLine() {
    view2.graphics.remove(graphic1);
}

// 地图切换
// 影像图的话互斥，其他叠加
export function toggleBasemap(item, showItem) {
    console.log(view);
    let findLayer = view.map.findLayerById(`${item.PID}`);
    if (item.MODULETYPE.includes("矢量图")) {
        // console.log(findLayer, "findLAYER");
        // if (findLayer) {
        //     findLayer.visible = showItem;
        //     if (showItem) {
        //         view.map.reorder(findLayer, view.map.allLayers.items.length);
        //     }
        // }
        let newLayer = null;
        if (showItem) {
            if (findLayer) {
                return (findLayer.visible = true);
            }
            if (item.TYPE == "Tile") {
                debugger;
                // 天地图
                if (item.URL.includes("tianditu")) {
                    newLayer = new WebTileLayer({
                        urlTemplate: item.URL + tk,
                        subDomains: [
                            "t0",
                            "t1",
                            "t2",
                            "t3",
                            "t4",
                            "t5",
                            "t6",
                            "t7",
                        ],
                        id: item.PID,
                        tileInfo: tileInfoGJ,
                        spatialReference: spatialRef,
                        visible: true,
                    });
                    view.map.basemap.baseLayers.add(newLayer);
                }
                // 切片服务
                else {
                    newLayer = new TileLayer({
                        url: item.URL,
                        id: item.PID,
                        visible: true,
                    });
                    view.map.basemap.baseLayers.add(newLayer);
                }
            } else if (item.TYPE == "Image") {
                newLayer = new MapImageLayer({
                    url: item.URL,
                    id: item.PID,
                    visible: true,
                });
                view.map.basemap.baseLayers.add(newLayer);
            }
        } else {
            // let findLayer = view.map.findLayerById(`${item.PID}`);
            // debugger;
            // if (findLayer) {
            //     view.map.basemap.baseLayers.remove(findLayer);
            //     console.log(view.map);
            // }
            if (findLayer) {
                debugger;
                findLayer.destroy();
                view.map.remove(findLayer);
            }
        }
    } else if (item.MODULETYPE.includes("影像图")) {
        // view.map.basemap.baseLayers.items.map((viewBaseItem) => {
        //     if (String(viewBaseItem.id) == String(item.PID)) {
        //         viewBaseItem.visible = showItem;
        //     } else {
        //         viewBaseItem.visible = false;
        //     }
        // });
        // view.map.basemap.baseLayers.items.map((viewBaseItem) => {
        //     // if (viewBaseItem.id != item.PID) {
        //         viewBaseItem.destroy();
        //         view.map.remove(viewBaseItem);
        //     // }
        // });
        view.map.basemap.baseLayers.removeAll();
        let newLayer = null;
        if (showItem) {
            if (findLayer) {
                findLayer.destroy();
            }
            if (item.TYPE == "Image") {
                newLayer = new MapImageLayer({
                    url: item.URL,
                    id: item.PID,
                    visible: true,
                });
                view.map.basemap.baseLayers.add(newLayer);
            } else if (item.TYPE == "Tile") {
                if (item.URL.includes("tianditu")) {
                    newLayer = new WebTileLayer({
                        urlTemplate: item.URL + tk,
                        subDomains: [
                            "t0",
                            "t1",
                            "t2",
                            "t3",
                            "t4",
                            "t5",
                            "t6",
                            "t7",
                        ],
                        id: item.PID,
                        tileInfo: tileInfoGJ,
                        spatialReference: spatialRef,
                        visible: true,
                    });
                    view.map.basemap.baseLayers.add(newLayer);
                } else {
                    newLayer = new TileLayer({
                        url: item.URL,
                        id: item.PID,
                        visible: true,
                    });
                    view.map.basemap.baseLayers.add(newLayer);
                }
            }
        } else {
            if (findLayer) {
                findLayer.destroy();
                view.map.remove(findLayer);
            }
        }
    }

    // debugger;
    // view.map.basemap.baseLayers.items.map((viewBaseItem) => {
    //     if (String(viewBaseItem.id) == String(item.PID)) {
    //         viewBaseItem.visible = showItem;
    //         item.defaultchoose = true;
    //     } else {
    //         viewBaseItem.visible = false;
    //     }
    // });
}

//地图放大
export function large(isLarge) {
    if (isLarge) {
        sketch = null;
        if (sketch == null) {
            sketch = new Sketch({
                layer: graphicLengthLrc,
                view: view,
            });
        }
        sketch.create("rectangle", { mode: "freehand" });
        sketch.on("create", function (event) {
            if (event.state === "complete") {
                view.center = event.graphic.geometry.extent.center;
                zoom.zoomIn();
                sketch.complete();
                graphicLengthLrc.graphics.removeAll();
                view.graphics.removeAll();
            }
        });
    } else {
        sketch.destroy();
        sketch = null;
    }
}

//地图缩小
export function small(isSmall) {
    if (isSmall) {
        sketch = null;
        if (sketch == null) {
            sketch = new Sketch({
                layer: graphicLengthLrc,
                view: view,
            });
        }
        sketch.create("rectangle", { mode: "freehand" });
        sketch.on("create", function (event) {
            if (event.state === "complete") {
                // if (this.view.zoom > 0) {
                zoom.zoomOut();
                // }
                sketch.complete();
                graphicLengthLrc.graphics.removeAll();
                view.graphics.removeAll();
            }
        });
    } else {
        sketch.destroy();
        sketch = null;
    }
}

//放大、缩小取消
export function cancel_large_small() {
    sketch.cancel();
}

//全图
export function initextent() {
    // if (sketch) {
    //     sketch.destroy();
    //     sketch = null;
    // }
    // view.center = center;
    view.center = mapcenter;
    view.scale = mapscale;
}

//添加图层
export function addlayer(url, type, name) {
    switch (type) {
        case "image":
            var layer = new MapImageLayer({
                url: url,
                id: name,
            });
            userconfig.view.map.add(layer);
            break;
        case "tile":
            var layer = new TileLayer({
                url: url,
                id: name,
            });
            userconfig.view.map.add(layer);
            break;
    }
}

//移除图层
export function removelayer(name) {
    var layer = userconfig.view.map.findLayerById(name);
    view.map.remove(layer);
}

//预加载图层
export function loadlayers(data) {
    for (var i = 0; i < data.length; i++) {
        var d = data[i];
        if (d.childlist.length === 0) {
            loadlayer(d);
        } else {
            loadlayers(d.childlist);
        }
        store.commit("onemap-store/mapview", view);
    }
}
//obj:数据服务对象
//isSon:通过子图层加载服务
async function loadlayer(obj, isSon) {
    // let layer
    // switch (obj.kind) {
    //     //mapserver
    //     case 1:
    //         layer = new MapImageLayer({
    //             id: isSon ? obj.parent : obj.label,
    //             url: obj.url,
    //             opacity: 100,
    //             // visible: obj.visible == 1 ? true : false,
    //             // visible:true,
    //         });
    //         // view.map.add(layer, 1);
    //         //捕捉加载服务地址异常的写法
    //         layer
    //             .load()
    //             .then(function (res) {
    //                 //加载成功todo（不操作）
    //             })
    //             .catch(async function (error) {
    //                 //图层加载失败
    //                 console.log(error, 'error');
    //             });
    //         break;
    //     //tilelayer
    //     case 5:
    //         layer = new TileLayer({
    //             id: isSon ? obj.parent : obj.label,
    //             url: obj.url,
    //             opacity: 100,
    //             // visible: obj.visible == 1 ? true : false,
    //             visible: true,
    //         });
    //         // view.map.add(layer, 1);

    //         //异常日志捕捉
    //         layer
    //             .load()
    //             .then(function (res) {
    //                 //加载成功todo（不操作）
    //             })
    //             .catch(async function (error) {
    //                 //图层加载失败
    //                 console.log(error, 'error');
    //             });
    //         break;
    // }
    // layer.load().then((resLayer) => {
    //     view.map.layers.push(resLayer)
    //     debugger
    //     view.extent = resLayer.fullExtent
    // })

    // return layer.load()
    debugger;
    switch (obj.kind) {
        //mapserver
        case 1:
            var layer = new MapImageLayer({
                id: isSon ? obj.parent : obj.label,
                url: obj.url,
                opacity: 100,
                // visible: obj.visible == 1 ? true : false,
                // visible:true,
            });
            view.map.add(layer, 1);
            //捕捉加载服务地址异常的写法
            layer
                .load()
                .then(function (res) {
                    //加载成功todo（不操作）
                })
                .catch(async function (error) {
                    //图层加载失败
                    console.log(error, "error");
                });
            break;
        //tilelayer
        case 5:
            var layer = new TileLayer({
                id: isSon ? obj.parent : obj.label,
                url: obj.url,
                opacity: 100,
                // visible: obj.visible == 1 ? true : false,
                visible: true,
            });
            view.map.add(layer, 1);
            console.log(layer, "----layer");

            //异常日志捕捉
            layer
                .load()
                .then(function (res) {
                    //加载成功todo（不操作）
                })
                .catch(async function (error) {
                    //图层加载失败
                    console.log(error, "error");
                });
            break;
    }
}

// 一打开弹窗打开图层
export async function rightOpenlayer(name, obj, idList) {
    var layer = view?.map.findLayerById(name);
    if (layer == undefined) {
        await loadlayer(obj, false);

        layer = view.map.findLayerById(name);
    }

    const { data: res } = await getServer(layer.url);
    //判断是否切片图层,如果是切片图层，不控制子图层
    let bTileMap = false;
    if (res != null && res.tileInfo != null) {
        bTileMap = true;
    }

    layer.visible = true;
    if (!bTileMap) {
        layer.allSublayers.forEach((son) => {
            if (idList.indexOf(obj.id + "-" + son.id) > -1) {
                son.visible = true;
            } else {
                son.visible = false;
            }
        });
    }

    layer.opacity = parseInt(obj.value) / 100;
    legendLayers.push[layer]; //添加需要展示的图例图层

    var openedLayerData = new Object();
    openedLayerData.id = obj.id;
    openedLayerData.label = layer.id;
    openedLayerData.layerurl = layer.url;
    openedLayerData.opacity = parseInt(obj.value);
    openedLayerData.level = "server";
    openedLayerData.sublayer = [];
    openedLayerData.isClick = true;
    openedLayerData.legendEnabled = layer.legendEnabled;

    if (!bTileMap) {
        await layer.loadAll();
        let kk = layer.allSublayers.length;
        for (var k = kk - 1; k >= 0; k--) {
            let son = layer.allSublayers.items[k];
            var id = obj.id + "-" + son.id;
            if (idList.indexOf(id) > -1) {
                var sublayerObject = new Object();
                sublayerObject.id = id;
                sublayerObject.label = son.title;
                sublayerObject.opacity = son.opacity * 100;
                sublayerObject.level = "layer";
                sublayerObject.layerurl = son.url;
                sublayerObject.parent = layer.id;
                sublayerObject.serverurl = layer.url;
                sublayerObject.sublayerid = son.id;
                sublayerObject.legendEnabled = son.legendEnabled;
                sublayerObject.isClick = true;
                openedLayerData.sublayer.push(sublayerObject);
            }
        }
    }

    let findLayerData = store.state["onemap-store"].openedLayerData;
    const findIndex = findLayerData.findIndex(function (val) {
        return val.label === layer.id;
    });
    if (findIndex == -1) {
        store.commit("onemap-store/setOpenedLayerData", openedLayerData);
    } else {
        findLayerData.splice(findIndex, 1, openedLayerData);
        store.commit("onemap-store/setAllOpenedLayerData", findLayerData);
    }
}

//打开图层
export async function openlayer(name, obj) {
    console.log("openLayer", obj);
    console.log("openLayerName", name);
    var layer = view?.map.findLayerById(name);
    debugger;
    if (layer == undefined) {
        await loadlayer(obj, false);

        layer = view.map.findLayerById(name);
    }
    const { data: res } = await getServer(layer.url);
    //判断是否切片图层,如果是切片图层，不控制子图层
    let bTileMap = false;
    if (res != null && res.tileInfo != null) {
        bTileMap = true;
    }

    layer.visible = true;
    if (!bTileMap) {
        layer.allSublayers.forEach((son) => {
            son.visible = true;
        });
    }

    layer.opacity = parseInt(obj.value) / 100;
    legendLayers.push[layer]; //添加需要展示的图例图层

    var openedLayerData = new Object();
    openedLayerData.id = obj.id;
    openedLayerData.label = layer.id;
    openedLayerData.layerurl = layer.url;
    openedLayerData.opacity = parseInt(obj.value);
    openedLayerData.level = "server";
    openedLayerData.sublayer = [];
    openedLayerData.isClick = true;
    openedLayerData.legendEnabled = layer.legendEnabled;

    if (!bTileMap) {
        await layer.loadAll();
        let kk = layer.allSublayers.length;
        for (var k = kk - 1; k >= 0; k--) {
            let son = layer.allSublayers.items[k];
            var sublayerObject = new Object();
            sublayerObject.id = obj.id + "-" + son.id;
            sublayerObject.label = son.title;
            sublayerObject.opacity = son.opacity * 100;
            sublayerObject.level = "layer";
            sublayerObject.layerurl = son.url;
            sublayerObject.parent = layer.id;
            sublayerObject.serverurl = layer.url;
            sublayerObject.sublayerid = son.id;
            sublayerObject.legendEnabled = son.legendEnabled;
            sublayerObject.isClick = true;
            openedLayerData.sublayer.push(sublayerObject);
        }
    }

    let findLayerData = store.state["onemap-store"].openedLayerData;
    const findIndex = findLayerData.findIndex(function (val) {
        return val.label === layer.id;
    });
    if (findIndex == -1) {
        store.commit("onemap-store/setOpenedLayerData", openedLayerData);
    } else {
        findLayerData.splice(findIndex, 1, openedLayerData);
        store.commit("onemap-store/setAllOpenedLayerData", findLayerData);
    }
}

export async function openlayerById(name, id, obj) {
    var layer = view.map.findLayerById(name);

    if (!layer) {
        await loadlayer(obj, true);
        layer = view.map.findLayerById(name);
        await layer.loadAll();
        layer.sublayers.items.forEach((son) => {
            son.visible = false;
        });
    }

    await layer.loadAll();
    layer.visible = true;

    let layerid = id;
    let layeridarray = layerid.split("-");
    if (layeridarray.length > 1) {
        layerid = layeridarray[0];
    }

    let findLayerData = store.state["onemap-store"].openedLayerData;
    const findIndex = findLayerData.findIndex(function (val) {
        return val.label === layer.id;
    });
    var serverLayer = findLayerData[findIndex];
    if (findIndex > -1) {
        let kk = layer.allSublayers.length;
        let flag = true;
        for (var k = kk - 1; k >= 0; k--) {
            let son = layer.allSublayers.items[k];
            let sonid = layerid + "-" + son.id;
            if (sonid == id) {
                son.visible = true;
                if (serverLayer.sublayer.length > 0) {
                    serverLayer.sublayer.forEach((item) => {
                        if (item.id == sonid) {
                            flag = false;
                            item.isClick = true;
                        }
                    });
                    if (flag) {
                        // 代表不存在
                        var sublayerObject = new Object();
                        sublayerObject.id = sonid;
                        sublayerObject.label = son.title;
                        sublayerObject.opacity = son.opacity * 100;
                        sublayerObject.level = "layer";
                        sublayerObject.layerurl = son.url;
                        sublayerObject.parent = layer.id;
                        sublayerObject.serverurl = layer.url;
                        sublayerObject.sublayerid = son.id;
                        sublayerObject.isClick = true;
                        sublayerObject.legendEnabled = son.legendEnabled;

                        serverLayer.sublayer.splice(0, 0, sublayerObject);
                    }
                }
            }
        }

        findLayerData.splice(findIndex, 1, serverLayer);
        store.commit("onemap-store/setAllOpenedLayerData", findLayerData);
    } else {
        var openedLayerData = new Object();
        openedLayerData.id = layerid;
        openedLayerData.label = layer.id;
        openedLayerData.layerurl = layer.url;
        openedLayerData.opacity = layer.opacity * 100;
        openedLayerData.level = "server";
        openedLayerData.sublayer = [];
        openedLayerData.isClick = true;
        openedLayerData.legendEnabled = layer.legendEnabled;

        let kk = layer.allSublayers.length;
        for (var k = kk - 1; k >= 0; k--) {
            let son = layer.allSublayers.items[k];
            let sonid = layerid + "-" + son.id;
            if (!son.visible && sonid != id) {
                son.visible = false;
            } else {
                son.visible = true;
                var sublayerObject = new Object();
                sublayerObject.id = sonid;
                sublayerObject.label = son.title;
                sublayerObject.opacity = son.opacity * 100;
                sublayerObject.level = "layer";
                sublayerObject.layerurl = son.url;
                sublayerObject.parent = layer.id;
                sublayerObject.serverurl = layer.url;
                sublayerObject.sublayerid = son.id;
                sublayerObject.isClick = true;
                sublayerObject.legendEnabled = son.legendEnabled;
                openedLayerData.sublayer.push(sublayerObject);
            }
        }
        store.commit("onemap-store/setOpenedLayerData", openedLayerData);
    }
}

//关闭图层
export function closelayer(name, isstore) {
    var layer = view.map.findLayerById(name);
    // if(!Boolean(layer)){
    //     return
    // }
    console.log(layer, layer, name);
    if (layer.type == "map-image") {
        // await layer.loadAll();
        layer.allSublayers.forEach((son) => {
            son.visible = false;
        });
    } else {
        // layer.visible = false;
        layer.visible = false;
    }
    if (isstore) {
        let openedLayerData = store.state["onemap-store"].openedLayerData;
        const findIndex = openedLayerData.findIndex(function (val) {
            return val.label === layer.id;
        });
        if (findIndex > -1) {
            openedLayerData.splice(findIndex, 1);
            store.commit("onemap-store/setAllOpenedLayerData", openedLayerData);
        }
    }
}

export function closelayerById(name, id, isstore) {
    var layer = view.map.findLayerById(name);
    //layer.visible = true;

    let sonid = id;
    let sonidarray = sonid.split("-");
    if (sonidarray.length > 1) {
        sonid = sonidarray[1];
    }
    var sublayer = layer.findSublayerById(parseInt(sonid));
    sublayer.visible = false;
    if (isstore) {
        let openedLayerData = store.state["onemap-store"].openedLayerData;
        const findIndex = openedLayerData.findIndex(function (val) {
            return val.label === layer.id;
        });
        if (findIndex > -1) {
            let findStore = openedLayerData[findIndex];
            const findSubIndex = findStore.sublayer.findIndex(function (val) {
                return val.sublayerid === sublayer.id;
            });
            if (findSubIndex > -1) {
                openedLayerData[findIndex].sublayer.splice(findSubIndex, 1);
                if (openedLayerData[findIndex].sublayer.length == 0) {
                    openedLayerData.splice(findIndex, 1);
                }
                store.commit(
                    "onemap-store/setAllOpenedLayerData",
                    openedLayerData
                );
            }
        }
    }
}

//透明度控制
export function opacitylayer(name, value) {
    var layer = view.map.findLayerById(name);
    layer.opacity = value / 100;
}

//透明度
export function opacitylayerById(name, value, id) {
    var layer = view.map.findLayerById(name);
    layer.findSublayerById(id).opacity = value / 100;
}

//测距
export function length_area(method, isDo) {
    if (isDo) {
        sketch = new Sketch({
            layer: graphicLengthLrc,
            view: view,
        });
        let layerLs = view.map.findLayerById("lengthLrc");
        view.map.reorder(layerLs, 999);
        var defaultFont = new Font({
            size: "18px",
            weight: "bold",
        });
        var defaultMarkSymbol = new SimpleMarkerSymbol({
            style: "circle",
            color: "red",
            size: "7px",
            outline: {
                color: [255, 0, 0],
                width: 1,
            },
        });
        var totalDis = 0;
        var totalLenGraphic;

        if (method == "length") {
            // if (userconfig.toolname['length']) {
            sketch.create("polyline", { mode: "click" });
            sketch.on("create", function (evt) {
                handleLengthMeasure(evt);
            });
            // }
        } else if (method == "area") {
            // if (userconfig.toolname['area']) {
            sketch_area.create("polygon", { mode: "click" });
            sketch_area.on("create", function (evt) {
                handleAreaMeasure(evt);
            });
            // }
        }
        var inputPt = [];

        function handleLengthMeasure(evt) {
            if (evt.toolEventInfo && evt.toolEventInfo.type == "vertex-add") {
                var pt = {
                    type: "point",
                    // 老版的api中可以升级之后的不行
                    // x: evt.toolEventInfo.added[0],
                    // y: evt.toolEventInfo.added[1],
                    x: evt.toolEventInfo.added[0][0],
                    y: evt.toolEventInfo.added[0][1],
                    // spatialReference: userconfig.basemap.mapwkid
                    spatialReference: view.spatialReference,
                };
                handleLengthPt(pt);
            }
            if (evt.state == "complete") {
                inputPt = [];
                sketch.complete();
            }
        }

        function handleLengthPt(pt) {
            inputPt.push(pt);
            var textSymbol = new TextSymbol({
                text: "起点",
                font: defaultFont,
                color: [255, 0, 0],
                xoffset: 0,
                yoffset: -20,
            });
            if (inputPt.length == 1) {
                graphicLengthLrc.add(
                    new Graphic({ geometry: pt, symbol: textSymbol })
                );
            }
            graphicLengthLrc.add(
                new Graphic({ geometry: pt, symbol: defaultMarkSymbol })
            );

            if (inputPt.length >= 2) {
                let params = new LengthsParameters();
                params.distanceUnit = "meters";
                params.calculationType = "geodesic";
                let p1 = inputPt[inputPt.length - 2];
                let p2 = inputPt[inputPt.length - 1];
                let polyline = new Polyline({
                    spatialReference: view.spatialReference,
                });
                // 添加坐标
                polyline.addPath([
                    [p1.x, p1.y],
                    [p2.x, p2.y],
                ]);
                params.polylines = [polyline];

                //线样式
                var polylineSymbol = {
                    type: "simple-line",
                    color: [255, 0, 0],
                    width: 2,
                };

                // 计算距离
                geometryService
                    .lengths(areaURL, params)
                    .then(function (result) {
                        graphicLengthLrc.add(
                            new Graphic({
                                geometry: polyline,
                                symbol: polylineSymbol,
                            })
                        );
                        let dis = parseFloat(result.lengths[0]);
                        totalDis += dis;
                        let betweendis = dis.toFixed(2) + "米";
                        let distext = new TextSymbol({
                            text: betweendis,
                            font: defaultFont,
                            color: [255, 0, 0],
                            xoffset: 40,
                            yoffset: -3,
                        });
                        graphicLengthLrc.add(
                            new Graphic({ geometry: p2, symbol: distext })
                        );
                        if (totalLenGraphic) {
                            graphicLengthLrc.remove(totalLenGraphic);
                        }
                        let total = parseFloat(totalDis).toFixed(2);
                        let totalSymbol = new TextSymbol({
                            text: `总长度${total}米`,
                            font: defaultFont,
                            color: [255, 0, 0],
                            xoffset: 40,
                            yoffset: -20,
                        });

                        var totalgraphic = new Graphic({
                            geometry: p2,
                            symbol: totalSymbol,
                        });
                        graphicLengthLrc.add(totalgraphic);
                        // sketch.destroy();
                    });
            }
        }

        //面积
        function handleAreaMeasure(evt) {
            if (evt.state == "complete") {
                var geometry = evt.graphic.geometry;
                var params = new AreasAndLengthsParameters();
                params.lengthUnit = "meters";
                params.areaUnit = "square-meters";
                params.calculationType = "preserve-shape";
                geometryService
                    .simplify(areaURL, [geometry])
                    .then(function (result1) {
                        params.polygons = result1;
                        geometryService
                            .areasAndLengths(areaURL, params)
                            .then(function (result) {
                                var fillsymbol = {
                                    type: "simple-fill",
                                    color: [51, 51, 204, 0.6],
                                    style: "solid",
                                    outline: {
                                        color: "white",
                                        width: 1,
                                    },
                                };
                                graphicLengthLrc.add(
                                    new Graphic({
                                        geometry: geometry,
                                        symbol: fillsymbol,
                                    })
                                );

                                var font = new Font({
                                    size: "18px",
                                });
                                // var areaRes = new TextSymbol({
                                //     text:用了这个方法
                                //         intl.formatNumber(result.areas[0], { pattern: '#.000' }) +
                                //         '平方米',
                                //     font: font,
                                //     color: [255, 0, 0],
                                // })
                                let totalarea = parseFloat(
                                    result.areas[0].toFixed(0)
                                );
                                let areaMu = parseFloat(
                                    result.areas[0] * 0.0015
                                ).toFixed(2);
                                let areaGQ = parseFloat(
                                    result.areas[0] * 0.0001
                                ).toFixed(2);
                                let areaRes = new TextSymbol({
                                    text: `${totalarea}平方米\n${areaMu}亩\n${areaGQ}公顷`,
                                    font,
                                    color: [255, 0, 0],
                                });
                                var pt = new Point({
                                    x: geometry.centroid.x,
                                    y: geometry.centroid.y,
                                    spatialReference: view.spatialReference,
                                });
                                graphicLengthLrc.add(
                                    new Graphic({
                                        geometry: pt,
                                        symbol: areaRes,
                                    })
                                );
                                // sketch_area.destroy();
                            });
                    });
                sketch.complete();
                sketch_area.complete();
            }
        }
    } else {
        sketch.cancel();
        sketch = null;
        sketch_LS.cancel();
        sketch_area.cancel();
    }
}

//绘制图形
export function draw() {
    userconfig.view.removeAll();
    var defaultMarkSymbol = new SimpleMarkerSymbol({
        style: "circle",
        color: "red",
        size: "7px",
        outline: {
            color: [255, 0, 0],
            width: 1,
        },
    });
    sketch.create("polygon", { mode: "click" });
    sketch.on("create", function (evt) {
        if (evt.state == "complete") {
            var geometry = evt.graphic.geometry;
            var fillsymbol = {
                type: "simple-fill",
                color: [51, 51, 204, 0.6],
                style: "solid",
                outline: {
                    color: "white",
                    width: 1,
                },
            };
            userconfig.view.graphics.add(
                new Graphic({ geometry: geometry, symbol: fillsymbol })
            );
            sketch.complete();
            sketch.cancel();
        }
    });
}

// 清除地图
export function clearmap() {
    view.graphics.removeAll();
    if (sketch != null) {
        sketch.cancel();
        sketch = null;
        sketch_LS.cancel();
        sketch_area.cancel();
    }
    graphicLengthLrc.graphics.removeAll();
    toolGraphicLayer.graphics.removeAll();
    // var totalDis = 0;
    // view.map.add(graphicLengthLrc)
    var tlayer = view.map.findLayerById("draw_graphic");
    if (tlayer != "undefined") {
        view.map.remove(tlayer);
    }
}

//设置地图范围
export function setView(geometry) {
    userconfig.view.extent = geometry.extent;
    var sym = {
        type: "simple-fill",
        color: [51, 51, 204, 0.2],
        style: "solid",
        outline: {
            color: "blue",
            width: 1,
        },
    };
    userconfig.view.graphics.removeAll();
    var Graphic = new Graphic({ geometry: geometry, symbol: sym });
    userconfig.view.graphics.add(Graphic);
}

//地图图例
export function Lenged() {
    if (maplegend != null) {
        view.ui.remove(maplegend);
        maplegend = null;
    } else {
        //const featureLayer = view.map.layers.getItemAt(0);
        let legend = new Legend({
            view: view,
            basemapLegendVisible: false,
            layerInfos: legendLayers,
            // style: 'classic',
        });
        maplegend = legend;
        view.ui.add(maplegend, "bottom-right");
    }
}

//更改图层顺序  isChange 为ture，将图层调整为上；isChage为false，将图层调整为下；
export function changeLayerIndex(id, isChange) {
    let layer = view.map.findLayerById(id);

    if (isChange == true) {
        view.map.reorder(layer, 999);
    } else if (isChange == false) {
        view.map.reorder(layer, 0);
    } else {
        return null;
    }
}

//获取可查询属性的图层
export function pushIdentifylayer(name) {
    identifylayers.push(name);
}

//去掉关闭的图层
export function popIdentifylayer(name) {
    var narr = new Array();
    for (var i = 0; i < identifylayers.length; i++) {
        if (name != identifylayers[i]) {
            narr.push(identifylayers[i]);
        }
    }
    identifylayers = narr;
}

/**
 * 缩放到图层
 * @param {图层ID} layerId
 */
export function zoomToLayer(nodedata) {
    if (nodedata.level == "server") {
        let findLayer = view.map.findLayerById(nodedata.label);
        console.log(findLayer, "findLayer");
        zoomToCurLayer(findLayer);
    } else if (nodedata.level == "layer") {
        let findLayer = view.map.findLayerById(nodedata.parent);
        console.log(findLayer, "findLayer");
        zoomToCurLayer(findLayer);
    }
}

/**
 * 缩放到图层
 * @param {缩放图层} zoomlayer
 */
export function zoomToCurLayer(zoomlayer) {
    let geometry = zoomlayer.fullExtent;
    console.log(geometry, "geometry");
    // 必需等投影引擎加载完毕再转换
    projection.load().then(() => {
        let newGeometry = projection.project(geometry, view.spatialReference);
        view.goTo({
            target: newGeometry,
        });
    });
}

//图例开关
export function layerLegendSwitch(layerData) {
    if (layerData.level == "server") {
        var layer = view?.map.findLayerById(layerData.label);
        if (layer != undefined) {
            layer.legendEnabled = layerData.legendEnabled;
            layer.allSublayers.forEach((son) => {
                son.legendEnabled = layerData.legendEnabled;
            });
        }
    } else {
        var layer = view?.map.findLayerById(layerData.parent);
        if (layerData.legendEnabled) {
            layer.legendEnabled = layerData.legendEnabled;
        }
        if (layer != undefined) {
            let sublayer0 = layer.findSublayerById(layerData.sublayerid);
            sublayer0.legendEnabled = layerData.legendEnabled;
        }
    }
}

// 关闭影像底图
export function closeYxt(arr) {
    arr.map((item) => {
        let findLayer = view.map.findLayerById(`${item.PID}`);
        if (findLayer) {
            findLayer.visible = false;
        }
    });
}
