/*
 * @ProjectName:fjsy-app
 * @Author:12390
 * @Date: 2023/3/14 15:14:00
 * @LastEditors: 12390
 * @LastEditTime: 2023/3/14 15:14:00
 * @Description: HTML Page of Javascript
 * Copyright (c) 2022 by xybx, All Rights Reserved. 
*/
import request from '@/utils/request';
export function getyears(){
  return request({
    url: '/cityHealth/year',
    method: 'GET',
  })
}
export function getSecData(data){
  return request({
    url: '/cityHealth/typeDetail',
    method: 'POST',
    data
  })
}
export function getTargetList(params){
  return request({
    url: '/cityHealth/typeList',
    method: 'GET',
    params
  })
}