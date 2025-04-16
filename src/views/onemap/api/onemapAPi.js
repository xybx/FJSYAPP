import request from '@/utils/request';
import axios from 'axios';
// 查询定位服务列表接口
export const getQuery = (params) => {
    return request({
        method: 'GET',
        url: '/OneMap/GetQueryLocation',
        params,
    });
};

// 获取计算服务配置
export const getMapGeometryService = (params) => {
    return request({
        method: 'GET',
        url: '/MapConfig/GetUserGeometryService',
        params,
    });
};
// 图层服务地址接口
export const getServer = (url) => {
    const requestServer = axios.create({
        baseURL: url,
    });
    return requestServer({
        method: 'GET',
        url: '?f=pjson&token=' + sessionStorage.getItem("arcgisToken"),
    });
};