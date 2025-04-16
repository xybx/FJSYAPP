/*
 * @Author: ssq
 * @Date: 2022-10-31 10:52:52
 * @LastEditors: ssq
 * @LastEditTime: 2022-12-22 16:10:34
 * @FilePath: \fjsy-app\src\router\index.js
 * @Description: 
 * 
 * Copyright (c) 2022 by hydp, All Rights Reserved. 
 */
import Vue from "vue";
import VueRouter from "vue-router";
import {insertAddLog, exitEndLog, editSessionStorage, heart} from '@/api/OnlineLog-api'

Vue.use(VueRouter);

const routes = [
    {
        path: "/",
        redirect: "/login",

    },
    {
        path: "/login",
        name: "Login",
        component: () => import("../views/login/vue/login.vue"),
        meta: {
            title: "智慧规划平台",
        },
    },
    {
        path: "/index",
        name: "Index",
        component: () => import("../views/index/vue/index.vue"),
        meta: {
            title: "福建省城乡规划设计研究院智慧规划平台",
            onlineData: {
                firstModule: "系统使用时长"
            }
        },
    },
    {
        path: "/shome",
        name: "Shome",
        component: () => import("../views/space/shome.vue"),
        meta: {
            title: "空间治理",
            onlineData: {
                secondModule: "空间治理"
            }
        },
    },
    {
        path: '/plant',
        name: 'Plant',
        component: () => import("../views/plant/plant.vue"),
        meta: {
            title: "数字孪生1.0",
            onlineData: {
                secondModule: "空间治理",
                thirdModule: "数字孪生1.0"
            }
        },
    },
    {
        path: "/paint",
        name: "Paint",
        component: () => import("../views/paint/paint.vue"),
        meta: {
            title: "业绩画像",
            onlineData: {
                secondModule: "业绩画像"
            }
        },
    },
    {
        path: "/onemap",
        name: "Onemap",
        component: () => import("../views/onemap/vue/OneMap.vue"),
        meta: {
            title: "数据底座",
            onlineData: {
                secondModule: "数据底座"
            }
        },
    },
];

const router = new VueRouter({
    routes,
});

//自定义标题
router.beforeEach((to, from, next) => {
    if (to.meta.title) {
        document.title = to.meta.title;
    }
    if (to.path != "/"  && to.path != "/login") {
        editSessionStorage(to.meta.onlineData);
        insertAddLog(to.meta.onlineData);
    }
    if (from.path != "/" && from.path != "/login" && from.path != "/index") {
        exitEndLog(from.meta.onlineData);
    }
    let hastoken = sessionStorage.getItem("apptoken")
    if (hastoken) {
        if (to.path === '/login') {
            sessionStorage.removeItem("apptoken");
            sessionStorage.removeItem("appuser");
            next();
        } else {
            // 记录

            next()
        }
    } else {
        if (to.path !== '/login') {
            next({path: '/login'});
        }
        next()
    }
});

export default router;
