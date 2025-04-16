<!--
 * @Author: LJX
 * @Date: 2023-04-14 11:24:14
 * @LastEditors: dht
 * @LastEditTime: 2023-05-22 14:24:51
 * @FilePath: \fjsy-app\src\views\onemap\vue\OnemapSort.vue
 * @Description: 统一平台 - 图层顺序
-->
<template>
  <div class="">
    <!-- 图层顺序调整 -->
    <el-dialog
      ref="dialog"
      :title="comTitle"
      :visible.sync="dialogVisible"
      :before-close="closeDialog"
      :modal="false"
      :close-on-click-modal="false"
      custom-class="wiki"
    >
      <div class="el-dialog__title" slot="title">
        <span>{{ comTitle }}</span>
        <el-tooltip
          class="item"
          effect="light"
          content="拖动图层可调整图层显示顺序"
          placement="bottom"
        >
          <i class="el-icon-question"></i>
        </el-tooltip>
      </div>
      <div class="tree-box">
        <el-tree
          :data="treeData"
          :props="defaultProps"
          empty-text="暂无数据"
          ref="layertree"
          node-key="id"
          @node-drag-start="handleDragStart"
          @node-drag-enter="handleDragEnter"
          @node-drag-leave="handleDragLeave"
          @node-drag-over="handleDragOver"
          @node-drag-end="handleDragEnd"
          @node-drop="handleDrop"
          @check="currChange"
          draggable
          highlight-current
          :allow-drop="allowDrop"
          :allow-drag="allowDrag"
          :expand-on-click-node="false"
          :default-expand-all="true"
          show-checkbox
        >
          <div class="scope" slot-scope="scope">
            <span class="tree-label">
              <!-- <svg class="icon" aria-hidden="true">
                  <use v-if="scope.data.LEVEL == 'GROUP'" xlink:href="#icon-wenjianjia"></use>
                  <use v-else-if="scope.data.EXT == 'pdf'" xlink:href="#icon-pdf"></use>
                  <use v-else-if="scope.data.EXT == 'txt'" xlink:href="#icon-txt"></use>
                  <use v-else-if="scope.data.EXT == 'docx'" xlink:href="#icon-docx"></use>
                  <use v-else-if="scope.data.EXT == 'xlsx'" xlink:href="#icon-xlsx"></use>
                  <use v-else xlink:href="#icon-wenjian"></use>
                </svg> -->
              {{ scope.data.label }}
              <span>
                <el-tooltip
                  class="item"
                  effect="dark"
                  content="缩放到图层"
                  placement="top"
                >
                  <i
                    class="el-icon-full-screen"
                    :class="'iconpading'"
                    @click="zoomToLayer(scope.data)"
                  ></i>
                </el-tooltip>
                <el-tooltip
                  class="item"
                  effect="dark"
                  content="图例开关"
                  placement="top"
                >
                  <i
                    class="el-icon-film"
                    :class="
                      scope.data.legendEnabled ? 'focusIcon' : 'iconpading'
                    "
                    @click="lengendSwitch(scope.data, this)"
                  ></i>
                </el-tooltip>
                <el-tooltip
                  class="item"
                  effect="dark"
                  content="删除已打开图层"
                  placement="top"
                >
                  <i
                    class="el-icon-delete"
                    :class="'iconpading'"
                    @click="layerDelete(scope.data)"
                  ></i>
                </el-tooltip>
              </span>
              <!-- <span v-if="scope.data.LEVEL == 'FILE'">.{{ scope.data.EXT }}</span> -->
            </span>
            <el-slider
              v-show="showSlider(scope)"
              v-model="scope.data.opacity"
              @change="changeOpacity(scope.data, scope.data.opacity)"
              @click.stop.native
            ></el-slider>
          </div>
        </el-tree>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapMutations, mapState } from "vuex";
import { getAllOpenSubLayers } from "@/utils/common-map-method.js";
import {
  layerLegendSwitch,
  Lenged,
  opacitylayer,
  opacitylayerById,
  closelayer,
  closelayerById,
  zoomToLayer,
  openlayer,
  rightOpenlayer,
  openlayerById,
} from "@/utils/arcgis_map";
import store from "@/store/index";

export default {
  name: "",
  props: { dialogVisible: Boolean },
  components: {},
  data() {
    return {
      comTitle: "已打开图层管理",
      treeData: [],
      defaultProps: {
        children: "sublayer",
        label: "label",
      }, //设置树形控件的属性名称
      layertree: null,
    };
  },
  computed: {
    ...mapState("onemap-store", [
      "openedLayerData",
      "mapview",
      "layerCheckedKeys",
      "closeId",
      "closeIdList",
    ]),
  },
  watch: {
    dialogVisible(foo) {
      console.log(foo, "---foo");
      this.$emit("change", foo);
      this.treeData = this.openedLayerData;
      if (foo) {
        for (let i = this.treeData.length - 1; i >= 0; i--) {
          if (this.treeData[i].isClick) {
            // 选中,查询sublayer是否有未选中的
            for (let j = this.treeData[i].sublayer.length - 1; j >= 0; j--) {
              if (!this.treeData[i].sublayer[j].isClick) {
                this.treeData[i].sublayer.splice(j, 1);
              }
            }
          } else {
            // 未选中，删除
            this.treeData.splice(i, 1);
          }
        }
      }
      this.$nextTick(() => {
        this.$refs.layertree.setCheckedNodes(this.treeData);
        // let layerCheckedKeys = this.$refs.layertree.getCheckedKeys();
        // store.commit('onemap-store/setLayerCheckedKeys', layerCheckedKeys);
      });
    },
    openedLayerData: {
      handler() {
        let that = this;
        console.log(this);
        this.$nextTick(() => {
          console.log(this);
          let idList = [];
          this.openedLayerData.forEach((item) => {
            debugger;
            if (item.sublayer.length > 0) {
              item.sublayer.forEach((layer) => {
                if (layer.isClick) {
                  idList.push(layer);
                }
              });
            } else {
              debugger;
              if (item.isClick) {
                idList.push(item);
              }
            }
            this.treeData.forEach((val, index) => {
              if (index == 0) {
                this.mapview.map.allLayers.items.forEach((item) => {
                  if (item.id == val.label) {
                    this.mapview.map.reorder(
                      item,
                      this.mapview.map.allLayers.items.length + 1
                    );
                  }
                });
              }
            });
          });
          debugger;
          if(this.dialogVisible){
             this.$refs.layertree.setCheckedNodes(idList);
          }
         

          // this.$refs.layertree.setCheckedNodes(this.treeData);
          // store.commit('onemap-store/setLayerCheckedKeys', layerCheckedKeys);
        });
      },
      deep: true,
    },
    layerCheckedKeys: {
      handler() {
        this.$nextTick(() => {
          this.$refs.layertree.setCheckedKeys(this.layerCheckedKeys);
        });
      },
      deep: true,
    },
  },
  created() {},
  mounted() {
    //   this.treeData = this.openedLayerData;
    // this.$nextTick(() => {
    //   this.$refs.layertree.setCheckedNodes(this.treeData);
    //   console.log(this.$refs.layertree, "this.$refs.layertree");
    //const nodes = this.$refs.layertree.store._getAllNodes()
    //console.log(nodes, "nodes");
    //this.$refs.layertree.setCheckedNodes(this.treeData);
    // console.log(this.treeData, "treedata");
    //  获取根节点
    // let rootNode = this.$refs.layertree.getNode(this.treeData[0].label);
    // travelNodes(rootNode);
    // function travelNodes(tmpRoot) {
    //   // 选中该节点
    //   tmpRoot.checked = true;
    //   // 叶子节点
    //   if (tmpRoot.childNodes.length === 0) {
    //     return;
    //   }
    //   // 不是叶子节点,递归遍历
    //   else {
    //     let tmpChildNoes = tmpRoot.childNodes;
    //     for (let i = 0; i < tmpChildNoes.length; i++) {
    //       travelNodes(tmpChildNoes[i]);
    //     }
    //   }
    // }
    //});
  },
  methods: {
    ...mapMutations("onemap-store", ["handleOnemapPopup", "handleToggleIndex"]),
    // 打开弹窗
    showDialog(obj) {
      //获取已叠加图层
      //this.treeData = getAllOpenSubLayers();
      obj.title = "已打开图层管理";

      //this.treeData = this.sortKey(this.treeData, "index");
      if (this.treeData.length > 0) {
        this.comTitle = obj.title;
        this.dialogVisible = true;
        this.handleToggleIndex(false);
      }
    },

    // 关闭弹窗
    closeDialog() {
      this.handleOnemapPopup({ code: "init" });
      this.handleToggleIndex(true);
      this.dialogVisible = false;
      //this.mapview.map.removeAll();

      //关闭已打开的图层
      for (let i = 0; i < this.treeData.length; i++) {
        const layeritem = this.treeData[i];
        let layer = this.mapview.map.findLayerById(layeritem.label);
        if (!layer) {
          layer.visible = false;
        }
      }
      this.$emit("resetChecked");
    },
    // 滑块展示判断
    showSlider(scope) {
      let nodeChecked = scope.node.checked;
      if (!nodeChecked) {
        scope.node.childNodes.map((childNode) => {
          if (childNode.checked) {
            nodeChecked = true;
          }
        });
      }
      return scope.data.level === "server" && nodeChecked;
    },
    handleDragStart(node, ev) {},
    handleDragEnter(draggingNode, dropNode, ev) {},
    handleDragLeave(draggingNode, dropNode, ev) {},
    handleDragOver(draggingNode, dropNode, ev) {},
    handleDragEnd(draggingNode, dropNode, dropType, ev) {
      //调整图层顺序
      if (dropType == "inner") {
        return false;
      }

      if (dropNode.level != 1) {
        return false;
      }
      //拖拽的图层
      let dragLayer = this.mapview.map.findLayerById(draggingNode.data.label);
      const dragindex = this.mapview.map.allLayers.items.findIndex(function (
        val
      ) {
        return val.id === draggingNode.data.label;
      });
      //目标图层
      let toLayer = this.mapview.map.findLayerById(dropNode.data.label);
      const toindex = this.mapview.map.allLayers.items.findIndex(function (
        val
      ) {
        return val.id === dropNode.data.label;
      });
      this.mapview.map.reorder(dragLayer, toindex);
      return false;
      //向前调整顺序
      if (dropType == "before") {
      }
      //向后调整顺序
      if (dropType == "after") {
      }
    },
    handleDrop(draggingNode, dropNode, dropType, ev) {},
    allowDrop(draggingNode, dropNode, type) {
      if (dropNode.level != 1) {
        return false;
      }
      if (type == "inner") {
        return false;
      }
      return true;
    },
    allowDrag(draggingNode) {
      if (draggingNode.level != 1) {
        this.$message.warning("子图层不可拖动");
        return false;
      }
      return true;
    },
    //排序
    sortKey(array, key) {
      return array.sort(function (a, b) {
        var x = a[key];
        var y = b[key];
        return x > y ? -1 : x < y ? 1 : 0;
      });
    },
    lengendSwitch(layerData) {
      layerData.legendEnabled = !layerData.legendEnabled;
      layerLegendSwitch(layerData);
      if (layerData.level == "server") {
        layerData.sublayer.forEach((son) => {
          son.legendEnabled = layerData.legendEnabled;
        });
      } else {
        const findIndex = this.treeData.findIndex(function (val) {
          return val.label === layerData.parent;
        });
        if (findIndex > -1) {
          let findStore = this.treeData[findIndex];
          let findLegendOpen = false;
          findStore.sublayer.forEach((son) => {
            if (son.legendEnabled) {
              findLegendOpen = true;
            }
          });
          this.treeData[findIndex].legendEnabled = findLegendOpen;
        }
      }
      store.commit("onemap-store/setAllOpenedLayerData", this.treeData);
    },
    zoomToLayer(layerData) {
      zoomToLayer(layerData);
    },
    currChange(layerData, nodestate) {
      debugger;
      store.commit("onemap-store/setLayerCheckedKeys", nodestate.checkedKeys);
      let isClick = nodestate.checkedKeys.findIndex(function (val) {
        return val === layerData.id;
      });
      if (isClick == -1) {
        if (layerData.level == "server") {
          debugger;
          var closeIdList = [];
          if (layerData.sublayer.length > 0) {
            layerData.sublayer.forEach((item) => {
              closeIdList.push(item.id);
            });
          } else {
            closeIdList.push(layerData.id);
          }
          store.commit("onemap-store/setCloseIdList", closeIdList);
          closelayer(layerData.label, false);
        } else {
          store.commit("onemap-store/setCloseId", layerData.id);
          closelayerById(layerData.parent, layerData.id, false);
        }
      } else {
        if (layerData.level == "server") {
          layerData.value = layerData.opacity;
          rightOpenlayer(layerData.label, layerData, nodestate.checkedKeys);
        } else {
          openlayerById(layerData.parent, layerData.id);
        }
      }
    },
    layerDelete(layerData) {
      console.log(layerData);

      if (layerData.level == "server") {
        if (layerData.sublayer.length > 0) {
          var closeIdList = [];
          layerData.sublayer.forEach((item) => {
            closeIdList.push(item.id);
          });
          // store.commit('onemap-store/setCloseIdList', closeIdList);
          // closelayer(layerData.label, true);
        } else {
          var closeIdList = [];
          closeIdList.push(layerData.id);
        }
        store.commit("onemap-store/setCloseIdList", closeIdList);
        closelayer(layerData.label, true);
      } else {
        store.commit("onemap-store/setCloseId", layerData.id);
        closelayerById(layerData.parent, layerData.id, true);
      }
      let layerCheckedKeys = store.state["onemap-store"].layerCheckedKeys;

      let findkeys = layerCheckedKeys.findIndex(function (val) {
        return val === layerData.id;
      });
      if (findkeys > -1) {
        layerCheckedKeys.splice(findkeys, 1);
      }
      store.commit("onemap-store/setLayerCheckedKeys", layerCheckedKeys);
    },
    changeOpacity(data, value) {
      console.log("changeOpacity", "changeOpacity");
      if (data.level == "server") {
        opacitylayer(data.label, value);
      } else {
        opacitylayerById(data.parent, value, data.sublayerid);
      }
    },
  },
};
</script>

<style scoped lang="scss">
@import "../style/onemap-sort.scss";
</style>
