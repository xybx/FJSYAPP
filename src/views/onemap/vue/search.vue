//查询定位
<template>
  <div class="">
    <el-dialog title="查询定位" :visible="dialogVisible" :modal="false" :close-on-click-modal="false" custom-class="chaxun"
      :before-close="closeDialog">
      <el-form :inline="true" :model="coordForm" class="demo-form-inline" size="small">
        <div class="coord-box">
          <div class="coord-box-1">
            <el-form-item label="坐标定位" class="label-item"></el-form-item>
            <el-select v-model="wkidValue" placeholder="请选择坐标系" clearable>
              <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </div>
          <div class="coord-box-1">
            <div class="coord-input">
              <el-form-item label="X">
                <el-input placeholder="经度或Y投影坐标" v-model.trim="coordForm.coordX" clearable>
                </el-input>
              </el-form-item>
              <el-form-item label="Y">
                <el-input placeholder="纬度或X投影坐标" v-model.trim="coordForm.coordY" clearable>
                </el-input>
              </el-form-item>
            </div>
            <el-form-item class="coord-btn">
              <el-button type="primary" icon="el-icon-search" @click="pointLocation"></el-button>
            </el-form-item>
          </div>
        </div>
        <div class="query-box">
          <el-form-item label="查询定位" class="query-input">
            <el-input placeholder="请输入地名、道路名、图幅号等" v-model.trim="queryValue" clearable>
            </el-input>
          </el-form-item>
          <el-form-item class="query-btn">
            <el-button type="primary" icon="el-icon-search" @click="query"></el-button>
          </el-form-item>
        </div>
        <div class="select-box" v-loading="selLoading" element-loading-text="结果查询中"
          element-loading-spinner="el-icon-loading">
          <div class="res-childer" v-if="stutsData">
            未查询到符合条件数据
          </div>
          <el-select v-model="selectType" v-if="stutsData == false" placeholder="请选择查询类型" size="small"
            @change="selectOps">
            <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
          <div class="result-box">
            <el-button plain v-for="item in liData" :key="item.id" size="small" @click="clickBtn(item)">
              {{ item.value }}
            </el-button>
          </div>
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import { getQuery, getMapGeometryService } from "../api/onemap";
import Graphic from "@arcgis/core/Graphic";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import Point from "@arcgis/core/geometry/Point";
import ProjectParameters from "@arcgis/core/rest/support/ProjectParameters";
import Extent from "@arcgis/core/geometry/Extent";
import * as geometryService from "@arcgis/core/rest/geometryService";
// import { project } from "esri/rest/geometryService/project";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import * as find from "@arcgis/core/rest/find";
import FindParameters from "@arcgis/core/rest/support/FindParameters";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import TextSymbol from "@arcgis/core/symbols/TextSymbol";
import { mapMutations, mapState } from "vuex";
import { initDefineMap } from "@/utils/topic-map";
export default {
  name: "",
  props: ["btnClass"],
  components: {},
  data() {
    return {
      typeOptions: [],
      selectType: "",
      liData: [],
      stutsData: false,
      coordForm: {
        coordX: "",
        coordY: "",
      },
      queryValue: "",
      mapextent: {
        XMin: 368000,
        YMin: 2700000,
        XMax: 530000,
        YMax: 2900000,
      },
      querylist: [],
      selLoading: false,
      dialogVisible: false,
      comTitle: "",
      options: [
        {
          value: 4490,
          label: '国家大地2000坐标系',
        },
        {
          value: 4527,
          label: '高斯克吕格39°带',
        },
        {
          value: 4528,
          label: '高斯克吕格40°带',
        },
        {
          value: 4548,
          label: '中央子午线117°E',
        },
        {
          value: 4549,
          label: '中央子午线120°E',
        },
      ], //坐标系选择
      wkidValue: null,//所选选择wkid
      ServiceUrl: '',//计算服务地址
    };
  },
  computed: {
    ...mapState("onemap-store", [
      "mapview",
      "symbol",
      "linesymbol",
      "pointSymbol",
      "mapconfig",
    ]),
    ...mapState("onemap-store", ["userGraphicLayer"]),
  },
  watch: {
    // dialogVisible(boo) {
    //     if (boo) {
    //         this.queryMethod();
    //     }
    // },
    btnClass: {
      handler(val) {
        if (val == 0) {
          this.dialogVisible = true;
        } else {
          this.dialogVisible = false;
        }
      },
      immediate: true,
    },
  },
  created() {
    this.getServiceUrl();
  },
  mounted() {
    this.queryMethod();
  },
  methods: {
    ...mapMutations("onemap-store", [
      "handleOnemapPopup",
      "handleToggleIndex",
      "handleUserGraphicLayer",
      "setBtn",
    ]),
    //获取计算服务地址
    async getServiceUrl() {
      let res = await getMapGeometryService();
      if (res.code === 200) {
        this.ServiceUrl = res.data.MAPGEOMETRYSERVICEURL;
      }
    },

    // 打开弹窗
    showDialog(obj) {
      this.comTitle = obj.title;
      this.dialogVisible = true;
      this.handleToggleIndex(false);
    },

    // 关闭弹窗
    closeDialog() {
      // this.handleOnemapPopup({ code: 'init' });
      // this.handleToggleIndex(true);
      // this.dialogVisible = false;
      // // 清除图形
      this.mapview.graphics.removeAll();
      // // 数据恢复初始
      // Object.assign(this.$data, this.$options.data());
      this.dialogVisible = false;
      this.$emit("setBtnClass", -1);
      this.setBtn(false);
    },

    async queryMethod() {
      this.querylist = [];
      var mtype = 1;
      if (this.$route.path == "/szxcmapindex") {
        mtype = 2;
      }
      // let params = {
      //     // uid: window.sessionStorage.getItem('userid'),
      //     uid:603,
      //     moduletype: mtype,
      // };
      const data = await getQuery();
      if (data.code === 200) {
        this.querylist = data.data;
      } else {
        this.$message.error(data.msg);
      }
    },

    // 获取查询数据源
    query() {
      if (this.queryValue == "") return this.$message.error("查询内容不能为空");
      this.typeOptions = [];
      this.selLoading = true;
      this.stutsData = false
      if (this.querylist == null) {
        this.$message.warning("没有配置可查询图层！");
        this.selLoading = false;
        return;
      }
      let _findIndex = 0;
      let geometryIndex = 0;
      this.find(_findIndex, geometryIndex);
    },

    async find(_findIndex, geometryIndex) {
      if (_findIndex == 0) {
        let userLayer = new GraphicsLayer();
        this.handleUserGraphicLayer(userLayer);
      }
      var layerids = Array.from(new Set(this.querylist[_findIndex].childlist));
      // var layerids = [0,1,2];
      let findparams = new FindParameters({
        layerIds: layerids,
        searchFields: this.querylist[_findIndex].childfield,
        searchText: this.queryValue,
        outSpatialReference: {
          wkid: this.mapview.spatialReference.wkid,
        },
        returnGeometry: false,
      });
      //   let result = await find.find(this.querylist[_findIndex].url, findparams);
      // console.log(result);


      try {
        let result = await find.find(this.querylist[_findIndex].url, findparams);
        console.log(result);
        if (result.results.length > 0) {
          this.stutsData = false
          if (result.results.length > 0) {
            // 图层名称
            let obj = new Object();
            obj.value = result.results[0].layerName;
            obj.label = result.results[0].layerName;
            obj.children = [];
            findparams.returnGeometry = true;
            // 数据
            result.results.map((i) => {
              let b = {
                value: i.value,
                label: i.feature.attributes[this.querylist[_findIndex].showfield],
                index: geometryIndex,
                url: this.querylist[_findIndex].url,
                findparams: findparams
                // geometrytype: i.feature.geometry.type,
              };
              obj.children.push(b);


              // this.userGraphicLayer.graphics.add(g);
              geometryIndex++;
            });
            geometryIndex = 0;
            this.typeOptions.push(obj);
            this.selectType = this.typeOptions[0].label;
            this.liData = this.typeOptions[0].children;
            this.selLoading = false;

            _findIndex++;
            if (_findIndex < this.querylist.length) {
              this.find(_findIndex, geometryIndex);
            }
          } else {
            this.selLoading = false;
          }
        } else {
          if (result.results.length == 0 && this.typeOptions.length == 0) {
            this.typeOptions = [];
            this.stutsData = true
            this.selLoading = false;
          }
          _findIndex++;
          if (_findIndex < this.querylist.length) {
            this.find(_findIndex, geometryIndex);
          }
        }
        // console.log(result);
      } catch (error) {
        console.log(error);
        this.selLoading = false;
        if (error.details.httpStatus == 400 || error.details.httpStatus == 500) {
          this.stutsData = true
          console.log("服务不存在");
        }

      } finally {
        _findIndex++;
        if (_findIndex < this.querylist.length) {
          this.find(_findIndex, geometryIndex);
        }
      }

    },

    // 坐标定位
    async pointLocation() {

      let x = this.coordForm.coordX;
      let y = this.coordForm.coordY;
      if (x == "" || y == "") return this.$message.error("坐标不能为空");
      let symbol = this.pointSymbol;
      //   if (
      //     x > Number(maptexnt.XMIN) &&
      //     x < Number(maptexnt.XMAX) &&
      //     y > Number(maptexnt.YMIN) &&
      //     y < Number(maptexnt.YMAX)
      //   ) {
      let sRef = new SpatialReference({
        wkid: this.wkidValue,
      });
      var point = new Point();

      var results = null;
      if (this.wkidValue != 4490) {
        let params = new ProjectParameters({
          geometries: [
            new Point({
              x,
              y,
              spatialReference: sRef,
            }),
          ],
          outSpatialReference: this.mapview.spatialReference,
        });
        results = await geometryService.project(this.ServiceUrl, params);
        point.latitude = results[0].latitude;
        point.longitude = results[0].longitude;
        point.spatialReference = this.mapview.spatialReference;
      } else {
        point.latitude = y;
        point.longitude = x;
        point.spatialReference = sRef;
      }
      this.mapview.center = point;
      let ptGraphic = new Graphic({
        geometry: point,
        symbol: this.pointSymbol,
      });
      this.mapview.graphics.removeAll();
      this.mapview.graphics.add(ptGraphic);
      //   } else {
      //     this.$message.error("坐标点超出所在行政区范围，请确认点坐标");
      //   }
    },

    // 下拉选择
    selectOps(val) {
      let filArr = this.typeOptions.filter((arr) => {
        return arr.value == val;
      });
      this.liData = filArr[0].children;
    },

    // 列表点击事件
    async clickBtn(item) {
      this.mapview.graphics.removeAll();
      let result = await find.find(item.url, item.findparams);
      let graphic = result.results[item.index].feature;
      // 临时保存图形
      let symbol;
      switch (graphic.geometry.type) {
        case "polygon":
          symbol = this.symbol;
          break;
        case "polyline":
          symbol = this.linesymbol;
          break;
        case "point":
          symbol = this.pointSymbol;
          break;
        default:
          break;
      }
      // 创建标记位置
      let g = new Graphic({
        geometry: graphic.geometry,
        symbol: {
          type: "simple-fill",
          color: [255, 255, 0, 0.2],
          style: "solid",
          outline: {
            color: "red",
            width: 2,
          },
        }
      });
      this.mapview.graphics.add(g);

      // 创建标记文字
      let text = new TextSymbol({
        text: item.label,
        font: { size: "16px" },
        color: [255, 0, 0],
        yoffset:
          graphic.geometry.type == "polygon" ||
            graphic.geometry.type == "polyline"
            ? 0
            : -25,
      });
      let geo =
        graphic.geometry.type == "polygon" ||
          graphic.geometry.type == "polyline"
          ? graphic.geometry.extent.center
          : graphic.geometry;

      let g_text = new Graphic({ geometry: geo, symbol: text });
      this.mapview.graphics.add(g_text);
      var results;
      if (
        graphic.geometry.type == "polygon" ||
        graphic.geometry.type == "polyline"
      ) {
        if (graphic.geometry.spatialReference.wkid != 4490) {
          let params = new ProjectParameters({
            geometries: [graphic.geometry.center],
            outSpatialReference: this.mapview.spatialReference,
          });
          results = await geometryService.project(this.ServiceUrl, params);
          let point = new Point();
          point.latitude = results[0].latitude;
          point.longitude = results[0].longitude;
          point.spatialReference = this.mapview.spatialReference;
          this.mapview.center = point;
        } else {
          this.mapview.extent = graphic.geometry.extent;
        }

        this.mapview.zoom = this.mapview.zoom - 2;
      }

      if (graphic.geometry.type == "point") {
        let extent = new Extent({
          xmin: graphic.geometry.x - 200,
          ymin: graphic.geometry.y - 200,
          xmax: graphic.geometry.x + 200,
          ymax: graphic.geometry.y + 200,
          spatialReference: {
            wkid: this.mapview.spatialReference.wkid,
          },
        });
        if (this.mapview.spatialReference.wkid == 4490) {
          extent = new Extent({
            xmin: graphic.geometry.x - 0.1,
            ymin: graphic.geometry.y - 0.1,
            xmax: graphic.geometry.x + 0.1,
            ymax: graphic.geometry.y + 0.1,
            spatialReference: {
              wkid: this.mapview.spatialReference.wkid,
            },
          });
        }


        this.mapview.extent = extent;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
@import "../style/search.scss";
</style>
