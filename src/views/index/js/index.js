/*
 * @Author: CPL
 * @Date: 2022-10-19 21:09:49
 * @LastEditTime: 2023-06-12 17:28:53
 * @LastEditors: xybx
 * @Description:
 * @FilePath: \fjsy-app\src\views\index\js\index.js
 * Copyright (c) 2022 by hydp, All Rights Reserved.
 */

import { logout } from '@/api/login';
import passlog from "../components/passlog.vue";
import Vue from 'vue';
export default {
    name: 'index',
    props: {},
    components: {passlog},
    data() {
        return {
            headList: [
                {
                    id: '1005',
                    class: 'img0',
                    // imgURL: require('../assets/index/1.png'),
                    iconclass: 'iconfont icon-shikong-kongjianxuanzhong',
                    name: '八闽概况',
                    intro: '围绕生态绿色、城市品质、创新活力等领域生成全省城市空间图谱，全方位、多尺度展示福建全省现状与城市发展特征。',
                },
                {
                    id: '1001',
                    class: 'img1',
                    // imgURL: require('../assets/index/1.png'),
                    iconclass: 'iconfont icon-liuchengguanli',
                    name: '业绩画像',
                    intro: '建立我院2012年至今的项目数据库，搭建业务画像体系，为我院优势资源的投放提供决策参考，更好服务于全省城市高质量发展。',
                },
                {
                    id: '1002',
                    class: 'img2',
                    // imgURL: require('../assets/index/2.png'),
                    iconclass: 'iconfont icon-jianguan3',
                    name: '数据底座',
                    intro: '汇聚我院各类空间数据资源，建立全省范围内的行业数据底座。通过数据资源的共建共享，支撑城市建设与规划的各领域应用。',
                },
                {
                    id: '1003',
                    class: 'img3',
                    // imgURL: require('../assets/index/3.png'),
                    iconclass: 'iconfont icon-shikong-kongjianxuanzhong',
                    name: '数字赋能',
                    intro: '通过信息化技术搭建面向多领域应用的智能分析模块，创新行业数据分析与应用模式，实现城市发展规律探索的数字化赋能。',
                },
                {
                    id: '1004',
                    class: 'img4',
                    // imgURL: require('../assets/index/4.png'),
                    iconclass: 'iconfont icon-city_fill',
                    name: '空间治理',
                    intro: '聚焦行业发展重点领域，构建“数据-分析-应用”的场景闭环。采用可视化技术实现应用成果汇聚，辅助城市管理者进行科学化决策。',
                },
            ],
            username: '',
            onlineData: {
                firstModule: '首页',
            },
        };
    },
    computed: {},
    watch: {},
    methods: {
        handleClick(index) {
            debugger;
            if (
                JSON.parse(sessionStorage.getItem('appuser')).powers.indexOf(
                    index
                ) == -1
            ) {
                this.$message.error('没有此页面访问权限！');
                return;
            }
            if (index == 1005) {
                let targetUrl =
                    Vue.prototype.highQualityUrl +
                    '/ehome' +
                    '?token=' +
                    sessionStorage.getItem('apptoken') +
                    '&user=' +
                    JSON.parse(sessionStorage.getItem('appuser')).name;
                window.location.href = targetUrl;
            } else if (index == 1001) {
                this.$router.push({
                    path: '/paint',
                });
            } else if (index == 1002) {
                this.$router.push({
                    path: '/onemap',
                });
            } else if (index == 1004) {
                this.$router.push({
                    path: '/shome',
                });
            }
            // 数字赋能
            else if (index == 1003) {
              debugger
                let targetUrl =
                    Vue.prototype.highQualityUrl +
                    '/digital' +
                    '?token=' +
                    sessionStorage.getItem('apptoken') +
                    '&user=' +
                    JSON.parse(sessionStorage.getItem('appuser')).name;
                window.location.href = targetUrl;
            }
        },
        // 退出登录
        handleCommand(command) {
            if (command == 'logout') {
                sessionStorage.removeItem('apptoken');
                sessionStorage.removeItem('appuser');
                localStorage.removeItem('queryCondition');
                this.$router.push('/login');
            }else if(command == 'editPass'){
               this.$refs.passlog.showEdit()
            }
        },
    },
    created() {},
    mounted() {
        this.username = JSON.parse(sessionStorage.getItem('appuser'));
    },
};
