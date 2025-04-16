import { writeMapServerLog,getMapGeometryService } from '@/views/onemap/api/onemap';
import store from '../store/index';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
import {
    getMapGeometryServiceUrl,
    savePrintBitImage,
} from '@/views/onemap/api/onemap';
import {
    simplify,
    areasAndLengths,
    project,
    difference,
    union,
} from '@arcgis/core/rest/geometryService';
import * as projection from "@arcgis/core/geometry/projection.js";
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import AreasAndLengthsParameters from '@arcgis/core/rest/support/AreasAndLengthsParameters';
import ProjectParameters from '@arcgis/core/rest/support/ProjectParameters';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import * as query from '@arcgis/core/rest/query';
import Query from '@arcgis/core/rest/support/Query';
import Graphic from '@arcgis/core/Graphic';
import Polygon from '@arcgis/core/geometry/Polygon';
import Point from "@arcgis/core/geometry/Point.js";
var ServiceUrl;

//根据服务地址获取该图层服务的所有属性列表
export async function GetLayerAttrs(layerurl, objectid ) {
    var attrs = [];
    var queryParams = new Query();
    queryParams.where = '1=1';
    queryParams.outFields = ['*'];
    if (objectid) {
        queryParams.where += ` and OBJECTID=${objectid}`;
    }
    let result = await query.executeQueryJSON(layerurl, queryParams);
    
    if (result != null && result.features.length > 0) {
        if (result.features.length > 0) {
            for (let i = 0; i < result.fields.length; i++) {
                const field = result.fields[i];
                var name = field.name;
                if (name == 'SHAPE.LEN') {
                    break;
                }
                var value = '';
                var prjId = result.features[0].attributes['PRJID'];
                if (field.type == 'date') {
                    var pzsj = result.features[0].attributes[name];
                    if (pzsj != null && pzsj != '' && pzsj != 'Null') {
                        var date = new Date(pzsj);
                        value =
                            date.getFullYear() +
                            '-' +
                            (date.getMonth() + 1) +
                            '-' +
                            date.getDate();
                    }
                } else if (field.type == 'double') {
                    if(result.features[0].attributes[name]!=null){
                        value = result.features[0].attributes[name].toFixed(2);
                    }
                    else{
                        value=null;
                    }
                } else {
                    value = result.features[0].attributes[name];
                }

                var tabdata = {
                    name: field.alias,
                    value: value,
                };
                attrs.push(tabdata);
            }
        }
    }
    return attrs;
}

//图形定位
export async function GraphicLocation(graphic) {
    store.state['onemap-store'].mapview.graphics.add(graphic);
    if (graphic.geometry.type=='point') {
        var point = new Point();
        debugger
        if (graphic.geometry.spatialReference.wkid!= 4490) {
            let outSpatialReference = new SpatialReference({
                wkid:store.state['onemap-store'].mapview.spatialReference.wkid
            })
            let oldPoint = new Point({
                x:graphic.geometry.longitude,
                y:graphic.geometry.latitude,
                wkid:graphic.geometry.spatialReference.wkid
            })
            let results = await projection.project(graphic.geometry,outSpatialReference );
            point.latitude = results[0].latitude;
            point.longitude = results[0].longitude;
            point.spatialReference = store.state['onemap-store'].mapview.spatialReference;
          } else {
            point.latitude = graphic.geometry.y;
            point.longitude = graphic.geometry.x;
            point.spatialReference = graphic.geometry.spatialReference;
          }
        store.state['onemap-store'].mapview.center= point;
        store.state['onemap-store'].mapview.zoom =
        store.state['onemap-store'].mapview.zoom + 2;
    }else{
        store.state['onemap-store'].mapview.extent = graphic.geometry.extent;
        store.state['onemap-store'].mapview.zoom =
        store.state['onemap-store'].mapview.zoom - 2;
    }
    
}

//清空地图上的图形
export function clearMapGraphics(layerdatas) {
    store.state['onemap-store'].mapview.graphics.removeAll();
    //清空绘制图层
    // store.state['onemap-store'].graphicLengthLrc.removeAll();
    //隐藏地图上得所有图层
    //store.state["onemap-store"].map.
    var layerlist = store.state['onemap-store'].mapview.map.allLayers;

    if (layerdatas != null && layerdatas.length > 0) {
        layerdatas.forEach((element) => {
            var layer = store.state['onemap-store'].mapview.map.findLayerById(
                element.LAYERNAME
            );
            if (layer) {
                layer.visible = false;
            }
        });
    }
}
//获取计算服务地址
async function getServiceUrl() {
    let res = await getMapGeometryService();
    if (res.code === 200) {
    ServiceUrl = res.data.MAPGEOMETRYSERVICEURL;
    }
  }

//获取当前地图上全部打开的图层
export function getAllOpenLayers() {
    var layerlist = store.state['onemap-store'].mapview.map.allLayers;
    var openalllayerlist = [];
    if (layerlist.length > 0) {
        for (var i = 0,ik=layerlist.items.length; i < ik; i++) {
            if (
                layerlist.items[i]['id'] != 'lengthLrc' &&
                layerlist.items[i].type != 'tile' &&
                layerlist.items[i].title != null &&
                layerlist.items[i].type != 'graphics' &&
                layerlist.items[i]['id'].indexOf('影像图') < 0
            ) {
                if (layerlist.items[i].visible) {
                    var attributelayer = new Object();
                    attributelayer.layername = layerlist.items[i].id;
                    attributelayer.layerurl = layerlist.items[i].url;
                    attributelayer.opacity = layerlist.items[i].opacity;
                    attributelayer.sublayer = [];

                    //获取layer在map中的索引
                    const layerindex = store.state['onemap-store'].mapview.map.allLayers.items.findIndex(function (val) {
                        return val.id === layerlist.items[i].id
                    });
                    attributelayer.index=layerindex;
                    for (
                        var k = 0,kk=layerlist.items[i].allSublayers.length;
                        k <kk ;
                        k++
                    ) {
                        if (layerlist.items[i].allSublayers.items[k].visible) {
                            attributelayer.sublayer.push(
                                layerlist.items[i].allSublayers.items[k].id
                            );
                        }
                    }
                    if (attributelayer.sublayer.length > 0) {
                        openalllayerlist.push(attributelayer);
                    }
                }
            }
        }
        return openalllayerlist;
    }
}


//获取当前地图上全部打开的图层
export function getAllOpenSubLayers() {
    var layerlist = store.state['onemap-store'].mapview.map.allLayers;
    var openalllayerlist = [];
    if (layerlist.length > 0) {
        for (var i = 0,ik=layerlist.items.length; i < ik; i++) {
            if (
                layerlist.items[i]['id'] != 'lengthLrc' &&
                layerlist.items[i].type != 'tile' &&
                layerlist.items[i].title != null &&
                layerlist.items[i].type != 'graphics' &&
                layerlist.items[i]['id'].indexOf('影像图') < 0
            ) {
                if (layerlist.items[i].visible) {
                    var attributelayer = new Object();
                    attributelayer.layername = layerlist.items[i].id;
                    attributelayer.layerurl = layerlist.items[i].url;
                    attributelayer.opacity = layerlist.items[i].opacity;
                    attributelayer.type='server'
                    attributelayer.sublayer = [];
                    attributelayer.isClick=true;

                    //获取layer在map中的索引
                    const layerindex = store.state['onemap-store'].mapview.map.allLayers.items.findIndex(function (val) {
                        return val.id === layerlist.items[i].id
                    });
                    attributelayer.index=layerindex;
                    let kk=layerlist.items[i].allSublayers.length
                    for (
                        var k = kk-1;
                        k>=0;
                        k--
                    ) {
                        if (layerlist.items[i].allSublayers.items[k].visible) {
                            let sublayer=layerlist.items[i].allSublayers.items[k];
                            var sublayerObject = new Object();
                            sublayerObject.layername=sublayer.title;
                            sublayerObject.opacity=sublayer.opacity;
                            sublayerObject.type='sublayer'
                            sublayerObject.layerurl = sublayer.url;
                            sublayerObject.servername = attributelayer.layername ;
                            sublayerObject.serverurl = attributelayer.url;
                            sublayerObject.sublayerid = sublayer.id;
                            sublayerObject.isClick=true;
                            attributelayer.sublayer.push(
                                sublayerObject
                            );
                        }
                    }
                    if (attributelayer.sublayer.length > 0) {
                        openalllayerlist.push(attributelayer);
                    }
                }
            }
        }
        return openalllayerlist;
    }
}

export async function visibleLayer(layername, visible) {
    var layer = store.state['onemap-store'].mapview.map.findLayerById(layername);
    if (layer != undefined) {
        layer.visible = visible;
    } else {
        console.log('无法找到图层:' + layername);
    }
}

//叠加图层layer
export async function addlayer(layername, layerurl) {
    var layer = new MapImageLayer({
        id: layername,
        url: layerurl,
        visible: true,
    });
    store.state['onemap-store'].mapview.map.add(layer, 0);
}

//移除图层layer
export async function removelayer(layername) {
    var layer = store.state['onemap-store'].mapview.map.findLayerById(layername);
    if (layer != undefined) {
        store.state['onemap-store'].mapview.map.remove(layer, 0);
    } else {
        console.log('无法找到图层:' + layername);
    }
}

//地图快照（地图打印的一种方式）有参数
export async function mapScreenhotOptions(layers) {
    //var layer = store.state["onemap-store"].mapview.map.findLayerById(layername);
    let options = {
        layers: layers,
    };

    let screenshot = await store.state['onemap-store'].mapview.takeScreenshot(
        options
    );
    return screenshot.dataUrl;
}
//地图快照（地图打印的一种方式）无参数
export async function mapScreenhot() {
    let screenshot = await store.state['onemap-store'].mapview.takeScreenshot();
    return screenshot.dataUrl;
}

//地图快照保存
//filename:上传的地块红线的文件名称或者自定义画的地块的文件名称
//savepath:保存的文件夹名称
//imagedata:base64图片
//imagetype:1:原图，2：冲突图形
export async function saveMapPrintImage(
    filename,
    savepath,
    imagedata,
    imagetype
) {
    // let imageurl = "";
    // if (imagetype == 1) {
    //   imageurl = await mapScreenhot();
    // } else if (imagetype == 2) {
    //   imageurl = await mapScreenhotOptions(filename);
    // }

    let params = {
        imgname: filename,
        imagedata: imagedata,
        savepath: savepath,
        imagetype: imagetype,
    };
    const  data = await savePrintBitImage(params);
    if (data.code == 200) {
        console.log('地图快照图片保存成功');
    } else {
        console.log('地图快照图片保存失败');
    }
    return data.data;
}

//裁剪不冲突图形
//cutGeo:要裁剪的图形
//compareGeo:与裁剪的图形做比较的图形
//返回不冲突图形的geometry
export async function GetGeoDifference(cutGeo, compareGeo) {
    let insGeo = await geometryEngine.union(compareGeo);
    //let MapGeometryServerUrl = await getMapGeometryServiceUrl();
    let diffGeo = await geometryEngine.difference(cutGeo, insGeo);
    console.log(diffGeo, 'diffGeo');
    return diffGeo;
}

//图形转坐标点
export function GeoToPointStr(geometry) {
    let pointstr = '';
    console.log(geometry, 'geometry');
    for (var i = 0; i < geometry.rings.length; i++) {
        var pointarr = geometry.rings[i];
        for (let j = 0; j < pointarr.length; j++) {
            const point = pointarr[j];
            pointstr += point[1] + ',' + point[0] + ';';
        }
        pointstr += '*';
    }
    return pointstr.trimEnd('*');
}

//计算图形面积和周长
export async function getAreaAndLength(geometry) {
    let MapGeometryServerUrl = await getMapGeometryServiceUrl();
    let simplifiedGeometries = await simplify(MapGeometryServerUrl, [geometry]);
    const areasAndLengthParams = new AreasAndLengthsParameters({
        areaUnit: 'hectares', //公顷
        lengthUnit: 'kilometers', //公里
        polygons: simplifiedGeometries,
    });
    let result = await areasAndLengths(
        MapGeometryServerUrl,
        areasAndLengthParams
    );
    let totalarea = Number(result.areas[0]).toFixed(4);
    let totallength = Number(result.lengths[0]).toFixed(4);
    return { area: totalarea, length: totallength, geo: geometry };
}

//导出坐标点的txt文件
//geometry:导出的图形
//filename:导出文件名
//pointtype:坐标系类型:1:经纬度坐标系，2：投影坐标系
export async function exportPointTxt(geometry, filename, pointtype) {
    var exportText = '';
    if (pointtype == 2) {
        exportText += '[属性描述]\r\n';
        exportText += '坐标系=2000国家大地坐标系\r\n';
        exportText += '几度分带=3\r\n';
        exportText += '投影类型=高斯克吕格\r\n';
        exportText += '计量单位=米\r\n';
        exportText += '带号=38\r\n';
        exportText += '精度=0.001\r\n';
        exportText += '转换参数=,,,,,,\r\n';
    }
    exportText += '[地块坐标]\r\n';

    //exportText += "8,0.7655公顷,,地块1,面,,,,@\r";
    //支持导出多地块txt
    if (geometry.rings.length > 0) {
        if (pointtype == 1) {
            //经纬度
            for (let r = 0; r < geometry.rings.length; r++) {
                //创建geometry
                let polygon = new Polygon({
                    rings: geometry.rings[r],
                    spatialReference: {
                        wkid: store.state['onemap-store'].mapview
                            .spatialReference.wkid,
                    },
                });
                var pointstrarr = '';
                let areaandlength = await getAreaAndLength(polygon);
                exportText +=
                    areaandlength.area +
                    '公顷,,地块' +
                    (r + 1) +
                    ',面,,,,@\r\n';
                const ring = geometry.rings[r];
                for (var i = 0; i < ring.length; i++) {
                    var pointarr = ring[i];
                    if (i + 1 == ring[i].length) {
                        pointstrarr +=
                            'J1,1,' + pointarr[1] + ',' + pointarr[0] + '\r\n';
                    } else {
                        pointstrarr +=
                            'J' +
                            (i + 1) +
                            ',1,' +
                            pointarr[1] +
                            ',' +
                            pointarr[0] +
                            '\r\n';
                    }
                }
                exportText += pointstrarr;
            }
            exportRaw(filename + '.txt', exportText);
        } else {
            //投影坐标系
            var spatialRef = new SpatialReference({
                wkid: projectedWkid,
                // wkid:4549
            }); //投影坐标系

            //const geomSer = new GeometryService( ... );
            const params = new ProjectParameters({
                geometries: [geometry],
                outSpatialReference: spatialRef,
            });
            let MapGeometryServerUrl = await getMapGeometryServiceUrl();
            console.log('resbefore');
            let results = await project(MapGeometryServerUrl, params);
            for (let r = 0; r < results[0].rings.length; r++) {
                //创建geometry
                let polygon = new Polygon({
                    rings: results[0].rings[r],
                    spatialReference: spatialRef,
                });
                var pointstrarr = '';
                let areaandlength = await getAreaAndLength(polygon);
                exportText +=
                    areaandlength.area +
                    '公顷,,地块' +
                    (r + 1) +
                    ',面,,,,@\r\n';
                const ring = results[0].rings[r];

                for (var i = 0; i < ring.length; i++) {
                    var pointarr = ring[i];
                    if (i + 1 == ring[i].length) {
                        pointstrarr +=
                            'J1,1,' + pointarr[1] + ',' + pointarr[0] + '\r\n';
                    } else {
                        pointstrarr +=
                            'J' +
                            (i + 1) +
                            ',1,' +
                            pointarr[1] +
                            ',' +
                            pointarr[0] +
                            '\r\n';
                    }
                }
                exportText += pointstrarr;
            }
            exportRaw(filename + '.txt', exportText);
        }
    }
}

//导出txt文件的方法
function exportRaw(name, data) {
    var urlObject = window.URL || window.webkitURL || window;
    var export_blob = new Blob([data]);
    var save_link = document.createElementNS(
        'http://www.w3.org/1999/xhtml',
        'a'
    );
    save_link.href = urlObject.createObjectURL(export_blob);
    save_link.download = name;
    fakeClick(save_link);
}

function fakeClick(obj) {
    var ev = document.createEvent('MouseEvents');
    ev.initMouseEvent(
        'click',
        true,
        false,
        window,
        0,
        0,
        0,
        0,
        0,
        false,
        false,
        false,
        false,
        0,
        null
    );
    obj.dispatchEvent(ev);
}