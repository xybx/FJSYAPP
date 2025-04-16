/*
 * @Author: ssq
 * @Date: 2022-11-18 13:06:35
 * @LastEditors: xybx
 * @LastEditTime: 2023-12-12 14:44:03
 * @FilePath: \fjsy-app\public\index.js
 * @Description:
 *
 * Copyright (c) 2022 by hydp, All Rights Reserved.
 */
// 图形渲染的形式 1:面 ，2：边界线
const symbolStyle = 2;
const onlineKey = "app-onlineKey";

// 文件预览前缀地址
// const apiURL_file = 'http://192.168.1.182';
// const apiURL_file = 'http://192.168.80.27';
// const apiURL_file = 'http://192.168.1.179:9866';
const apiURL_file = 'http://192.168.1.189:8082/pics'
// const apiURL_file = 'http://10.10.4.200';

// 设置公共请求头
// const apiURL = "http://192.168.1.182:8085";
const apiURL = "http://192.168.1.189:8085";
// const apiURL = "http://192.168.1.146/fjsyapi";
// const apiURL = "http://192.168.1.189:8085/fjsyapi";
// const apiURL = "http://192.168.80.27/sjdzapi";
// const apiURL = "http://10.10.4.200/fjsyapi";


// 空间治理+数字赋能跳转地址
// const highQualityUrl = 'http://10.10.4.200/fq/#';
// const highQualityUrl = 'http://192.168.80.27/sjdz/#';
// const highQualityUrl = 'http://192.168.1.182:5173/#';
const highQualityUrl = 'http://192.168.1.156:5173/#';
// const highQualityUrl = 'http://192.168.1.186:5173/#';


const server = "http://192.168.1.146:6080/arcgis/rest/services";
const tokenServiceUrl = "http://192.168.1.146:6080/arcgis/tokens/generateToken";
const username = "test";
const password = "test123";
const expirseTime = 1439;

window.layerConfig = [33, 152, 153, 233]
window.layerExpand = 233;
