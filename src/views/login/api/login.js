/*
 * @Author: ssq
 * @Date: 2022-10-18 16:28:39
 * @LastEditors: ssq
 * @LastEditTime: 2022-10-18 16:46:05
 * @FilePath: \fjsy-app\src\api\login.js
 * @Description: 
 * 
 * Copyright (c) 2022 by hydp, All Rights Reserved. 
 */
import request from "@/utils/request";

// 登录接口
export const login = (params) => {
    return request({
        method: 'POST',
        url: '/login/loginName',
        data: params
    })
}
