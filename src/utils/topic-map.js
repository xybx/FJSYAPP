/*
 * @Author: WCL
 * @Date: 2021-12-03 10:39:28
 * @LastEditors: error: git config user.name && git config user.email & please set dead value or install git
 * @LastEditTime: 2022-11-29 19:56:29
 * @FilePath: \webgis\src\utils\topic-map.js
 * @Description: 专题图共用JS
 */
import axios from "axios";
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
import TileLayer from '@arcgis/core/layers/TileLayer';
import PrintParameters from '@arcgis/core/rest/support/PrintParameters';
import PrintTemplate from '@arcgis/core/rest/support/PrintTemplate';
import Polygon from '@arcgis/core/geometry/Polygon';
import Graphic from '@arcgis/core/Graphic';
import * as print from '@arcgis/core/rest/print';
import { union } from '@arcgis/core/geometry/geometryEngine';
import request from '@/utils/request';
import store from '@/store/index';
import Basemap from '@arcgis/core/Basemap';
import Point from '@arcgis/core/geometry/Point';
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import * as projection from '@arcgis/core/geometry/projection';
import ProjectParameters from "@arcgis/core/rest/support/ProjectParameters";
import * as geometryService from '@arcgis/core/rest/geometryService';
import { getMapGeometryServiceUrl } from '@/views/onemap/api/onemap';
import ScaleBar from "@arcgis/core/widgets/ScaleBar";

// 专题图图层列表接口
export const zttLayersApi = (params) => {
    return request({
        method: 'GET',
        url: '/api/OneMap/GetZttLayers',
        params,
    });
};

// 打印服务接口
export const mapPrintServiceApi = (params) => {
    return request({
        method: 'GET',
        url: '/api/MapConfig/GetUserMapPrintService',
        params,
    });
};

// 上传通用文件接口
export const uploadDwg = (data) => {
    return request({
        method: 'POST',
        url: '/api/Upload/uploadfile',
        data,
    });
};


// 解析文件接口
export const readApi = (data) => {
    const requests = axios.create({
        baseURL: '10.10.4.200/fileapi',
    });

    return requests({
        method: 'POST',
        url: '/File/handleFile',
        data,
    });
};

// 导出专题图通用接口
export const createFile = (params) => {
    return request({
        method: 'GET',
        url: '/api/Ztt/ExportZTTReport',
        params,
    });
};

// 初始化专题图
export let zttView = null;
export const initZttMap = async (container, type) => {
    let zttMap = new Map();
    // ! scale赋值不生效
    zttView = new MapView({
        container,
        map: zttMap,
        scale: 100000,
    });
    zttView.ui.remove(['attribution']);

    store.commit('onemap-store/handleZttScale', zttView.scale);
    await getZttLayers(type);
    mapExtentWatch(zttView);
};

// 地图范围监听
const mapExtentWatch = (view) => {
    view.watch('scale', () => {
        let status = store.state['onemap-store'].isScaleStatus;
        if (!status) {
            store.commit('onemap-store/handleZttScale', Math.round(view.scale));
        } else {
            store.commit('onemap-store/handleShowZttScale', false);
        }
    });
};

// 加载专题图层
const getZttLayers = async (type) => {
    let params = {
        uid: 653,
        typeid: type,
    };
    const data = await zttLayersApi(params);
    if (data.code === 1) {
        let d = res.data;
        d.map((item) => {
            if (item.MAPTYPE == 'image') {
                let layer = new MapImageLayer({
                    url: item.LAYERURL,
                });
                zttView.map.add(layer);
            } else if (item.MAPTYPE == 'tile') {
                let layer = new TileLayer({
                    url: item.LAYERURL,
                });
                zttView.map.add(layer);
            }
        });
    }
};

// 地图快照（地图打印的一种方式）无参数
export async function mapScreenhot(view) {
    let screenshot = await view.takeScreenshot();
    return screenshot.dataUrl;
    // return ''
}
// 打印地图
// 接收参数为三个
export const printMap = async (dpiValue, scale, view) => {
    let printURL = null;
    let params = {
        uid: sessionStorage.getItem('userid'),
    };
    const { data: res } = await mapPrintServiceApi(params);
    if (res.code === 200) {
        printURL = res.data.PRINTURL;

        let ptTemplate = new PrintTemplate({
            format: 'jpg',
            exportOptions: {
                width: view.width,
                height: view.height,
                dpi: dpiValue,
            },
            outScale: scale,
            layout: 'map-only',
            showLabels: true,
        });

        let ptParams = new PrintParameters({
            view,
            template: ptTemplate,
        });

        return await print.execute(printURL, ptParams);
    }
};

// 创建几何图形，返回 graphic
export const createGraphic = async (pointData, view, wkid) => {
    store.commit('onemap-store/setSymbol');
    // 多地块(*)
    if (pointData.indexOf('*') > 0) {
        let geo = null;
        let pointArr = pointData.split('*');
        let pt = new Array();
        pointArr.map((item) => {
            let pointItems = item.split(';');

            pointItems.map((subItem) => {
                let point = new Array();
                point.push(Number(subItem.split(',')[0]));
                point.push(Number(subItem.split(',')[1]));
                pt.push(point); // 点数组
            });
        });
        let polygonJSON = {
            rings: pt,
            spatialReference: {
                // wkid: view.spatialReference.wkid,
                wkid: wkid,
                // wkid:4549,
            },
        };

        let polygon = new Polygon(polygonJSON);

        if (geo == null) {
            geo = polygon;
        } else {
            geo = union([geo, polygon]);
        }
        // });

        let graphic = new Graphic({
            geometry: geo,
            symbol: store.state['onemap-store'].symbol,
        });
        return graphic;
    }
    // 单地块
    else {
        let pt = new Array();
        let pointItems = pointData.split(';');
        pointItems.map((item) => {
            let point = new Array();
            point.push(Number(item.split(',')[0]));
            point.push(Number(item.split(',')[1]));
            pt.push(point); // 点数组
        });

        let polygonJSON = {
            rings: pt,
            spatialReference: {
                // wkid: view.spatialReference.wkid,
                // wkid:4549,
                wkid: wkid,
            },
        };

        let polygon = new Polygon(polygonJSON);

        let graphic = new Graphic({
            geometry: polygon,
            symbol: store.state['onemap-store'].symbol,
        });
        return graphic;

    }
};

// 初始化自定义专题图
export let defineView = null;
export const initDefineMap = (container) => {
    let baseLayer = null;
    let deBaseMap = store.state['onemap-store'].setmap;
    // let mapWkid = deBaseMap.MAPWKID;
    if (deBaseMap.TYPE == 'Image') {
        baseLayer = new MapImageLayer({
            url: deBaseMap.URL,
            id: 'basemap_layer',
        });
    } else if (deBaseMap.TYPE == 'Tile') {
        baseLayer = new TileLayer({
            url: deBaseMap.URL,
            id: 'basemap_layer',
        });
    }

    let baseMap = new Basemap({
        baseLayers: [baseLayer],
        title: 'basemap',
        id: 'basemap',
    });

    let defineMap = new Map({
        basemap: baseMap,
    });

    let centPoint = new Point({
        x: deBaseMap.CENTERX,
        y: deBaseMap.CENTERY,
        spatialReference: {
            wkid: deBaseMap.MAPWKID,
        },
    });

    // ! zoom,scale不起作用
    defineView = new MapView({
        container,
        map: defineMap,
        center: centPoint, // 初始显示的地图中心点，经纬度
        //zoom: 4, // 当前地图缩放等级
        // scale: 10000,
        constraints: {
            rotationEnabled: false,
        },
        navigation: {
            momentumEnabled: false,
        },
    });
    //添加比例尺
    let scaleBar = new ScaleBar({
        view: defineView,
        unit: "metric",
        style: 'ruler'
    });
    defineView.ui.add(scaleBar, { position: "bottom-right" });
    // defineView.scale=40000;
    defineView.ui.remove(['attribution', 'zoom']);
    store.commit('onemap-store/handleZttScale', defineView.scale);

    // 地图scale监听
    mapExtentWatch(defineView);
    // 获取主图打开的全部图层
    getAllOpenLayers();
    // 叠加主地图打开的图层
    overAllLayers();
};

// 获取当前地图中显示叠加的全部图层
let openAllLayer = [];
export const getAllOpenLayers = () => {
    openAllLayer = [];
    let mainView = store.state['onemap-store'].mapview;
    let layerList = mainView.map.layers;
    if (layerList.length > 0) {
        layerList.map((item) => {
            if (
                item.id != 'lengthLrc' &&
                // item.type != 'tile' &&
                item.title != null &&
                item.type != 'graphics' &&
                item.id.indexOf('影像图') < 0
            ) {
                if (item.visible) {
                    let attrLayer = new Object();
                    attrLayer.layerName = item.id;
                    attrLayer.layerURL = item.url;
                    attrLayer.opacity = item.opacity;
                    attrLayer.subLayer = [];
                    item.allSublayers.items.map((subItem) => {
                        if (subItem.visible) {
                            attrLayer.subLayer.push(subItem.id);
                        }
                    });
                    if (attrLayer.subLayer.length > 0) {
                        openAllLayer.push(attrLayer);
                    }
                }
            }
        });
    }
};

// 叠加主图上显示的图层到专题图
export const overAllLayers = () => {
    if (openAllLayer) {
        openAllLayer.forEach((item) => {
            let subLayers = [];
            item.subLayer.forEach((subItem) => {
                let sonLayer = {
                    id: subItem,
                    visible: true,
                };
                subLayers.push(sonLayer);
            });
            let layer = new MapImageLayer({
                url: item.layerURL,
                id: item.layerName,
                sublayers: subLayers,
                opacity: item.opacity,
            });
            defineView.map.add(layer, 1);
        });
    }
};
