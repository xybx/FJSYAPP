/*
 * @Author: ssq
 * @Date: 2022-10-18 16:28:39
 * @LastEditors: ssq
 * @LastEditTime: 2022-10-19 18:50:45
 * @FilePath: \fjsy-app\src\api\login.js
 * @Description: 
 * 
 * Copyright (c) 2022 by hydp, All Rights Reserved. 
 */
import request from '../utils/request'

// 登录
export const login = (params) => {
    return request({
        method: 'POST',
        url: '/login/login',
        data: params
    })
}

// 登出
export const logout = () => {
    return request({
        method: 'GET',
        url: '/login/logout'
    })
}
export const editPass = (data) => {
    return request({
        method: 'POST',
        url: '/login/password',
        data
    })
}

