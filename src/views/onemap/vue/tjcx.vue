<template>
  <div class="">
    <el-dialog
      title="条件查询"
      :visible="dialogVisible"
      custom-class="count"
      :modal="false"
      :close-on-click-modal="false"
      :before-close="closeDialog"
      destroy-on-close
    >
      <span slot="title">
        <el-tabs tab-position="left" v-model="tabFocus" @tab-click="handleTab">
          <el-tab-pane
            v-for="item in tabList"
            :key="item.PID"
            :label="item.TYPENAME"
            :name="String(item.PID)"
          ></el-tab-pane>
        </el-tabs>
      </span>
      <div class="content-box">
        <div class="content-title">
          <i class="el-icon-caret-right"></i>
          {{ contentTitle }}
        </div>

        <div class="content-form">
          <el-form
            :inline="true"
            :model="countForm"
            class="demo-form-inline"
            size="mini"
          >
            <el-form-item
              v-for="item in formList"
              :key="item.pid"
              :label="item.displayname"
              :class="`${item.controltype}-type`"
            >
              <el-input
                v-if="item.controltype == 'text'"
                :placeholder="`请输入${item.displayname}`"
                v-model="countForm[item.fieldname]"
              ></el-input>

              <el-date-picker
                v-if="item.controltype == 'date'"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                v-model="countForm[item.fieldname]"
              >
              </el-date-picker>

              <el-select
                v-if="item.controltype == 'list'"
                v-model="countForm[item.fieldname]"
                :placeholder="`请选择${item.displayname}`"
              >
                <el-option
                  v-for="value in item.VALUELIST"
                  :label="value.controlname"
                  :value="value.controlvalue"
                  :key="value.pid"
                ></el-option>
              </el-select>

              <div
                :class="`${item.CONTROLTYPE}-type`"
                v-if="item.CONTROLTYPE == 'range'"
              >
                <el-input
                  type="number"
                  v-model="countForm[item.FIELDNAME][0]"
                ></el-input>
                <span class="apart">-</span>
                <el-input
                  type="number"
                  v-model="countForm[item.FIELDNAME][1]"
                ></el-input>
              </div>
            </el-form-item>
            <div class="form-btn">
              <el-button type="primary" @click="searchForm">查询</el-button>
              <el-button @click="closeDialog">取消</el-button>
            </div>
          </el-form>
        </div>
      </div>
    </el-dialog>

    <!-- 上拉抽屉 -->
    <el-drawer
      :visible.sync="drawer"
      direction="btt"
      :modal="false"
      :wrapperClosable="false"
      ref="drawer"
      :size="drawerSize"
      @closed="drawerClosed"
      custom-class="drawer"
    >
      <i
        class="showDrawer"
        :class="switchDrawerIcon"
        :switch="switchDrawer"
        @click="switchHeight"
      ></i>
      <span>
        <!-- 表格 -->
        <el-table
          :data="
            overlayTable.slice(
              (currentPage - 1) * pagesize,
              currentPage * pagesize
            )
          "
          border
          style="width: 100%"
          height="300"
          stripe
          v-loading="loading"
          element-loading-text="拼命加载中"
          @row-click="tableRowClick"
        >
          <el-table-column
            v-for="field in resultFields"
            :prop="field.fieldname"
            :label="field.fielddesc"
            :key="field.pid"
            min-width="180"
          >
          </el-table-column>
        </el-table>
        <!-- 分页 -->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="pagesizeArr"
          :page-size="pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="overlayTable.length"
          background
        >
        </el-pagination>
      </span>
    </el-drawer>

    <!-- 表格属性弹窗 -->
    <el-dialog
      :visible.sync="attrdialogstatus"
      custom-class="count-attr"
      :modal="false"
      title="属性"
      center
    >
      <!-- <div class="prop-sel">
				<el-select
					v-model="nameTit"
					@change="nameClick"
					value-key="value"
					size="small"
					popper-class="selBox"
				>
					<el-option
						v-for="item in namelist"
						:key="item.value"
						:label="item.name"
						:value="item"
					></el-option>
				</el-select>
				<span class="count-box">
					共
					<span class="count">{{ namelist.length }}</span>
					项
				</span>
			</div>
			<div class="tags">
				<el-tag
					v-for="(item, index) in tagList"
					:key="index"
					@click="changeTag(item)"
					:class="{ focusTag: focusTag == item.value }"
				>
					{{ item.displayfieldvalue }}
				</el-tag>
			</div>  -->
      <el-table
        :data="attrTableData"
        border
        tooltip-effect="dark"
        stripe
        size="small"
        ref="attrTable"
      >
        <el-table-column prop="name" label="属性"></el-table-column>
        <el-table-column prop="value" label="属性值"></el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>
<script>
import { mapMutations, mapState } from "vuex";
import {
  getConditionTypeList,
  getConditionLayerList,
  getConditionFieldList,
  getConditionFieldValueList,
  getConditionTabResultFields,
} from "../api/onemap";
import { GetLayerAttrs } from "@/utils/common-map-method";
import * as query from "@arcgis/core/rest/query";
import Query from "@arcgis/core/rest/support/Query";
import { executeQueryJSON } from "@arcgis/core/rest/query";
import Graphic from "@arcgis/core/Graphic";
let app;
export default {
  name: "",
  props: ["btnClass"],
  components: {},
  data() {
    return {
      tabList: [],
      tabFocus: "",
      contentTitle: "",
      formList: [],
      countForm: {
        PRJNAME: "",
      },
      searchLayers: [], //查询图层列表
      resultFields: [], //查询结果展示的字段列表
      outFields: ["*"], //gis查询结果字段名数组
      drawer: false,
      overlayTable: [],
      switchDrawer: true,
      switchDrawerIcon: "el-icon-arrow-down",
      drawerSize: "40%",
      currentPage: 1,
      pagesizeArr: [10, 20, 50, 100],
      pagesize: 10,
      total: 0,
      loading: true,
      attrdialogstatus: false,
      attrTableData: [],
      dialogVisible: false,
    };
  },
  computed: {
    ...mapState("onemap-store", ["mapview", "symbol"]),
  },
  watch: {
    btnClass: {
      async handler(val) {
        if (val == 1) {
          this.dialogVisible = true;
          this.handleToggleIndex(false);
          await this.getTabs();
          await this.getTabLayers(this.tabFocus); //获取标签类型对应要查询的图层列表
          await this.getTabSearchResultFields(this.tabFocus); //获取标签类型对应的查询展示结果阶段列表
          await this.getFormList(this.tabFocus);
        } else {
          this.dialogVisible = false;
        }
      },
      immediate: true,
    },
  },
  created() {},
  mounted() {
    app = this;
  },
  methods: {
    ...mapMutations("onemap-store", [
      "handleOnemapPopup",
      "handleToggleIndex",
      "setBtn",
      "setSymbol",
    ]),

    // 关闭弹窗
    closeDialog() {
      this.mapview.graphics.removeAll();
      this.handleOnemapPopup({ code: "init" });
      this.handleToggleIndex(true);
      this.$emit("setBtnClass", -1);
      this.setBtn(false);
      Object.assign(this.$data, this.$options.data());
    },

    // 获取标签页数据
    async getTabs() {
      // let params = {
      //   uid: 603,
      // };
      const data = await getConditionTypeList();
      if (data.code === 200) {
        this.tabList = data.data;
        this.tabFocus = String(data.data[0].PID);
        this.contentTitle = data.data[0].TYPENAME;
      } else {
        this.$message.error(data.msg);
      }
    },

    //获取标签页对应的服务数据
    async getTabLayers(tabid) {
      let params = {
        // uid: 603,
        tabid: tabid,
      };
      const data = await getConditionLayerList(params);
      if (data.code === 200) {
        this.searchLayers = data.data;
      } else {
        this.$message.error(data.msg);
      }
    },

    //获取标签类型对应的查询展示结果阶段列表
    async getTabSearchResultFields(tabid) {
      let params = {
        tabid: tabid,
      };
      const data = await getConditionTabResultFields(params);
      if (data.code === 200) {
        this.resultFields = data.data;
        if (this.resultFields.length > 0) {
          let outfields = [];
          this.resultFields.forEach((field) => {
            outfields.push(field.fieldname);
          });
          outfields.push("OBJECTID");
          this.outFields = outfields;
        }
      } else {
        this.$message.error(data.msg);
      }
    },

    // 标签页选择
    handleTab(tab) {
      this.contentTitle = tab.label;
      this.getTabLayers(tab.name); //获取标签类型对应要查询的图层列表
      this.getTabSearchResultFields(tab.name); //获取标签类型对应的查询展示结果阶段列表
      this.getFormList(tab.name);
    },

    // 表单渲染
    async getFormList(tabid) {
      let params = {
        tabid,
      };
      const data = await getConditionFieldList(params);
      if (data.code === 200) {
        this.formList = data.data;
        data.data.map((item) => {
          let type = item.CONTROLTYPE === "range" ? [] : "";
          this.$set(this.countForm, item.FIELDNAME, type);
        });
      } else {
        this.$message.error(data.msg);
      }
    },

    // 查询表单
    searchForm() {
      this.drawer = true;
      this.loading = true;
      this.overlayTable = [];
      let strwhere = " 1=1 ";
      if (this.formList.length > 0) {
        this.formList.forEach((where) => {
          //字符串
          if (where.fieldtype.toLowerCase() == "string") {
            if (this.countForm[where.fieldname]) {
              strwhere +=
                " and " +
                where.fieldname +
                " like '%" +
                this.countForm[where.fieldname] +
                "%' ";
            }
          }
          //数字区间
          if (where.fieldtype.toLowerCase() == "number") {
            if (this.countForm[where.fieldname].length == 1) {
              strwhere +=
                "and  (" +
                where.fieldname +
                ">=" +
                this.countForm[where.fieldname][0] +
                " ) ";
            }
            if (this.countForm[where.fieldname].length == 2) {
              if (
                this.countForm[where.fieldname][0] ||
                this.countForm[where.fieldname][1]
              ) {
                if (this.countForm[where.fieldname][0]) {
                  strwhere +=
                    " and (" +
                    where.fieldname +
                    ">=" +
                    this.countForm[where.fieldname][0];
                } else {
                  strwhere += " (";
                }
                if (this.countForm[where.fieldname][1]) {
                  strwhere +=
                    " and " +
                    where.fieldname +
                    "<=" +
                    this.countForm[where.fieldname][1] +
                    ") ";
                } else {
                  strwhere += ") ";
                }
              }
            }
          }
          //时间区间
          if (where.fieldtype.toLowerCase() == "date") {
            if (this.countForm[where.fieldname]) {
              var sdate = new Date(this.countForm[where.fieldname][0]);
              var edate = new Date(this.countForm[where.fieldname][1]);
              // let start_value =
              //   sdate.getFullYear() +
              //   "-" +
              //   (sdate.getMonth() + 1) +
              //   "-" +
              //   ((sdate.getDate() == 1 ? 2 : sdate.getDate()) - 1);
              // let end_value =
              //   edate.getFullYear() +
              //   "-" +
              //   (edate.getMonth() + 1) +
              //   "-" +
              //   (edate.getDate() + 1);
              let start_value = sdate.getTime();
              let end_value = edate.getTime();
              strwhere +=
                " and " +
                where.fieldname +
                " >'" +
                start_value +
                "' and " +
                where.fieldname +
                "<'" +
                end_value +
                "'";
            }
          }
        });
      } else {
        this.$message.warning("该查询没有配置查询条件,将查询全部信息");
      }
      //开始查询
      var k = 0; //find递归循环索引
      (this.pagesize = 10), (this.currentPage = 1);
      //递归查询方法
      this.find(k, strwhere);
    },
    async find(k, strwhere) {
      let queryObject = new Query({
        where: strwhere,
        outFields: app.outFields,
        returnGeometry: true,
      });
      const queryRes = await query
        .executeQueryJSON(app.searchLayers[k].layerurl, queryObject)
        .catch(function (e) {
          app.loading = false;
          app.$message.warning(e.message);
          console.log(e);
        });
      if (queryRes && queryRes.features.length > 0) {
        app.loading = false;
        queryRes.features.forEach((data) => {
          let dataitem = {
            geo: data.geometry,
            layerurl: app.searchLayers[k].layerurl,
            layername: app.searchLayers[k].layername,
          };
          app.resultFields.forEach((field) => {
            if (field.fieldtype.toLowerCase() == "date") {
              var value = data.attributes[field.fieldname];
              var date = new Date(value);
              value =
                date.getFullYear() +
                "-" +
                (date.getMonth() + 1) +
                "-" +
                date.getDate();
              Object.assign(dataitem, {
                [field.fieldname]: value,
              });
            } else if (field.fieldtype.toLowerCase() == "int") {
              var value = data.attributes[field.fieldname].toFixed(3);
              Object.assign(dataitem, {
                [field.fieldname]: value,
              });
            } else {
              Object.assign(dataitem, {
                [field.fieldname]: data.attributes[field.fieldname],
              });
            }
          });
          Object.assign(dataitem, {
            OBJECTID: data.attributes["OBJECTID"],
          });
          app.overlayTable.push(dataitem);
        });
        app.total = app.overlayTable.length;
      } else {
        app.loading = false;
      }
      k++;
      if (k < app.searchLayers.length) {
        find(k, strwhere);
      } else {
        app.total = app.overlayTable.length;
        app.loading = false;
        //app.showExport = false
      }
    },

    // 切换抽屉高度
    switchHeight() {
      this.switchDrawer = !this.switchDrawer;
      if (!this.switchDrawer) {
        this.switchDrawerIcon = "el-icon-arrow-up";
        this.drawerSize = "5%";
      } else {
        this.switchDrawerIcon = "el-icon-arrow-down";
        this.drawerSize = "40%";
      }
    },

    // 抽屉关闭动画结束后状态恢复
    drawerClosed() {
      this.drawerSize = "40%";
      this.switchDrawer = true;
      this.switchDrawerIcon = "el-icon-arrow-down";
    },

    // pagesize 改变时触发
    handleSizeChange(val) {
      this.pagesize = val;
    },
    // currentpage 改变时触发
    handleCurrentChange(val) {
      this.currentPage = val;
    },

    // 表格行点击
    async tableRowClick(row, column, event) {
      //获取属性信息
      this.attrTableData = await GetLayerAttrs(row.layerurl, row.OBJECTID);
      this.attrdialogstatus = true;
      let graphic = new Graphic({
        geometry: row.geo,
        symbol: this.symbol,
      });
      this.mapview.graphics.removeAll();
      this.mapview.graphics.add(graphic);
      this.mapview.extent = graphic.geometry.extent;
      this.mapview.zoom = this.mapview.zoom - 2;
    },
  },
};
</script>
<style lang="scss" scoped>
@import "../style/tjcx.scss";
</style>
