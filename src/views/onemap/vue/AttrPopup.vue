<template>
  <div class="">
    <el-dialog
      :visible.sync="attrdialogstatus"
      custom-class="arcdialog"
      :before-close="handleAttrClose"
      :modal="false"
      title="属性"
      center
    >
      <div class="prop-sel">
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
      </div>
      <el-table
        :data="attrTableData"
        border
        tooltip-effect="dark"
        stripe
        size="small"
      >
        <el-table-column prop="name" label="属性"></el-table-column>
        <el-table-column prop="value" label="属性值"></el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import { mapMutations, mapState } from "vuex";
import { GraphicLocation, clearMapGraphics } from "@/utils/common-map-method";
export default {
  name: "",
  props: { isShow: Boolean },
  components: {},
  data() {
    return {
      dialogAttr: false,
      nameTit: null,
      namelist: [],
      tagList: [],
      attrTableData: [],
      focusTag: "",
      tagIndex: 3,
    };
  },
  computed: {
    ...mapState("onemap-store", [
      "toolView",
      "toolStatus",
      "attrdata",
      "attrdialogstatus",
    ]),
  },
  watch: {
    attrdata: {
      handler(res) {
        if (res.length > 0) {
          this.dialogAttr = true;
          var layerGroupData = [];
          var layerlist = this.unique(res); //调取自定义去重函数
          layerlist.forEach((element) => {
            var datalist = [];
            res.forEach((item) => {
              if (element.name == item.name) {
                datalist.push(item);
              }
            });
            var groupitem = {
              name: element.name,
              datalist: datalist,
            };
            layerGroupData.push(groupitem);
          });
          this.namelist = layerGroupData;
          this.nameTit = layerGroupData[0].name;
          this.tagList = layerGroupData[0].datalist;
          for (var i = 0; i < this.tagList[0].fieldvalues.length; i++) {
            if (this.tagList[0].fieldvalues[i].name == "图层名称") {
              this.tagIndex = i;
              break;
            }
          }
          this.focusTag = this.tagList[0].value;
          this.attrTableData = layerGroupData[0].datalist[0].fieldvalues;
          GraphicLocation(layerGroupData[0].datalist[0].graphic);
          // AttrLocation(layerGroupData[0].datalist[0].value);
        }
      },
    },
  },
  created() {},
  mounted() {},
  methods: {
    ...mapMutations("onemap-store", {
      attrdialog: "attrdialogstatus",
      handleFocus: "handleFocus",
    }),
    //去重
    unique(arr) {
      const res = new Map();
      return arr.filter((arr) => !res.has(arr.name) && res.set(arr.name, 1));
    },
    // 关闭弹窗
    handleAttrClose() {
      clearMapGraphics(null);
      this.attrdialog(false);
      this.handleFocus(null);
      // this.$parent.clearControl();
    },

    // 属性下拉框选择
    nameClick(val) {
      clearMapGraphics(null);
      this.nameTit = val.name;
      this.attrTableData = val.datalist[0].fieldvalues;
      this.tagList = val.datalist;
      this.focusTag = this.tagList[0].value;
      // this.attrTableData = val.datalist[0].fieldvalues;
      GraphicLocation(val.datalist[0].graphic);
    },

    // 标签点击
    changeTag(item) {
      
      clearMapGraphics(null);
      this.focusTag = item.value;
      this.attrTableData = item.fieldvalues;
      GraphicLocation(item.graphic);
    },
  },
};
</script>

<style scoped lang="scss">
$el-main-color: #126ac4; // 主色
::v-deep .arcdialog {
  width: 430px;
  height: auto;
  margin: 0 !important;
  position: absolute;
  top: 15vh;
  // right: 20px;
  left: 50vw;
  .el-dialog__header {
    padding: 6px !important;
    padding-left: 20px !important;
    border-bottom: 1px solid #d7d7d7;
    background: $el-main-color;
    text-align: left;
    .el-dialog__title {
      color: #fff;
      letter-spacing: 2px;
    }
    .el-dialog__headerbtn {
      top: 10px !important;
      .el-dialog__close {
        color: #fff;
        cursor: pointer;
      }
    }
  }
  .el-dialog__body {
    padding: 10px 10px !important;
    .prop-sel {
      margin-bottom: 10px;
      color: $el-main-color;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .el-select {
        flex: 1;
        .el-select__caret {
          color: $el-main-color;
        }
      }
      .el-input__inner {
        font-weight: 700;
        color: $el-main-color;
        border-color: $el-main-color;
        font-size: 15px;
      }
      .el-input__suffix {
        color: #fff;
      }
      .count-box {
        margin-left: 10px;
        padding: 6px 10px;
        background: $el-main-color;
        border-radius: 4px;
        color: #fff;
        font-size: 15px;
      }
    }
    .tags {
      margin: 8px 0;
      overflow-x: auto;
      max-height: 80px;
      .el-tag {
        cursor: pointer;
        margin-bottom: 8px;
        font-size: 15px;
      }
      .el-tag + .el-tag {
        margin-left: 8px;
      }
    }
    .el-table {
      .el-table__body-wrapper {
        max-height: 50vh;
        overflow-y: auto;
      }
    }
    .el-table th {
      background-color: #eaeef5 !important;
      color: $el-main-color !important;
    }
    .el-table th,
    .el-table td {
      padding: 6px 0;
      font-size: 13px;
    }
  }
}
.el-dialog__wrapper {
  position: absolute !important;
  overflow: visible;
  left: auto;
  right: auto;
  bottom: auto;
}
::v-deep.focusTag {
    color: white !important;
    background-color: #409eff !important;
}
</style>

