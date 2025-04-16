/*
 * @ProjectName:fjsy-app
 * @Author:12390
 * @Date: 2023/3/14 15:13:47
 * @LastEditors: 12390
 * @LastEditTime: 2023/3/14 15:13:47
 * @Description: HTML Page of Javascript
 * Copyright (c) 2022 by xybx, All Rights Reserved. 
*/
import request from '@/utils/request';
const getMenuList = ()=>{
    return request({
        url:'/fjsy-achievement/getLists',
        method:'get',
    })
}
export { getMenuList }