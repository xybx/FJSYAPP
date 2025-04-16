import request from '@/utils/request';
//历史画像获取行政区项目数量
export const getPargrams = (params) => {
    return request({
        method: 'GET',
        url: '/historyprj/getprjstaticesbycity',
        params,
    });
};
export function getCity(){
    return request({
        url:'/historyprj/getcitylist',
        method:'GET',
    })
}
export function getVillage(params){
    return request({
        url:'/historyprj/getdistrictlist',
        method:'GET',
        params
    })
}
//技术服务分布情况信息
export function getechnical(){
    return request({
        url:'/historyprj/echnicalService',
        method:'GET',
    })
}
//项目类型概况信息
export function getsurvey(params){
    return request({
        url:'/historyprj/surveyStatistics',
        method:'GET',
        params
    })
}
//历年项目变化情况
export function getprjtype(params){
    return request({
        url:'/historyprj/prjtypechange',
        method:'GET',
        params
    })
}
//近十年项目情况
export function getprjinfo(params){
    return request({
        url:'/historyprj/prjinfointenyears',
        method:'GET',
        params
    })
}

//查询列表
export function getQueryList(data){
    return request({
        url:'/business/search/list',
        method:'POST',
        data
    })
}
//列表字段
export function getFieldList(){
    return request({
        url:'/business/search/result/field/list',
        method:'GET',
    })
}
//查询字段
export function getConditions(){
    return request({
        url:'/business/search/search/condition/list',
        method:'GET',
    })
}
export function getPower(){
    return request({
        url:'/historyprj/auth/data',
        method:'GET',
    })
}

// 业绩画像项目要展示的属性
export const authfields = () => {
    return request({
        method: 'GET',
        url: '/historyprj/auth/fields',
    });
};
