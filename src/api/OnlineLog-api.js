// import request from '../utils/request'
import axios from "axios";

const heartAxios = axios.create({
    baseURL: window.apiURL,
});

// const cancelSource = axios.CancelToken.source();

heartAxios.interceptors.request.use(config => {
    const token = sessionStorage.getItem("apptoken");
    if (token) {
        config.headers.Authorization = token;
    } else {
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// 心跳
export const heart = (data) => {
    const token = sessionStorage.getItem("apptoken");
    if (token) {
        heartAxios.post("/online/log/heart", data)
            .then(response => {
                // 不做处理
            })
            .catch(error => {

            });
    }
}

// 进入页面后触发事件
export const insertAddLog = (data) => {
    const token = sessionStorage.getItem("apptoken");
    if (token) {
        heartAxios.post("/online/log/add", data)
            .then(response => {
                // 发送心跳
                if (response.data.code == 200) {
                    let onlineData = JSON.parse(sessionStorage.getItem(window.onlineKey));
                    if (onlineData) {
                        heart(onlineData);
                    }
                }
            })
            .catch(error => {
                if (axios.isCancel(error)) {
                    console.log('Request canceled', error.message);
                } else {
                    console.error(error);
                }
            });
    }

}

// 退出页面后触发事件
export const exitEndLog = (data) => {
    const token = sessionStorage.getItem("apptoken");
    if (token) {
        heartAxios.post("/online/log/end", data)
            .then(response => {
                // 不做处理
            })
            .catch(error => {

            });
    }
}

// 修改sessionStorage
export const editSessionStorage = (data) => {
    sessionStorage.setItem(window.onlineKey, JSON.stringify(data));
}