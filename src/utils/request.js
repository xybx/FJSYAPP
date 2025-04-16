/*
 * @Author: 王成龙
 * @Date: 2021-11-12 13:22:42
 * @LastEditors: ssq
 * @LastEditTime: 2022-12-22 16:05:13
 * @FilePath: \fjsy-app\src\utils\request.js
 * @Description: axios 入口请求文件
 */
import router from "@/router";
import axios from "axios";
import { Message } from "element-ui";

const request = axios.create({
  baseURL: window.apiURL,
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("apptoken");
    const user = sessionStorage.getItem("appuser");
    if (user && token) {
      // config.headers.auth = token;
      config.headers.Authorization = token;
    } else {
      // return router.push("/login");
    }
    return config;
  },
  (error) => {
    return Promise.reject();
  }
);

// 响应拦截
request.interceptors.response.use(
  (response) => {
    if (response.status == 200) {
      if (response.data.code == 200) {
        return response.data;
      } if (response.data.code === 403) {
        sessionStorage.removeItem("apptoken");
        sessionStorage.removeItem("appuser");
        Message.warning("登录信息已过期，请重新登录！");
        return router.push("/login")
      } else {
        Message.error(response.data.msg);
        return response.data;
      }
    } else {
      return Promise.reject();
    }
  },
  (error) => {
    const { response } = error;
    let hastoken = sessionStorage.getItem("apptoken")
    if (hastoken != null) {
      if (response.data.code === -1) {
        Message.error(response.data.msg);
      }
    } else {
      return router.push("/login"); //return Message.error(response.data.msg);
    }
    return Promise.reject();
  }
);
export default request;