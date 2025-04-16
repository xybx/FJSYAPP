<template>
  <el-row>
    <el-col :span="7">
      <div class="itembox h50">
        <div class="titbox">
          <span>项目类型概况（2012年至今）</span>
          <ul class="blist" :class="!noshow ? 'slist' : ''">
            <li
                v-for="(item, index) in tabData"
                :class="{ active: sortactivest == index }"
                :key="index"
                @click="btnClick(index)"
            >
              {{ item }}
            </li>
          </ul>
        </div>
        <ul class="plist">
          <li v-for="(item, index) in iconData" :key="index">
            <i></i>
            <span
            ><u>{{ item.nums }}</u
            >{{ sortactivest == 0 ? "个" : "万元" }}</span
            >
            <span>{{ item.name }}</span>
          </li>
        </ul>
      </div>
      <div class="itembox h50">
        <div class="titbox">
          <span>技术服务分布情况</span>
          <ul class="blist" :class="!noshow ? 'slist' : ''">
            <li
                v-for="(item, index) in tabData"
                :class="{ active: sortactiver == index }"
                :key="index"
                @click="serbtnClick(index)"
            >
              {{ item }}
            </li>
          </ul>
        </div>
        <template>
          <div v-if="sortactiver == 0" id="overbar"></div>
        </template>
        <template>
          <div v-if="sortactiver == 1" id="overline"></div>
        </template>
      </div>
    </el-col>
    <el-col :span="10" id="middle">
      <div id="mapbox"></div>
      <!-- <div id="OneLine" v-show="isshow"></div> -->
      <div id="parnum" class="parnum" v-show="isshow">
        <div class="map-top" @click="closeDiv"><span>X</span></div>
        <div class="map-mid">
          <div style="color: white" class="map-mid-name">{{ name }}</div>
          <div class="map-mid-sum">
            <div>{{ number }}<span style="color: white">个</span></div>
            <div v-if="noshow">
              {{ amount }}<span style="color: white">万元</span>
            </div>
          </div>
        </div>
        <div class="map-bot">
          <div
              class="map-bot-top"
              v-for="(item, index) in numName"
              :key="index"
          >
            <div style="width: 6.2vw">
              <span>· </span>
              <span style="color: white">{{ item.typename }}</span>
            </div>
            <div style="width: 2.8vw" class="map-bot-num">
              {{ item.number }}个
            </div>
            <div v-if="noshow" style="width: 7vw" class="map-bot-num">
              {{ item.amount }}万元
            </div>
          </div>
        </div>
      </div>

      <!-- 属性查询弹窗 -->
      <div class="mappop" v-show="mapShow">
        <div class="mapheader">
          <el-button @click="mapClose"
          ><i class="el-icon el-icon-close"></i>
          </el-button>
        </div>
        <div class="mapbody">
          <ul class="ul">
            <li v-for="(item, index) in showFields" :key="index">
              <label>{{ item.fieldDesc }}：</label>
              <span>{{ item.fieldValue }}</span>
            </li>
          </ul>
          <el-pagination
              class="cuspage"
              small
              background
              :current-page="mpageNo"
              :page-size="1"
              layout="prev, pager, next"
              :total="mtotal"
              @current-change="changeAttr"
          />
        </div>
      </div>
    </el-col>
    <el-col :span="7">
      <div class="itembox h50">
        <div class="titbox">
          <span>历年项目类型变化情况</span>
          <ul class="blist" :class="!noshow ? 'slist' : ''">
            <li
                v-for="(item, index) in tabData"
                :class="{ active: sortactivesec == index }"
                :key="index"
                @click="twobtnClick(index)"
            >
              {{ item }}
            </li>
          </ul>
        </div>
        <div
            id="catebar"
            @mouseenter="mouseenter"
            @mouseleave="mouseleave"
        ></div>
      </div>
      <div class="itembox h50">
        <div class="titbox">
          <span>近10年项目情况查询</span>
          <ul class="blist" :class="!noshow ? 'slist' : ''">
            <li
                v-for="(item, index) in tabData"
                :class="{ active: sortactivend == index }"
                :key="index"
                @click="thdbtnClick(index)"
            >
              {{ item }}
            </li>
          </ul>
        </div>
        <el-form :model="seaform" ref="seaform" :inline="true" status-icon>
          <el-form-item>
            <el-select
                v-model="seaform.city"
                placeholder="选择市"
                @change="cityChange"
                clearable
                @clear="cityclear"
            >
              <el-option
                  v-for="(item, index) in cityData"
                  :key="index"
                  :value="item.cityname"
                  :label="item.cityname"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-select
                v-model="seaform.district"
                placeholder="选择县"
                clearable
                @change="villChange"
            >
              <el-option
                  v-for="(item, index) in villData"
                  :key="index"
                  :value="item.cityname"
                  :label="item.cityname"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-date-picker
                v-model="seaform.startyear"
                type="year"
                value-format="yyyy"
                placeholder="起始年份"
                @change="syChange"
            ></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-date-picker
                v-model="seaform.endyear"
                type="year"
                value-format="yyyy"
                placeholder="结束年份"
                @change="eyChange"
            ></el-date-picker>
          </el-form-item>
        </el-form>
        <div id="tenline"></div>
      </div>
    </el-col>
  </el-row>
</template>
<script>
import {mapState} from "vuex";
import {
  getCity,
  getechnical,
  getprjinfo,
  getprjtype,
  getsurvey,
  getVillage,
  authfields
} from "../api/paint";
import {
  init2,
  removeLine,
  clearShowMap,
  currentMapChange,
  mapShow,
} from "@/utils/arcgis_map";
let timer = null;
export default {
  name: "pechart",
  props:[],
  data(){
    return {
      tabData: [],
      iconData: [],
      sortactivest: 0,
      sortactiver: 0,
      sortactivesec: 0,
      sortactivend: 0,
      seaform: {},
      cityData: [],
      villData: [],
      getnum: null,
      name: null, //项目数量总计展示用
      amount: null, //项目数量总计展示用
      number: null, //项目数量总计展示用
      numName: null,
      isshow: false,

      onlineData: {
        secondModule: "业绩画像",
      },
      noshow: true,
      mapShow: false,
      mpageNo: 1,
      mappageSize: 1,
      mtotal: 1,
      showFields: [],
      fieldsName: [],
    }
  },
  computed: {
    ...mapState("onemap-store", ["logData", "ishow", "attrData"]),
  },
  watch: {
    logData: {
      handler(val) {
        this.isshow = val.boolean;
        this.name = val.name;
        this.amount = Math.trunc(val?.getnum[0].amount);
        this.number = val?.getnum[0].number;
        for (let i = 0; i < val.getnum.length; i++) {
          val.getnum[i].amount = Math.trunc(val.getnum[i].amount);
        }
        this.numName = val.getnum;
      },
      deep: true,
    },
    attrData: {
      handler(val) {
        console.log(val);
        this.mapShow = val.show;
        this.showFields = val.fileds;
        this.mtotal = val.mtotal;
        console.log(this.mtotal);
        // this.name = val.name;
        // this.amount = Math.trunc(val?.getnum[0].amount);
        // this.number = val?.getnum[0].number;
        // for (let i = 0; i < val.getnum.length; i++) {
        //   val.getnum[i].amount = Math.trunc(val.getnum[i].amount);
        // }
        // this.numName = val.getnum;
      },
      deep: true,
    },
  },
  created(){

  },
  mounted() {
    let x = document.getElementById("middle").offsetWidth / 2; //弹窗展示与地图连线坐标X
    let y = document.getElementById("middle").offsetHeight / 2 + 5; //弹窗展示与地图连线坐标Y
    init2(x, y);
    this.getTabtag();
    this.getIcon();
    this.getTotal(this.sortactiver);
    this.getCatebar(this.sortactivesec);
    this.getTenline();
    this.getcity();
    this.getfileds();
  },
  methods:{
    // 获得要展示的属性
    async getfileds() {
      let { data: res } = await authfields();
      this.fieldsName = res;
    },

    mapClose() {
      this.mapShow = false;
      this.mpageNo = 1;
      clearShowMap();
    },
    closeDiv() {
      this.isshow = false;
      clearShowMap();
      // removeLine();
    },
    changeAttr(val) {
      this.mpageNo = val;
      currentMapChange(val);
    },
    getTabtag(){
      this.tabData = ["数量", "金额"];
    },
    async getcity() {
      let { data } = await getCity();
      this.cityData = data.length > 0 ? data : [];
    },
    cityChange(val) {
      this.seaform.city = val;
      this.getvill(val);
      this.getTenline();
    },
    villChange(val) {
      this.seaform.district = val;
      this.getTenline();
    },
    syChange(val) {
      this.seaform.startyear = val;
      this.getTenline();
    },
    eyChange(val) {
      this.seaform.endyear = val;
      this.getTenline();
    },
    async getvill(val) {
      let { data } = val ? await getVillage({ city: val }) : [];
      this.villData = data.length > 0 ? data : [];
    },
    async getIcon() {
      let { data } = await getsurvey({ statisticsType: this.sortactivest });
      this.iconData = data.length > 0 ? data.filter((item) => item.typename != "其他").map((val) => {
        return {
          name: val.typename,
          nums: this.sortactivest == 0 ? val.number : Math.floor(val.amount),
        };
      }): []
    },
    btnClick(i) {
      this.sortactivest = i;
      this.getIcon();
    },
    twobtnClick(i) {
      this.sortactivesec = i;
      this.clearInterval(timer);
      this.getCatebar(i);
    },
    thdbtnClick(i) {
      this.sortactivend = i;
      this.getTenline();
    },
    serbtnClick(i) {
      this.sortactiver = i;
      this.getTotal(i);
    },
    async getTenline() {
      let params = { statisticsType: this.sortactivend };
      let obj = this.seaform;
      let arr = Object.keys(obj);
      for (let i in obj) {
        if (arr.includes(i)) {
          Object.assign(params, obj);
        }
      }
      let { data } = await getprjinfo(params);
      let crr = [
        "#4A73D9",
        "#3A9EF0",
        "#3FBDD9",
        "#37E6A5",
        "#3AF0E0",
        "#376AE6",
        "#3CCEAB",
        "#3090A6",
      ];
      let srr =
          data.length > 0
              ? data.map((item, index) => {
                return {
                  value:
                      this.sortactivend == 0
                          ? item.number
                          : Math.floor(item.amount),
                  name: item.typename,
                  unit: this.sortactivend == 0 ? "个" : "万元",
                  child:
                      item.secondTypeList.length > 0
                          ? item.secondTypeList.map((val) => {
                            return {
                              value:
                                  this.sortactivend == 0
                                      ? val.number
                                      : Math.floor(val.amount),
                              name: val.typename,
                              unit: this.sortactivend == 0 ? "个" : "万元",
                            };
                          })
                          : [],
                  itemStyle: {
                    color: crr[index],
                  },
                };
              })
              : [];
      let myChart = this.$echarts.init(document.getElementById("tenline"));
      let option = {
        tooltip: {
          trigger: "item",
          formatter: function (params) {
            let str = "";
            str += '<dl class="pielist">';
            str += `<dt><label>${params.data.name}</label><u>${params.data.value}${params.data.unit}</u></dt>`;
            params.data.child.map((item) => {
              str += `<dd><label>${item.name}</label><u>${item.value}${item.unit}</u></dd>`;
            });
            str += "</dl>";
            return str;
          },
          className: "pieraduisbox",
          backgroundColor: "rgba(7, 13, 43, .8)",
          borderColor: "#387482",
          textStyle: {
            color: "#fff",
          },
        },
        legend: {
          icon: "circle",
          top: "bottom",
          textStyle: {
            color: "#fff",
            fontSize: "14px",
          },
        },
        visualMap: {
          show: false,
          min: 80,
          max: 80,
          inRange: {
            colorLightness: [0, 1],
          },
        },
        series: [
          {
            type: "pie",
            radius: "65%",
            center: ["25%", "40%"],
            label: {
              normal: {
                show: true,
                position: "inside",
                formatter: `{d}%`,
                color: "#fff",
                fontSize: 12,
              },
            },
            data: [...srr],
            // roseType: "radius",
            labelLine: {
              normal: {
                show: false,
              },
              lineStyle: {
                color: "rgba(255, 255, 255, 0.3)",
              },
              smooth: 0.2,
              length: 10,
              length2: 20,
            },
            itemStyle: {
              shadowBlur: 200,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
            animationType: "scale",
            animationEasing: "elasticOut",
          },
        ],
      };
      myChart.setOption(option);
      window.addEventListener("resize", function () {
        myChart.resize();
      });
    },
    async getTotal(keys) {
      let srr = [];
      let { data } = await getechnical();
      let nrr = data.length > 0 ? data.typeList.map((item) => item.typeName) :[]
      srr = data?.typeList.length > 0 ? data.typeList.map((item) => {
        return {
          typeName: item.typeName,
          value: item.value.map((val) => Number(val)),
        };
      }):[]
      let brr = data?.typeList.length > 0 ? data.typeList.map((item) => {
        return {
          typeName: item.typeName,
          value: item.amountValue.map((val) => Math.floor(Number(val))),
        };
      }):[]
      keys == 0
          ? this.getoverbar(data.cityName, nrr, srr)
          : this.getlinebox(data.cityName, nrr, brr);
    },
    getoverbar(crr, nrr, srr) {
      let myChart = this.$echarts.init(document.getElementById("overbar"));
      let tooltip = {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
        formatter: function (params) {
          let str = "";
          let arr = params.map((item) => {
            return item.value;
          });
          let sum = arr.reduce((old, now) => {
            return old + now;
          }, 0);
          str += '<dl class="barbox">';
          str += "<dt>" + params[0].name + "</dt>";
          params.map((item) => {
            str += "<dd>";
            str +=
                '<div class="hfont"><i style="background:' +
                item.color +
                '"></i><span>' +
                item.seriesName +
                "</span></div>";
            str += "<span>" + item.value + "个</span>";
            str += "</dd>";
          });
          str += "<dd><label>总计：</label><span>" + sum + "个</span></dd>";
          str += "</dl>";
          return str;
        },
      };
      // legend
      let legend = {
        data: nrr,
        textStyle: { fontSize: 14, color: "#fff" },
        icon: "circle",
        top: "bottom",
      };
      // grid
      let grid = {
        left: "3%",
        // right: '4%',
        bottom: "12%",
        containLabel: true,
      };
      let color = [
        "#4A73DA",
        "#0B91FF",
        "#00C9FF",
        "#6BE7A7",
        "#376AE6",
        "#6BFF95",
        "#6B75FF",
        "#2A3AD8",
      ];
      // xAxis
      let xAxis = {
        axisLabel: {
          interval: 0,
          rotate: 38,
          textStyle: {
            color: "#FFF",
          },
        },
        type: "category",
        data: crr,
      };
      // yAxis
      let yAxis = [
        {
          name: "项目数量/个",
          type: "value",
          axisTick: { show: true },
          splitLine: { lineStyle: { color: "rgba(255,255,255, .05)" } },
          axisLine: { show: false },
          axisLabel: { textStyle: { fontSize: 14, color: "#fff" } },
          nameTextStyle: {
            color: "#FFF",
          },
        },
      ];
      let series = srr.map((item, index) => {
        return {
          name: item.typeName,
          type: "bar",
          stack: "total",
          barWidth: 15,
          data: item.value,
          itemStyle: {
            color: color[index],
          },
        };
      });
      let option = { tooltip, xAxis, yAxis, series, grid, legend };
      myChart.setOption(option);
      window.addEventListener("resize", function () {
        myChart.resize();
      });
    },
    getoverbar2(crr, nrr, srr) {
      let myChart = this.$echarts.init(document.getElementById("overbar"));
      let tooltip = {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
        formatter: function (params) {
          let str = "";
          let arr = params.filter((item) => item.seriesType == "bar");
          str += '<dl class="barbox">';
          str += "<dt>" + params[0].name + "</dt>";
          arr.map((item) => {
            str += `<dd>${item.seriesName}:<u>${item.value}</u></dd>`;
          });
          str += "</dl>";
          return str;
        },
      };
      // legend
      let legend = {
        data: nrr,
        textStyle: { fontSize: 14, color: "#fff" },
        icon: "circle",
        top: "bottom",
      };
      // grid
      let grid = {
        left: "3%",
        // right: '4%',
        bottom: "12%",
        containLabel: true,
      };
      // xAxis
      let xAxis = {
        axisLabel: {
          interval: 0,
          rotate: 38,
          textStyle: {
            color: "#FFF",
          },
        },
        type: "category",
        data: crr,
      };

      // yAxis
      let yAxis = [
        {
          name: "项目数量/个",
          type: "value",
          axisTick: { show: true },
          splitLine: { lineStyle: { color: "rgba(255,255,255, .05)" } },
          axisLine: { show: false },
          axisLabel: { textStyle: { fontSize: 14, color: "#fff" } },
          nameTextStyle: {
            color: "#FFF",
          },
        },
      ];
      // 循环生成每个头部菱形
      let diamondData = srr.reduce((pre, cur, index) => {
        pre[index] = cur.value.map(
            (el, id) => el + (pre[index - 1] ? pre[index - 1][id] : 0)
        );
        return pre;
      }, []);

      // 定义好颜色 color
      let color = [
        [
          { offset: 0, color: "#4A73D9" },
          { offset: 0.5, color: "#4A73D9" },
          { offset: 0.5, color: "#4A73D9" },
          { offset: 1, color: "#4A73D9" },
        ],
        [
          { offset: 0, color: "#3A9EF0" },
          { offset: 0.35, color: "#3A9EF0" },
          { offset: 0.5, color: "#3A9EF0" },
          { offset: 1, color: "#3A9EF0" },
        ],
        [
          { offset: 0, color: "#3FBDD9" },
          { offset: 0.35, color: "#3FBDD9" },
          { offset: 0.5, color: "#3FBDD9" },
          { offset: 1, color: "#3FBDD9" },
        ],
        [
          { offset: 0, color: "#37E6A5" },
          { offset: 0.35, color: "#37E6A5" },
          { offset: 0.5, color: "#37E6A5" },
          { offset: 1, color: "#37E6A5" },
        ],
        [
          { offset: 0, color: "#376AE6" },
          { offset: 0.35, color: "#376AE6" },
          { offset: 0.5, color: "#376AE6" },
          { offset: 1, color: "#376AE6" },
        ],
        [
          { offset: 0, color: "#3CCEAB" },
          { offset: 0.35, color: "#3CCEAB" },
          { offset: 0.5, color: "#3CCEAB" },
          { offset: 1, color: "#3CCEAB" },
        ],
        [
          { offset: 0, color: "#3090A6" },
          { offset: 0.35, color: "#3090A6" },
          { offset: 0.5, color: "#3090A6" },
          { offset: 1, color: "#3090A6" },
        ],
      ];

      // 循环生成series配置
      let series = srr.reduce((p, c, i, array) => {
        p.push(
            {
              z: i + 1,
              stack: "总量",
              type: "bar",
              name: c.typeName,
              barWidth: 30,
              data: c.value,
              itemStyle: {
                color: {
                  type: "linear",
                  x: 0,
                  x2: 1,
                  y: 0,
                  y2: 0,
                  colorStops: color[i],
                },
              },
            },
            {
              z: i + 10,
              type: "pictorialBar",
              symbolPosition: "end",
              symbol: "diamond",
              symbolOffset: [0, "-50%"],
              symbolSize: [30, 10],
              data: diamondData[i],
              itemStyle: {
                color: {
                  type: "linear",
                  x: 0,
                  x2: 1,
                  y: 0,
                  y2: 0,
                  colorStops: color[i],
                },
              },
              tooltip: { show: false },
            }
        );
        return p;
      }, []);
      let option = { tooltip, xAxis, yAxis, series, grid, legend };
      myChart.setOption(option);
      window.addEventListener("resize", function () {
        myChart.resize();
      });
    },
    getlinebox(crr, nrr, brr) {
      let myChart = this.$echarts.init(document.getElementById("overline"));

      let tooltip = {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
        formatter: function (params) {
          let str = "";
          let arr = params.map((item) => {
            return item.value;
          });
          let sum = arr.reduce((old, now) => {
            return old + now;
          }, 0);
          str += '<dl class="barbox">';
          str += "<dt>" + params[0].name + "</dt>";
          params.map((item) => {
            str += "<dd>";
            str +=
                '<div class="hfont"><i style="background:' +
                item.color +
                '"></i><span>' +
                item.seriesName +
                "</span></div>";
            str += "<span>" + item.value + "万元</span>";
            str += "</dd>";
          });
          str += "<dd><label>总计：</label><span>" + sum + "万元</span></dd>";
          str += "</dl>";
          return str;
        },
      };
      let legend = {
        top: "bottom",
        textStyle: {
          color: "#fff",
          fontSize: "14px",
        },
        icon: "circle",
        data: nrr,
      };
      let color = [
        "#4A73DA",
        "#0B91FF",
        "#00C9FF",
        "#6BE7A7",
        "#376AE6",
        "#6BFF95",
        "#6B75FF",
        "#2A3AD8",
      ];
      let grid = {
        left: "3%",
        // right: '4%',
        bottom: "12%",
        containLabel: true,
      };
      let xAxis = {
        axisLabel: {
          interval: 0,
          rotate: 38,
          textStyle: {
            color: "#FFF",
          },
        },
        type: "category",
        data: crr,
      };
      let yAxis = {
        name: "总金额/万元",
        type: "value",
        axisTick: {
          show: false,
        },
        axisLabel: {
          show: true,
          textStyle: {
            color: "#fff",
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: "#262a35",
            width: 0,
            type: "solid",
          },
        },
        nameTextStyle: {
          color: "#FFF",
        },
      };

      let series = brr.map((item, index) => {
        return {
          name: item.typeName,
          type: "bar",
          stack: "total",
          barWidth: 15,
          data: item.value,
          itemStyle: {
            color: color[index],
          },
        };
      });

      let option = { tooltip, xAxis, yAxis, series, grid, legend };
      myChart.setOption(option);
      window.addEventListener("resize", function () {
        myChart.resize();
      });
    },
    async getCatebar(key) {
      let lnum = [];
      let { data } = await getprjtype({ statisticsType: this.sortactivesec });
      let crr = [
        "#4A73D9",
        "#3A9EF0",
        "#3FBDD9",
        "#37E6A5",
        "#3AF0E0",
        "#376AE6",
        "#3CCEAB",
        "#3090A6",
      ];
      lnum = data.yearName;
      let srr1 = data.typeList.length > 0 ? data.typeList.map((item, index) => {
        return {
          name: item.typeName,
          type: "bar",
          stack: "total",
          barWidth: 10,
          data: item.accountValue.map(val => Number(val)),
          itemStyle: {
            color: crr[index],
          },
        };
      }) : []
      let srr2 = data.typeList.length > 0 ? data.typeList.map((item, index) => {
        return {
          name: item.typeName,
          type: "bar",
          stack: "total",
          barWidth: 10,
          data: item.amountValue.map(val => Math.floor(Number(val))),
          itemStyle: {
            color: crr[index],
          },
        };
      }):[]
      await this.getbarcate(lnum, srr1, srr2, key);
    },
    getbarcate(lnum, srr1, srr2, key) {
      var myChart = this.$echarts.init(document.getElementById("catebar"));
      let tooltip = {
        confine: true,
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
        formatter: function (params) {
          let str = "";
          let arr = params.map((item) => {
            return item.value;
          });
          let sum = arr.reduce((old, now) => {
            return old + now;
          }, 0);
          str += '<dl class="hislist">';
          str += "<dt>" + params[0].axisValueLabel + "年</dt>";
          params.map((item) => {
            str += "<dd>";
            str +=
                '<div class="hfont"><i style="background:' +
                item.color +
                '"></i><span>' +
                item.seriesName +
                "</span></div>";
            if (key == 0) {
              str += "<span>" + item.value + "个</span>";
            } else {
              str += "<span>" + item.value + "万元</span>";
            }
            str += "</dd>";
          });
          if (key == 0) {
            str += "<dd><label>总计：</label><span>" + sum + "个</span></dd>";
          } else {
            str += "<dd><label>总计：</label><span>" + sum + "万元</span></dd>";
          }
          str += "</dl>";
          return str;
        },
      };
      let dataZoom = [
        {
          // 第一个 dataZoom 组件
          type: "inside",
          yAxisIndex: 0, // 表示这个 dataZoom 组件控制 第一个 xAxis
          startValue: 0, // 数据窗口范围的起始数值index
          endValue: 5, // 数据窗口范围的结束数值index
        },
      ];
      let legend = {
        icon: "circle",
        top: "bottom",
        textStyle: {
          color: "#fff",
          fontSize: "14px",
        },
      };
      let grid = {
        top: "6%",
        left: "3%",
        right: "4%",
        bottom: "15%",
        containLabel: true,
      };
      let xAxis = {
        type: "value",
        axisLabel: {
          textStyle: {
            color: "#FFF",
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: "#262a35",
          },
        },
      };
      let yAxis = {
        axisLabel: {
          textStyle: {
            color: "#FFF",
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: "#262a35",
          },
        },
        type: "category",
        data: lnum,
      };
      let series = this.sortactivesec == 0 ? srr1 : srr2;
      let option = { tooltip, grid, dataZoom, xAxis, yAxis, series, legend };
      myChart.setOption(option);
      window.addEventListener("resize", function () {
        myChart.resize();
      });
      timer = setInterval(() => {
        if (option.dataZoom[0].endValue == lnum.length - 1) {
          option.dataZoom[0].endValue = 5;
          option.dataZoom[0].startValue = 0;
        } else {
          option.dataZoom[0].endValue = option.dataZoom[0].endValue + 1;
          option.dataZoom[0].startValue = option.dataZoom[0].startValue + 1;
        }
        myChart.setOption(option);
      }, 6000);
    },
    cityclear() {
      this.seaform.city = null;
      this.getvill();
    },
    mouseenter() {
      this.clearInterval(timer);
    },
    mouseleave() {
      this.getCatebar(this.sortactivesec);
    },
    clearInterval(timeId) {
      timeId && window.clearInterval(timeId);
    },
  }
}
</script>
<style scoped lang="scss">

</style>