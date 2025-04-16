<template>
  <div class="">
    <el-dialog
      title="叠加图纸"
      :visible="dialogVisible"
      custom-class="tuzhi"
      :modal="false"
      :close-on-click-modal="false"
      :before-close="closeDialog"
      v-if="btnClass == 2"
    >
      <div class="import-box">
        <div class="import-title">
          <i class="el-icon-caret-right"></i>
          选择文件上传
        </div>
        <el-button slot="trigger" size="mini" type="success" @click="selectWkid"
            >导入文件</el-button
          >
          <el-button
            class="render-btn"
            size="mini"
            type="warning"
            @click="renderRange"
            >绘制范围</el-button
          >
          <el-popover
            placement="right-start"
            title="上传文件注意事项"
            popper-class="popover"
            trigger="hover"
          >
            <div class="tips">
              <div>
                支持导入SHP（需将SHP打包成压缩包 zip ）、CAD、TXT（<span
                  class="link-template"
                  @click="downTemplate"
                  >模板下载</span
                >）文件
              </div>
            </div>
            <span slot="reference">
              <i class="el-icon-info"></i>
              注意事项
            </span>
          </el-popover>
        <el-upload
          class="upload"
          ref="upload"
          action="action"
          :show-file-list="false"
          :http-request="handleUpload"
          accept=".dwg,.zip,.rar,.txt"
        >
        </el-upload>
        <el-table :data="tableData" border stripe size="mini">
          <el-table-column prop="name" label="名称" align="center">
          </el-table-column>
          <el-table-column prop="area" label="面积(公顷)" align="center">
          </el-table-column>
          <el-table-column label="操作" align="center" min-width="150">
            <template v-slot="scope">
              <el-link @click="handleLocate(scope.row)" type="primary">
                <i class="iconfont icon-dingwei1"></i>定位
              </el-link>
              <el-link @click="handleExport(scope.row)" type="primary">
                <i class="el-icon-receiving"></i>导出
              </el-link>
              <!-- <el-link @click="handleEdit(scope.row)" type="primary">
                                <i class="el-icon-edit"></i>编辑
              </el-link> -->
              <el-link @click="handleDelete(scope.row,scope.$index)" type="primary">
                <i class="el-icon-delete"></i>删除
              </el-link>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
    <el-dialog custom-class="selectSwipe" title="选择导入文件坐标系" :visible.sync="isShowWkid" 
      :close-on-click-modal="false" destroy-on-close :before-close="closeDialogWkid">
      <el-form :inline="true" class="demo-form-inline">
        <el-form-item label="坐标系">
          <el-select v-model="isWkid" value-key="value" placeholder="选择导入文件坐标系" 
            clearable>
            <el-option v-for="item in wkidNumber" :label="item.label" :key="item.id" :value="item"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submit">确 定</el-button>
        <el-button @click="consoleSub">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { uploadDwg, readApi, createGraphic } from "@/utils/topic-map";
import {
  getAreaAndLength,
  clearMapGraphics,
  exportPointTxt,
} from "@/utils/common-map-method";
import {readFile} from'@/views/onemap/api/onemap';
import { mapMutations, mapState } from "vuex";
import Sketch from "@arcgis/core/widgets/Sketch";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import axios from "axios";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import Polygon from '@arcgis/core/geometry/Polygon';
import Point from '@arcgis/core/geometry/Point';
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import * as projection from '@arcgis/core/geometry/projection';
import Graphic from '@arcgis/core/Graphic';
import store from '@/store/index';
import { union } from '@arcgis/core/geometry/geometryEngine';
import Vue from "vue";
export default {
  name: "",
  props: ["btnClass"],
  components: {},
  data() {
    return {
      tableData: [],
      radioID: "",
      upLoading: null, // 上传,
      overGraphicLayer: null,
      sketch: null,
      dialogVisible: false,
      isWkid:'',
      isShowWkid:false,//控制坐标系选择弹窗,
      wkidNumber:[{
          value: 4490,
          label: '国家大地2000坐标系',
        },
        {
          value: 4527,
          label: '高斯克里格39°带',
        },
        {
          value: 4528,
          label: '高斯克里格40°带',
        },
        {
          value: 4548,
          label: '中央子午线117°E',
        },
        {
          value: 4549,
          label: '中央子午线120°E',
        }],//坐标系选项,
      GraphicWkid:'',//加载图形wkid
    };
  },
  computed: {
    ...mapState("onemap-store", ["mapview", "symbol"]),
  },
  watch: {
    btnClass: {
      handler(val) {
        if (val == 2) {
          this.dialogVisible = true;
          this.handleToggleIndex(false);
          this.initSketchLayer();
        } else {
          this.dialogVisible = false;
        }
      },
      immediate: true,
    },
  },
  created() {},
  mounted() {},
  methods: {
    ...mapMutations("onemap-store", [
      "handleOnemapPopup",
      "handleToggleIndex",
      "setBtn",
    ]),
    selectWkid(){
      this.isShowWkid=true;
    },
    // 初始化画图图层
    initSketchLayer() {
      this.overGraphicLayer = new GraphicsLayer({
        id: "overLayer",
      });
      this.mapview.map.layers.add(this.overGraphicLayer);
      this.sketch = new Sketch({
        layer: this.overGraphicLayer,
        view: this.mapview,
      });
    },

    // 关闭弹窗
    closeDialog() {
      this.handleOnemapPopup({ code: "init" });
      this.handleToggleIndex(true);
      clearMapGraphics(null);
      this.mapview.graphics.removeAll();
      this.$emit("setBtnClass", -1);
      this.setBtn(false);
      this.mapview.graphics.removeAll();
      this.overGraphicLayer.graphics.removeAll();
    },
    closeDialogWkid(){
      this.isShowWkid=false;
    },

    // 自定义上传事件
    async handleUpload(params) {
      this.upLoading = this.$message({
        iconClass: "el-icon-loading",
        message: "上传中...",
        duration: 0,
        customClass: "prop-search",
      });
      //文件扩展名
      var file_ext = params.file.name
        .split(".")
        [params.file.name.split(".").length - 1].toLowerCase();
      var savefilepath = "OTHER";
      if (file_ext == "dwg") {
        savefilepath = "DWG";
      }
      if (file_ext == "txt") {
        savefilepath = "TXT";
      }
      if (file_ext == "zip" || file_ext == "rar") {
        savefilepath = "SHP";
      }
      let form = new FormData();
      form.append("file", params.file);
      // form.append('filepath', savefilepath);
      ;
      if (file_ext == "dwg") {
        this.readDWG(form, params.file.name);
      }
      if (file_ext == "txt") {
        this.readTXT(form, params.file.name);
      }
      if (file_ext == "zip" || file_ext == "rar") {
        this.readSHP(form, params.file.name);
      }
    },

    // 读取DWG
    async readDWG(params, name) {
      // let data = await axios({
      //   url: "/File/handleFile",
      //   method: "POST",
      //   data: params,
      // });
      let data = await readFile(params);
      ;
      if (data.code === 200) {
        this.overLayer(data.data, name);
      } else {
        this.upLoading.close();
        this.$message.error(data.msg);
      }
    },

    //读取TXT
    async readTXT(params, name) {
      // let data = await axios({
      //   url: "/File/handleFile",
      //   method: "POST",
      //   data: params,
      // });
      let data = await readFile(params);
      if (data.code === 200) {
        this.overLayer(data.data, name);
      } else {
        this.upLoading.close();
        this.$message.error(data.msg);
      }
    },

    //读取shp
    async readSHP(params, name) {
      // let data = await axios({
      //   url: "/File/handleFile",
      //   method: "POST",
      //   data: params,
      // });
      let data = await readFile(params);
      if (data.code === 200) {
        this.overLayer(data.data, name);
      } else {
        this.upLoading.close();
        this.$message.error(data.msg);
      }
    },

    // 叠加图形到地图
    async overLayer(pointData, filename) {
      this.mapview.graphics.removeAll();
      ;
      const graphic = await createGraphic(pointData,this.mapview,this.GraphicWkid);
      if (graphic) {
        //添加表格数据
        let result = await getAreaAndLength(graphic.geometry);
        let obj = {
          name: filename,
          area: result.area,
          graphic: graphic,
        };
        this.tableData.push(obj);
        this.upLoading.close();
        this.mapview.graphics.add(graphic);
        this.mapview.extent = graphic.geometry.extent;
        this.mapview.zoom = 8;
      }
    },

    // 定位
    handleLocate(row) {
      row.graphic.symbol = this.symbol;
      this.mapview.graphics.removeAll();
      this.overGraphicLayer.graphics.removeAll();
      this.mapview.graphics.add(row.graphic);
      this.mapview.extent = row.graphic.geometry.extent;
      this.mapview.zoom -= 2;
    },

    // 模板下载
    downTemplate() {
      window.open(
        `${Vue.prototype.apiURL_file}/FileResources/Template/导入图形的坐标txt模板.txt`
      );
    },

    // 绘制范围
    renderRange() {
    //   if (this.sketch == null) {
    //     this.sketch = new Sketch({
    //       layer: this.overGraphicLayer,
    //       view: this.mapview,
    //     });
    //   }
      this.mapview.graphics.removeAll();
      this.overGraphicLayer.graphics.removeAll();
      // this.sketch.when(() => {
      //     this.sketch.create('polygon');
      //     this.sketch.on('create', async (evt) => {
      //         if (evt.state == 'complete') {

      //             let result = await getAreaAndLength(
      //                 evt.graphic.geometry
      //             );
      //             let obj = {
      //                 name:
      //                     '图形_' +
      //                     new Date()
      //                         .toLocaleString('chinese', {
      //                             hour12: false,
      //                         })
      //                         .replaceAll('/', '_')
      //                         .replaceAll(':', '_'),
      //                 area: result.area,
      //                 graphic: evt.graphic,
      //             };
      //             this.tableData.push(obj);
      //             this.sketch.destroy();
      //             this.sketch = null;
      //         }
      //     });
      // });
      let sketchViewModel = new SketchViewModel({
        layer: this.overGraphicLayer,
        view: this.mapview,
        polygonSymbol: {
          type: "simple-fill",
          color: [150, 150, 150, 0.2],
          outline: {
            color: [255, 0, 0],
            width: 2,
          },
        }
      });
      sketchViewModel.create('polygon');
      sketchViewModel.on('create', async (evt) => {
              if (evt.state == 'complete') {

                  let result = await getAreaAndLength(
                      evt.graphic.geometry
                  );
                  let obj = {
                      name:
                          '图形_' +
                          new Date()
                              .toLocaleString('chinese', {
                                  hour12: false,
                              })
                              .replaceAll('/', '_')
                              .replaceAll(':', '_'),
                      area: result.area,
                      graphic: evt.graphic,
                  };
                  this.tableData.push(obj);
                }
            })
    },
    // 删除图形信息
    handleDelete(row,$index){
      this.overGraphicLayer.graphics.remove(row.graphic);
      this.mapview.graphics.remove(row.graphic);
      this.tableData.splice($index,1);
    },
    // 编辑列表图形
    handleEdit(row) {
      // this.sketch.when(() => {
      this.mapview.graphics.removeAll();
      this.overGraphicLayer.graphics.removeAll();
      this.overGraphicLayer.graphics.add(row.graphic);
      if (this.sketch == null) {
        this.sketch = new Sketch({
          layer: this.overGraphicLayer,
          view: this.mapview,
        });
      }
      this.sketch.when(() => {
        this.sketch.update([row.graphic]);
      });
    },
    submit(){
      if (this.isWkid == '' ) {
        this.$message.error('请选择坐标系');
        return;
      };
      this.GraphicWkid=this.isWkid.value;
      this.$refs['upload'].$refs['upload-inner'].handleClick();
      this.isShowWkid=false;
      this.isWkid='';
    },
    consoleSub() {
      this.isShowWkid = false;
      this.isWkid='';
    },

    // 导出图形
    async handleExport(row) {
      await exportPointTxt(row.graphic.geometry, row.name, 1);
    },
  },
};
</script>
<style scoped lang="scss">
@import "../style/djtz.scss";
</style>
