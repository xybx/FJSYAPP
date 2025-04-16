/*
 * @ProjectName:fjsy-app
 * @Author:12390
 * @Date: 2023/3/14 15:19:09
 * @LastEditors: 12390
 * @LastEditTime: 2023/3/14 15:19:09
 * @Description: HTML Page of Javascript
 * Copyright (c) 2022 by xybx, All Rights Reserved. 
*/
import Gchart from '@/components/globalCharts.vue';
import {getSecData, getTargetList, getyears} from "../api/espaceApi";
let Bigtimer = null;
let timer = null;
export default{
  name: 'espace',
  data() {
    return {
      username: '',
      allData:[],
      leftData:[],
      rightData:[],
      years:'',
      targetData:[],
      secondData:[],
      yearData:[],
      currFirst:'',
      currSecond:'',
      currentPage:1,
      chartLoop:true,
      maxs:1,
      demoVal:[]
    }
  },
  components: {
    Gchart
  },
  computed: {
  },
  created() {

  },
  mounted() {
    this.getYear()
    this.getuser()

  },
  methods:{
    async getYear(){
      let res = await getyears()
      this.yearData = res.data ? res.data : []
      this.years = res.data[0]
      this.getTarget()
    },
    yearChange(val){
      this.years = val
    },
    getData(){
      this.allData = this.targetData.slice((this.currentPage - 1) * 4, this.currentPage * 4)
      this.maxs = Math.max.apply(Math, [...new Set(this.allData.map(item => item.length))])
      this.allData.map((item,index)=>{
        Object.assign(item,{
          // chartdata:{xdata:[],ydata:[]},
          xdata:[],
          ydata:[],
          chartid:`chartBox${index}`,
          curPage: 1,
          showLoop: true,
        })
        this.sloopChart(item,this.years);
        //this.setChartData(item,this.years);
      })
      this.BigloopChart()
    },
    getuser() {
      this.username = JSON.parse(sessionStorage.getItem('appuser')).name
    },
    async getTarget(){
      let res = await getTargetList({year:this.years})
      this.targetData = res.data ? res.data: []
      this.secondData = res.data[0].typeNameList
      this.currFirst = res.data[0].typeName
      this.getData()
    },
    setChartData(item,years){
      timer = setInterval( async () => {
         this.sloopChart(item,years);
      }, 5000);
    },
    async sloopChart(item,years){
      if(item.showLoop){
        this.$set(item,'showLoop',item.curPage++)
        if (item.curPage > item.length) {
          this.$set(item,'curPage',1)
        }
          let obj = {typeName:item.typeNameList[item.curPage - 1].typeName,year:years}
          let res  = await getSecData(obj)
          let nameList = [];
          let valList = [];
          res.data.cityDataVOList.map(val=>{
            nameList.push(val.cityName)
            valList.push(val.value)
          })
          // item.chartData.xdata = nameList;
          // item.chartData.ydata = valList;
          // let beforeChartData = item.chartData
          this.$set(item,'xdata',nameList)
          this.$set(item,'ydata',valList)
          // console.log(item,'beforeChartData')
          // debugger
      }
    },
    handleTarget(item){
      this.currFirst = item.typeName
      this.secondData = item.typeNameList
    },
    handleSecTarget(item){
      this.currSecond = item.typeName
    },
    BigloopChart(){
      // Bigtimer = window.setInterval(() => {
      //   if (this.chartLoop) {
      //     this.currentPage++;
      //     let pages = Math.ceil(this.targetData.length / 4);
      //     if (this.currentPage > pages) {
      //       this.currentPage = 1;
      //     }
      //     this.getData()
      //   }
      // }, (this.maxs * 5000) + 3000);
    },
    overChartBox(item, val){
      this.chartLoop = val;
    },
    goback() {
      this.$router.push({
        path: "/shome",
      });
    },
    logout() {
      sessionStorage.removeItem("apptoken");
      sessionStorage.removeItem("appuser");
      this.delCookie();
      this.$router.push({
        path: "/login",
      });
    },
    delCookie() {
      var cookies = document.cookie.split(";");
      for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie =
            name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      }
      if (cookies.length > 0) {
        for (var i = 0; i < cookies.length; i++) {
          var cookie = cookies[i];
          var eqPos = cookie.indexOf("=");
          var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
          var domain = location.host.substr(location.host.indexOf("."));
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=" + domain;
        }
      }
    },
  },

}