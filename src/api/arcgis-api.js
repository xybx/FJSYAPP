/*
 * @Author: ssq
 * @Date: 2022-10-18 15:41:03
 * @LastEditors: ssq
 * @LastEditTime: 2022-10-18 16:28:43
 * @FilePath: \fjsy-app\src\api\arcgis-api.js
 * @Description: 
 * 
 * Copyright (c) 2022 by hydp, All Rights Reserved. 
 */
import request from '../utils/request'

// 获取底图配置
export const getBaseMapAPI = () => {
    return request({
        method: 'GET',
        url: '/api/UserConfig/GetBaseMap'
    })
}
export const getMenuList = (params) => {
    return request({
        method: 'GET',
        url: '/api/OneMap/GetMenuList',
        params: params
    })
}
// 底图配置接口
export const getMapConfig = (params) => {
    return request({
        method: 'GET',
        url: '/api/MapConfig/GetBaseMap',
        params,
    });
};

// 底图配置接口
export const getMapConfigList = (params) => {
    return request({
        method: 'GET',
        url: '/api/MapConfig/GetBaseMap/list',
        params,
    });
};