/*
 * @Author: ssq
 * @Date: 2022-10-22 14:43:02
 * @LastEditors: xybx
 * @LastEditTime: 2023-08-17 09:10:48
 * @FilePath: \fjsy-app\src\main.js
 * @Description: 
 *Copyright (c) 2022 by hydp, All Rights Reserved.
 */
import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
//引入DataV组件
// import dataV from "@jiaminghi/data-view";
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import axios from 'axios';
//引入iconfont图标
import '@/assets/fonts/iconfont.css';
import '@/assets/fonts/iconfont.js';
import * as echarts from 'echarts';
// ArcGIS
import '@arcgis/core/assets/esri/themes/light/main.css';
// 引入global
import '@/assets/style/global.scss';
import esriConfig from '@arcgis/core/config';
import get3DToken from '@/utils/map_request'

esriConfig.assetsPath = './arcgis_assets';
esriConfig.fontsUrl = './arcgis_fonts';
import vueDirectiveExtend from 'vue-directive-extend'

// 挂载原型（http可以取任意名称）
Vue.prototype.$http = axios;
Vue.use(ElementUI);
Vue.use(vueDirectiveExtend);
// 引入动画
import animated from 'animate.css';
// Vue.use(animated);
// 引入iconfont 一张图模块
// import '@/assets/icons/iconfont.css';
// import '@/assets/icons/iconfont';

Vue.prototype.apiURL_file=window.apiURL_file;//定义全局变量方法
Vue.prototype.highQualityUrl=window.highQualityUrl;//
Vue.config.productionTip = false;
Vue.prototype.$echarts = echarts;

Vue.prototype.$mapToken = get3DToken
// Vue.use(dataV);
new Vue({
    router,
    store,
    render: (h) => h(App),
}).$mount('#app');
