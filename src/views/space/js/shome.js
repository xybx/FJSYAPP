/*
 * @ProjectName:fjsy-app
 * @Author:12390
 * @Date: 2023/3/23 17:48:30
 * @LastEditors: 12390
 * @LastEditTime: 2023/3/23 17:48:30
 * @Description: HTML Page of Javascript
 * Copyright (c) 2022 by xybx, All Rights Reserved. 
*/
import '@/assets/diyfonts/fangzht.css'
import '@/assets/diyfonts/hanymxt.css'
import { getMenuList } from '../api/shome'
import Vue from 'vue';
export default {
  name: 'shome',
  data() {
    return {
      moudleData:[],
    }
  },
  components: {},
  computed: {},
  created() {
  },
  mounted() {
    this.getData()
  },
  methods: {
    async getData(){
      let arr = []
      let res = await getMenuList()
      if(res.code == 200){
         res.data.map(item=>{
           arr.push({
             name:item.fullTitle,
             pid:item.pid,
             url:`/series?mtype=${item.pid}`
          })
        })
      }
      this.moudleData = [
        {
          title:'系列成果',
          icon:'icon-guihuasheji',
          uclass:'animate__fadeInLeft',
          dclass:'animate__lightSpeedInLeft',
          children:arr
          // children: [
          //   {name:'城市建设发展',url:'/series?mtype=1'},
          //   {name:'村庄规划系列',url:'/series?mtype=7'},
          //   {name:'历史文化保护',url:'/series?mtype=2'},
          //   {name:'城市设计系列',url:'/series?mtype=8'},
          //   {name:'城市体检系列',url:'/series?mtype=3'},
          //   {name:'园林景观系列',url:'/series?mtype=9'},
          //   {name:'总体规划系列',url:'/series?mtype=4'},
          //   {name:'信息平台建设',url:'/series?mtype=10'},
          //   {name:'专项规划系列',url:'/series?mtype=5'},
          //   {name:'其他代表成果',url:'/series?mtype=11'},
          //   {name:'详细规划系列',url:'/series?mtype=6'},
          // ]
        },
        {
          title:'平台支撑',
          icon:'icon-shujujiance',
          uclass:'animate__bounceInDown',
          dclass:'animate__zoomIn',
          children: [
              {name:'福建省城市体检指标监测',url:'/espace'},
              {name:'福建省九市一区城市建设高质量发展指标监测',url:'/city'},
              {name:'城市建设品质提升行动',url:'/quality'},
              {name:'......',url:''},
          ]
        },
        {
          title:'智慧城市',
          icon:'icon-chengshiguanli',
          uclass:'animate__bounceInUp',
          dclass:'animate__zoomIn',
          children: [{name:'数字孪生城市1.0',url:'/plant'}, {name:'......',url:''},]
        },
        // {
        //   title:'精细化治理',
        //   icon:'icon-chengshimingpian',
        //   uclass:'animate__fadeInRight',
        //   dclass:'animate__lightSpeedInRight',
        //   children: [{name:'数字孪生城市1.0',url:'/plant'}]
        // }
      ]
    },
    navClick(url){
      if (!sessionStorage.getItem("apptoken")) {
        this.$message.warning("登录已过期！");
        this.$router.push({
          path: "/login",
        });
        return;
      }
      if (url == '') {
        this.$message.warning("当前页面暂未开放！");
        return;
      }else if(url == '/plant'){
        this.$router.push({
          path:url
        })  
      }else {
        let targetUrl = `${Vue.prototype.highQualityUrl}${url}${url.indexOf('?') > -1 ? '&token=' : '?token='}${sessionStorage.getItem("apptoken")}&user=${JSON.parse(sessionStorage.getItem("appuser")).name}`
        window.location.href = targetUrl;
      }
    },
    goback() {
      this.$router.push({
        path: "/index",
      });
    },
  }
}