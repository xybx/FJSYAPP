<template>
  <div class="map-container">
    <div id="map" class="map" @mouseover="mouseover"></div>
    <el-dialog
      custom-class="selectSplit"
      title="选择分屏类型"
      :visible.sync="dialogVisible"
      :modal="false"
      :close-on-click-modal="false"
      destroy-on-close
      :before-close="closeDialog"
    >
      <el-form :inline="true" class="demo-form-inline">
        <el-form-item label="分屏类型选择">
          <el-select
            v-model="splitKind"
            placeholder="选择分屏类型"
            @change="splitChange"
            clearable
          >
            <el-option label="二分屏" key="2" value="2"></el-option>
            <el-option label="四分屏" key="4" value="4"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submit">确 定</el-button>
        <el-button @click="consoleSub">取 消</el-button>
      </span>
    </el-dialog>
    <!-- 二分屏 -->
    <div class="splitmap-box" v-if="showSplit2">
      <div class="split-left" id="leftMap">
        <!-- 请将左侧列表数据拖入左分屏 -->
        <div class="map" id="leftMap_map"></div>
      </div>
      <div class="split-right" id="rightMap">
        <!-- 请将左侧列表数据拖入右分屏 -->
        <div class="map" id="rightMap_map"></div>
      </div>
      <!-- 关闭底图 -->
      <el-button
        type="primary"
        icon="el-icon-view"
        circle
        class="close-map"
        @click="closemap2"
      ></el-button>
      <!-- 关闭分屏 -->
      <el-button
        type="primary"
        icon="el-icon-switch-button"
        circle
        class="close-split"
        @click="closeSplit"
      ></el-button>
    </div>
    <!-- 四分屏 -->
    <div class="splitmap-box4" v-if="showSplit4">
      <div class="split-left-top" id="leftTopMap">
        <!-- 请将左侧列表数据拖入左上分屏 -->
        <div class="map" id="leftTopMap_map"></div>
      </div>
      <div class="split-left-bottom" id="leftBottomMap">
        <!-- 请将左侧列表数据拖入左下分屏 -->
        <div class="map" id="leftBottomMap_map"></div>
      </div>
      <div class="split-right-top" id="rightTopMap">
        <!-- 请将左侧列表数据拖入右上分屏 -->
        <div class="map" id="rightTopMap_map"></div>
      </div>
      <div class="split-right-bottom" id="rightBottomMap">
        <!-- 请将左侧列表数据拖入右下分屏 -->
        <div class="map" id="rightBottomMap_map"></div>
      </div>
      <!-- 关闭底图 -->
      <el-button
        type="primary"
        icon="el-icon-view"
        circle
        class="close-map"
        @click="closemap4"
      ></el-button>
      <!-- 关闭分屏 -->
      <el-button
        type="primary"
        icon="el-icon-switch-button"
        circle
        class="close-split"
        @click="closeSplit"
      ></el-button>
    </div>
  </div>
</template>

<script>
import { init, initSplitMap } from "@/utils/arcgis_map";
import userconfig from "@/utils/userconfig";
import Map from "@arcgis/core/Map";
import Basemap from "@arcgis/core/Basemap";
import MapView from "@arcgis/core/views/MapView";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";
import TileLayer from "@arcgis/core/layers/TileLayer";
import WebTileLayer from "@arcgis/core/layers/WebTileLayer";
import { getMapConfig } from "../api/arcgis-api";
import { mapMutations, mapState, mapGetters } from "vuex";
import Point from "@arcgis/core/geometry/Point";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import TileInfo from "@arcgis/core/layers/support/TileInfo";
import store from "@/store";
export default {
  mounted() {
    this.setMapConfig();
  },
  created() {
    init("map");
  },
  props: [
    "leftMap",
    "rightMap",
    "btnClass",
    "lefttopMap",
    "leftbottomMap",
    "righttopMap",
    "rightbottomMap",
  ],
  data() {
    return {
      // legendSrc: require('@/assets/images/map-images/legendpic.png'),//图例未做
      leftMapView: null,
      rightMapView: null,
      //以上为二分屏左右组件
      leftTopMapView: null,
      leftBottomMapView: null,
      rightTopMapView: null,
      rightBottomMapView: null,
      //以上为四分屏组件
      dialogVisible: false,
      mapdata: null,
      mapcenter: null,
      isshow: false,
      mapnumber: null,
      splitKind: "", //分屏类型
      splitNumber: null, //分屏数
      showSplit2: false, //控制二分屏显示
      showSplit4: false, //控制四分屏显示
      openAllLayer: [], //获取主页面已打开图层

      splitflag: false,
      theBaseLayer: false,
    };
  },
  computed: {
    ...mapState("onemap-store", [
      "showSplit",
      "mapconfig",
      "number",
      "mapview",
    ]),
    ...mapGetters({
      splitScreen: "onemap-store/splitScreen",
    }),
  },
  watch: {
    splitScreen: {
      handler(val) {
        if (val) {
          this.ishow = true;
        }
      },
      immediate: true,
    },
    dialogVisible: {
      handler(boo) {
        this.mapdata = this.mapconfig;
        this.mapnumber = this.number;
      },
      immediate: true,
    },
    //二分屏监听
    leftMap(data) {
      this.$message.error("请拖动至其他区域。");
      //this. initLeftSplitMap(data);
    },
    rightMap(data) {
      this.initRightSplitMap(data);
    },
    //四分屏监听
    lefttopMap(data) {
      this.$message.error("请拖动至其他区域。");
    },
    righttopMap(data) {
      this.initRighttopSplitMap(data);
    },
    leftbottomMap(data) {
      this.initLeftbottomSplitMap(data);
    },
    rightbottomMap(data) {
      this.initRightbottomSplitMap(data);
    },
    btnClass: {
      handler(val) {
        if (val == 4) {
          this.dialogVisible = true;
        } else {
          this.dialogVisible = false;
        }
      },
      immediate: true,
    },
  },
  methods: {
    // ...mapState("onemap-store", ["map"]),
    ...mapMutations("onemap-store", [
      "handleSplit",
      "setBtn",
      "setSplitScreen",
      "setmapconfig",
    ]),
    async setMapConfig() {
      const data = await getMapConfig({
        modulename: "专题图",
      });
      if (data.code === 200) {
        this.setmapconfig(data.data);
      }
    },
    mouseover() {
      userconfig.view_0 = true;
      userconfig.view_1 = false;
      userconfig.view_2 = false;
      userconfig.view_3 = false;
      userconfig.view_4 = false;
      userconfig.view_5 = false;
    },
    //弹窗选择事件
    splitChange(val) {
      this.splitNumber = val;
    },
    //弹窗提交方法
    submit() {
      let app = this;
      if (app.splitKind == "") {
        this.$message.error("请选择分屏类型");
        return;
      }
      console.log(this.mapview, "this.mapview");
      this.dialogVisible = false;
      if (this.splitKind == 2) {
        this.showSplit2 = true;
        this.$nextTick(() => {
          this.initLeftSplitMap();
          this.initRightSplitMap(null);
        });
      } else if (this.splitKind == 4) {
        this.showSplit4 = true;
        this.$nextTick(() => {
          this.initLefttopSplitMap();
          this.initLeftbottomSplitMap(null);
          this.initRighttopSplitMap(null);
          this.initRightbottomSplitMap(null);
        });
      }
      this.$emit("setSplitNumber", this.splitKind);
      this.splitKind = "";
    },
    //弹窗取消
    consoleSub() {
      this.splitNumber = null;
      this.dialogVisible = false;
      this.splitKind = "";
      this.$emit("setBtnClass", -1);
      this.setBtn(false);
      this.setSplitScreen(false);
    },
    //初始化二分屏地图
    initLeftSplitMap() {
      let app = this;

      let map = app.mapview.map;

      //左侧分屏初始化
      this.leftMapView = new MapView({
        map: map,
        container: "leftMap_map",
        // constraints: {
        //   maxScale: 50000000,
        //   minScale: 50000,
        //   rotationEnabled: false,
        // },
        navigation: {
          momentumEnabled: false,
        },
        scale: app.mapview.scale,
        center: app.mapview.center,
      });
      //this.leftMapView=app.mapview.clone;
      this.leftMapView.ui.remove(["attribution", "zoom"]);
      // this.loadSplitLayer(data,this.leftMapView);
      // 获取主图打开的全部图层
      //this.getAllOpenLayers();
      // 叠加主地图打开的图层
      //this.overAllLayers(this.leftMapView);
      //   let leftview = this.leftMapView;
      //   let rightview = this.rightMapView;
      //监听地图改变事件

      app.leftMapView.watch("scale", function () {
        console.log(app.leftMapView, "app.leftMapView");
        if (app.rightMapView != undefined && app.rightMapView != null) {
          app.rightMapView.extent = app.leftMapView.extent;
        }
      });

      //平移
      app.leftMapView.on("drag", function () {
        if (app.rightMapView != undefined && app.rightMapView != null) {
          app.rightMapView.extent = app.leftMapView.extent;
        }
      });
    },
    initRightSplitMap(data) {
      let app = this;
      // let map=app.mapview.map;
      // //右侧分屏初始化
      // this.rightMapView = new MapView({
      //   map: map,
      //   container: "rightMap_map",
      //   // constraints: {
      //   //   maxScale: 50000000,
      //   //   minScale: 50000,
      //   //   rotationEnabled: false,
      //   // },
      //   navigation: {
      //     momentumEnabled: false,
      //   },
      //   // zoom: 3,
      //   scale: app.mapview.scale,
      //   center: app.mapview.center,
      // });
      this.rightMapView = initSplitMap("rightMap_map");
      //this.showmap(this.rightMapView);
      this.rightMapView.ui.remove(["attribution", "zoom"]);
      if (data != null) {
        this.loadSplitLayer(data, this.rightMapView);
      }

      //   let leftview = this.leftMapView;
      //   let rightview = this.rightMapView;
      //监听地图改变事件
      app.rightMapView.watch("scale", function () {
        if (app.leftMapView != undefined && app.leftMapView != null) {
          app.leftMapView.extent = app.rightMapView.extent;
        }
      });

      //平移
      app.rightMapView.on("drag", function () {
        if (app.leftMapView != undefined && app.leftMapView != null) {
          app.leftMapView.extent = app.rightMapView.extent;
        }
      });
    },
    //初始化四分屏地图
    initLefttopSplitMap() {
      let app = this;

      let map = app.mapview.map;

      console.log(map, "map");
      //左侧分屏初始化
      this.leftTopMapView = new MapView({
        map: map,
        container: "leftTopMap_map",
        // constraints: {
        //   maxScale: 50000000,
        //   minScale: 50000,
        //   rotationEnabled: false,
        // },
        navigation: {
          momentumEnabled: false,
        },
        scale: app.mapview.scale,
        center: app.mapview.center,
      });
      this.leftTopMapView.ui.remove(["attribution", "zoom"]);
      // 获取主图打开的全部图层
      this.getAllOpenLayers();
      // 叠加主地图打开的图层
      this.overAllLayers(this.leftTopMapView);
      //   let leftview = this.leftMapView;
      //   let rightview = this.rightMapView;
      //监听地图改变事件
      app.leftTopMapView.watch("scale", function () {
        if (
          app.rightTopMapView != undefined &&
          app.rightTopMapView != null &&
          app.rightBottomMapView != undefined &&
          app.rightBottomMapView != null &&
          app.leftBottomMapView != undefined &&
          app.leftBottomMapView != null
        ) {
          app.rightTopMapView.extent = app.leftTopMapView.extent;
          app.rightBottomMapView.extent = app.leftTopMapView.extent;
          app.leftBottomMapView.extent = app.leftTopMapView.extent;
        }
      });

      //平移
      app.leftTopMapView.on("drag", function () {
        if (
          app.rightTopMapView != undefined &&
          app.rightTopMapView != null &&
          app.rightBottomMapView != undefined &&
          app.rightBottomMapView != null &&
          app.leftBottomMapView != undefined &&
          app.leftBottomMapView != null
        ) {
          app.rightTopMapView.extent = app.leftTopMapView.extent;
          app.rightBottomMapView.extent = app.leftTopMapView.extent;
          app.leftBottomMapView.extent = app.leftTopMapView.extent;
        }
      });
    },
    initLeftbottomSplitMap(data) {
      this.leftBottomMapView = initSplitMap("leftBottomMap_map");

      let app = this;

      //this.showmap(this.leftBottomMapView);
      this.leftBottomMapView.ui.remove(["attribution", "zoom"]);
      if (data != null) {
        this.loadSplitLayer(data, this.leftBottomMapView);
      }
      //   let leftview = this.leftMapView;
      //   let rightview = this.rightMapView;
      //监听地图改变事件
      app.leftBottomMapView.watch("scale", function () {
        if (
          app.rightTopMapView != undefined &&
          app.rightTopMapView != null &&
          app.rightBottomMapView != undefined &&
          app.rightBottomMapView != null &&
          app.leftTopMapView != undefined &&
          app.leftTopMapView != null
        ) {
          app.rightTopMapView.extent = app.leftBottomMapView.extent;
          app.rightBottomMapView.extent = app.leftBottomMapView.extent;
          app.leftTopMapView.extent = app.leftBottomMapView.extent;
        }
      });

      //平移
      app.leftBottomMapView.on("drag", function () {
        if (
          app.rightTopMapView != undefined &&
          app.rightTopMapView != null &&
          app.rightBottomMapView != undefined &&
          app.rightBottomMapView != null &&
          app.leftTopMapView != undefined &&
          app.leftTopMapView != null
        ) {
          app.rightTopMapView.extent = app.leftBottomMapView.extent;
          app.rightBottomMapView.extent = app.leftBottomMapView.extent;
          app.leftTopMapView.extent = app.leftBottomMapView.extent;
        }
      });
    },
    initRighttopSplitMap(data) {
      this.rightTopMapView = initSplitMap("rightTopMap_map");

      let app = this;

      //this.showmap(this.rightTopMapView);
      this.rightTopMapView.ui.remove(["attribution", "zoom"]);
      if (data != null) {
        this.loadSplitLayer(data, this.rightTopMapView);
      }
      //   let leftview = this.leftMapView;
      //   let rightview = this.rightMapView;
      //监听地图改变事件
      app.rightTopMapView.watch("scale", function () {
        if (
          app.leftTopMapView != undefined &&
          app.leftTopMapView != null &&
          app.rightBottomMapView != undefined &&
          app.rightBottomMapView != null &&
          app.leftBottomMapView != undefined &&
          app.leftBottomMapView != null
        ) {
          app.leftTopMapView.extent = app.rightTopMapView.extent;
          app.rightBottomMapView.extent = app.rightTopMapView.extent;
          app.leftBottomMapView.extent = app.rightTopMapView.extent;
        }
      });

      //平移
      app.rightTopMapView.on("drag", function () {
        if (
          app.leftTopMapView != undefined &&
          app.leftTopMapView != null &&
          app.rightBottomMapView != undefined &&
          app.rightBottomMapView != null &&
          app.leftBottomMapView != undefined &&
          app.leftBottomMapView != null
        ) {
          app.leftTopMapView.extent = app.rightTopMapView.extent;
          app.rightBottomMapView.extent = app.rightTopMapView.extent;
          app.leftBottomMapView.extent = app.rightTopMapView.extent;
        }
      });
    },
    initRightbottomSplitMap(data) {
      this.rightBottomMapView = initSplitMap("rightBottomMap_map");

      let app = this;
      //this.showmap(this.rightBottomMapView);
      this.rightBottomMapView.ui.remove(["attribution", "zoom"]);
      if (data != null) {
        this.loadSplitLayer(data, this.rightBottomMapView);
      }
      //   let leftview = this.leftMapView;
      //   let rightview = this.rightMapView;
      //监听地图改变事件
      app.rightBottomMapView.watch("scale", function () {
        if (
          app.rightTopMapView != undefined &&
          app.rightTopMapView != null &&
          app.leftTopMapView != undefined &&
          app.leftTopMapView != null &&
          app.leftBottomMapView != undefined &&
          app.leftBottomMapView != null
        ) {
          app.rightTopMapView.extent = app.rightBottomMapView.extent;
          app.leftTopMapView.extent = app.rightBottomMapView.extent;
          app.leftBottomMapView.extent = app.rightBottomMapView.extent;
        }
      });

      //平移
      app.rightBottomMapView.on("drag", function () {
        if (
          app.rightTopMapView != undefined &&
          app.rightTopMapView != null &&
          app.leftTopMapView != undefined &&
          app.leftTopMapView != null &&
          app.leftBottomMapView != undefined &&
          app.leftBottomMapView != null
        ) {
          app.rightTopMapView.extent = app.rightBottomMapView.extent;
          app.leftTopMapView.extent = app.rightBottomMapView.extent;
          app.leftBottomMapView.extent = app.rightBottomMapView.extent;
        }
      });
    },
    //加载分屏图层
    loadSplitLayer(data, view) {
      console.log(data, "009");
      view.map.layers.removeAll();
      if (data.data.level == "server") {
        var layers = data.data.childlist;

        if (layers.length > 0) {
          var sublayers = [];
          switch (data.data.kind) {
            case 1:
              var layer = new MapImageLayer({
                id: data.data.label,
                url: data.data.url,
                //sublayers: sublayers,
                visible: true,
              });
              view.map.add(layer, 0);
              break;
            case 5:
              var layer = new TileLayer({
                id: data.data.label,
                url: data.data.url,
                visible: true,
              });
              view.map.add(layer, 0);
              break;
          }
        } else {
          switch (data.data.kind) {
            case 1:
              var layer = new MapImageLayer({
                id: data.data.label,
                url: data.data.url,
                visible: true,
              });
              view.map.add(layer, 0);
              break;
            case 5:
              var layer = new TileLayer({
                id: data.data.label,
                url: data.data.url,
                visible: true,
              });
              view.map.add(layer, 0);
              break;
          }
        }
      }
      if (data.data.level == "layer") {
        var obj = data.data;
        var layer = new MapImageLayer({
          id: obj.label,
          url: obj.url,
          visible: true,
          sublayers: [
            {
              id: obj.id,
              visible: true,
            },
          ],
        });
        view.map.add(layer, 0);
      }
    },

    //获取主页面已打开的所有图层
    getAllOpenLayers() {
      this.openAllLayer = [];
      let mainView = store.state["onemap-store"].mapview;
      let layerList = mainView.map.layers;
      if (layerList.length > 0) {
        layerList.map((item) => {
          if (
            item.id != "lengthLrc" &&
            // item.type != "tile" &&
            item.title != null &&
            item.type != "graphics" &&
            item.id.indexOf("影像图") < 0
          ) {
            if (item.visible) {
              let attrLayer = new Object();
              attrLayer.layerName = item.id;
              attrLayer.layerURL = item.url;
              attrLayer.opacity = item.opacity;
              attrLayer.subLayer = [];
              item.allSublayers.items.map((subItem) => {
                if (subItem.visible) {
                  attrLayer.subLayer.push(subItem.id);
                }
              });
              if (attrLayer.subLayer.length > 0) {
                this.openAllLayer.push(attrLayer);
              }
            }
          }
        });
      }
    },

    //叠加主页面上显示的图层
    overAllLayers(view) {
      if (this.openAllLayer) {
        this.openAllLayer.forEach((item) => {
          let layer = new MapImageLayer({
            url: item.layerURL,
            id: item.layerName,
            opacity: item.opacity,
          });
          view.map.add(layer, 0);
        });
      }
    },

    // 关闭图例
    legendClose() {
      this.showLegend(false);
      this.handleFocus(null);
      for (const key in this.toolStatus) {
        this.toolStatus[key] = false;
      }
    },
    // 关闭分屏
    closeSplit() {
      this.$emit("setBtnClass", -1);
      this.setBtn(false);
      this.setSplitScreen(false);

      this.mapview.map.basemap.baseLayers.map((item) => {
        item.visible = false;
      });
      this.isshow = false;
      this.splitflag = false;
      this.theBaseLayer.visible = true;

      this.showSplit2 = false;
      this.showSplit4 = false;
    },
    //关闭选择弹窗
    closeDialog() {
      this.dialogVisible = false;
      this.$emit("setBtnClass", -1);
      this.setBtn(false);
      this.setSplitScreen(false);
    },
    //跟随主页面底图显示
    showmap(view) {
      if (this.mapconfig.yxtlw.URL != "" && this.mapconfig.sltlw.URL != "") {
        let img_wLayer = view.map.findLayerById("img_w");
        let cia_wLayer = view.map.findLayerById("cia_w");
        let vec_wLayer = view.map.findLayerById("vec_w");
        let cva_wLayer = view.map.findLayerById("cva_w");
        if (this.mapnumber == 1) {
          //影像图显示
          img_wLayer.visible = true; //影像图
          cia_wLayer.visible = true; //影像图路网
          vec_wLayer.visible = false; //矢量图
          cva_wLayer.visible = false; //矢量图路网
        } else {
          img_wLayer.visible = false; //影像图
          cia_wLayer.visible = false; //影像图路网
          vec_wLayer.visible = true; //矢量图
          cva_wLayer.visible = true; //矢量图路网
        }
      } else {
        let img_wLayer = view.map.findLayerById("img_w");
        let vec_wLayer = view.map.findLayerById("vec_w");
        if (this.mapnumber == 1) {
          //影像图显示
          img_wLayer.visible = true; //影像图
          vec_wLayer.visible = false; //矢量图
        } else {
          img_wLayer.visible = false; //影像图
          vec_wLayer.visible = true; //矢量图
        }
      }
    },
    //关闭底图
    closemap2() {
      if (this.splitflag == false) {
        this.rightMapView.map.basemap.baseLayers.map((item) => {
          if (item.visible == true) {
            this.theBaseLayer = item;
          }
        });
        this.splitflag = true;
      }

      this.rightMapView.map.basemap.baseLayers.map((item) => {
        item.visible = this.isshow;
      });
      this.leftMapView.map.basemap.baseLayers.map((item) => {
        item.visible = this.isshow;
      });
      this.isshow = !this.isshow;
    },
    closemap4() {
      if (this.splitflag == false) {
        this.leftTopMapView.map.basemap.baseLayers.map((item) => {
          if (item.visible == true) {
            this.theBaseLayer = item;
          }
        });
        this.splitflag = true;
      }
      this.leftTopMapView.map.basemap.baseLayers.map((item) => {
        item.visible = this.isshow;
      });
      this.rightTopMapView.map.basemap.baseLayers.map((item) => {
        item.visible = this.isshow;
      });
      this.leftBottomMapView.map.basemap.baseLayers.map((item) => {
        item.visible = this.isshow;
      });
      this.rightBottomMapView.map.basemap.baseLayers.map((item) => {
        item.visible = this.isshow;
      });
      this.isshow = !this.isshow;
    },
  },
};
</script>
<style scoped lang="scss">
$el-main-color: #2d559f; //主色

::v-deep .selectSplit {
  width: 380px;
  height: auto;
  margin: 0 !important;
  position: absolute;
  top: 10vh;
  left: 17vw;
  opacity: 0.9;

  .el-dialog__header {
    padding: 6px !important;
    padding-left: 20px !important;
    border-bottom: 1px solid #d7d7d7;
    background: #126ac4;

    .el-dialog__title {
      color: #fff;
      letter-spacing: 2px;
    }

    .el-dialog__headerbtn {
      top: 10px !important;

      .el-dialog__close {
        color: #fff;
      }
    }
  }

  .el-dialog__body {
    // padding: 20px 20px !important;
    padding-left: 20px !important;
    padding-top: 20px !important;
    padding-right: 20px !important;
    padding-bottom: 0px !important;
  }

  .el-form-item__label {
    font-weight: 700;
  }

  .el-dialog__footer {
    text-align: center;
  }
}

.map-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  background-color: #eee;
  box-sizing: border-box;
}

.map {
  width: 100%;
  height: 100%;
  position: relative;
  border-right: 1px solid #ccc;
}

.splitmap-box {
  width: 100%;
  height: 100%;
  position: absolute;
  background-color: #eee;
  z-index: 1;
  display: flex;

  .split-left,
  .split-right {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
    color: rgba($color: $el-main-color, $alpha: 0.5);
  }

  .split-left {
    border-right: 1px dashed #ccc;
  }

  .close-map {
    position: absolute;
    right: 80px;
    top: 20px;
  }

  .close-split {
    position: absolute;
    right: 20px;
    top: 20px;
  }
}

.splitmap-box4 {
  width: 100%;
  height: 100%;
  position: absolute;
  background-color: #eee;
  z-index: 1;
  display: flex;

  .split-left-top,
  .split-left-bottom,
  .split-right-top,
  .split-right-bottom {
    position: absolute;
    width: 50%;
    height: 50%;
    justify-content: center;
    align-items: center;
    font-size: 20px;
    color: rgba($color: $el-main-color, $alpha: 0.5);
  }

  .split-left-top {
    top: 0;
    left: 0;
  }

  .split-left-bottom {
    top: 50%;
    left: 0;
  }

  .split-right-top {
    top: 0;
    right: 0;
  }

  .split-right-bottom {
    top: 50%;
    right: 0;
  }

  .map {
    width: 100%;
    height: 100%;
    position: relative;
    border: 1px solid #ccc;
  }

  .close-map {
    position: absolute;
    right: 80px;
    top: 20px;
  }

  .close-split {
    position: absolute;
    right: 20px;
    top: 20px;
  }
}

::v-deep .esri-widget--panel {
  overflow: auto !important;
}
</style>
