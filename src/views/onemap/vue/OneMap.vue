<template>
    <el-container>
        <el-header>
            <div class="header">
                <img
                    class="logo"
                    src="../../../assets/onemap/原版院标.jpg"
                    alt=""
                    srcset=""
                />
                <div class="tit">行业数据底座</div>
                <div class="right">
                    <div
                        class="btn"
                        v-for="(item, index) in navdata"
                        :key="index"
                    >
                        <span
                            @click="addspan(index)"
                            :class="{
                                clickAfter: btnClass == index && btnClass != 5,
                            }"
                            ><i :class="item.class"></i>{{ item.label }}</span
                        >
                    </div>
                </div>
                <div class="admin">
                    <div class="reindex" @click="returnIndex">返回首页</div>
                    <i></i>{{ username }}
                    <!-- <span class="triangle"></span> -->
                    <!-- <div class="logout" @click="out">退出登陆</div> -->
                    <div class="logout" @click="out">退出</div>
                </div>
            </div>
        </el-header>
        <el-container class="main">
            <i class="open" @click="openSlide" v-show="showOpen"></i>
            <el-aside width="15vw" v-show="showif">
                <span class="input">
                    <i class="slide" @click="closeSlide"></i>
                    <el-input
                        placeholder="请输入搜索内容"
                        v-model="input"
                        size="mini"
                        clearable
                    >
                        <i
                            slot="suffix"
                            class="el-input__icon el-icon-search"
                        ></i>
                    </el-input>
                </span>
                <!-- <span class="tuceng" @click="changeTuCeng">
          <span class="tuceng-button"><i class="el-icon-sort"></i>图层顺序调整</span>
        </span> -->
                <layer-tree
                    class="layer-tree"
                    :data="treedata"
                    show-checkbox
                    node-key="id"
                    :props="defaultProps"
                    ref="tree"
                    :default-expanded-keys="expandedkeys"
                    :default-checked-keys="checkedkeys"
                    @check-change="changeSlider"
                    @check="currChange"
                    :highlight-current="true"
                    icon-class="el-icon-caret-right"
                    @node-drag-start="handleDragStart"
                    @node-drag-end="handleDragEnd"
                    :render-after-expand="false"
                    :filter-node-method="filterNode"
                    lazy
                    :load="nodeClick"
                    draggable
                >
                    <!-- <span slot-scope="scope" class="controlslider">
            <span class="coin"><i ></i>{{ scope.node.label }} </span>
            <el-slider v-show="scope.data.level === 'server' && scope.data.isShow" v-model="opacityValue"
              @change="changeOpacity(scope.data, opacityValue)" @click.stop.native></el-slider>
          </span> -->
                    <span slot-scope="scope">
                        <span class="label-style">
                            {{ scope.node.label }}
                            <span
                                v-if="
                                    scope.data.childlist &&
                                    scope.data.childlist != 0 &&
                                    scope.data.level != 'server'
                                "
                                class="label-list-style"
                            >
                                ({{ scope.data.childlist.length }})
                            </span>
                            <!-- <i class="el-icon-full-screen" v-show="showZoomIco(scope)" @click="zoomToLayer(scope.data)"></i> -->
                        </span>
                        <!-- <el-switch
                  v-show="
                  (scope.data.level === 'server' &&
                   scope.node.checked) ||
                  (scope.data.level === 'server' &&
                  scope.node.indeterminate)"
                  v-model="scope.data.isShow"
                  @click.stop.native
                  ref="switchRef"
                  >
                  </el-switch> -->
                        <!-- 2023年4月25日 透明度调整，放到图层管理中。 -->
                        <!-- <el-slider v-show="showSlider(scope)" v-model="scope.data.value"
              @change="changeOpacity(scope.data, scope.data.value)" @click.stop.native></el-slider> -->
                    </span>
                </layer-tree>
            </el-aside>
            <el-main>
                <ArcGISMap
                    :btnClass="btnClass"
                    @setSplitNumber="setSplitNumber"
                    @setBtnClass="setBtnClass"
                    :leftMap="splitMap_Left_Data"
                    :rightMap="splitMap_Right_Data"
                    :lefttopMap="splitMap_lefttop_Data"
                    :leftbottomMap="splitMap_leftbottom_Data"
                    :righttopMap="splitMap_righttop_Data"
                    :rightbottomMap="splitMap_rightbottom_Data"
                />
                <mapcontrol ref="mapcon" :treedata="treedata" />
                <mapswitch />
                <search
                    ref="locate"
                    v-if="btnClass == 0"
                    :btnClass="btnClass"
                    @setBtnClass="setBtnClass"
                />
                <ztzt
                    v-if="btnClass == 3"
                    :btnClass="btnClass"
                    @setBtnClass="setBtnClass"
                />
                <djtz
                    v-if="btnClass == 2"
                    :btnClass="btnClass"
                    @setBtnClass="setBtnClass"
                />
                <!-- <hxxz v-if="btnClass == 5" :btnClass="btnClass" @setBtnClass="setBtnClass" /> -->
                <tjcx
                    v-if="btnClass == 1"
                    :btnClass="btnClass"
                    @setBtnClass="setBtnClass"
                />
            </el-main>
        </el-container>
    </el-container>
</template>
<script>
import ArcGISMap from "@/components/ArcGISMap";
import mapcontrol from "@/views/onemap/vue/mapcontrol";
import mapswitch from "@/views/onemap/vue/mapswitch";
import { getMenuList } from "@/api/arcgis-api.js";
import search from "@/views/onemap/vue/search";
import { mapMutations, mapState, mapGetters } from "vuex";
import ztzt from "@/views/onemap/vue/ztzt.vue";
import djtz from "@/views/onemap/vue/djtz.vue";
import hxxz from "@/views/onemap/vue/hxxz.vue";
import tjcx from "@/views/onemap/vue/tjcx.vue";
import LayerTree from "@/plugins/layer-tree/src/tree.vue";

import {
    closelayer,
    closelayerById,
    opacitylayer,
    openlayer,
    openlayerById,
    popIdentifylayer,
    pushIdentifylayer,
    loadlayers,
    changeLayerIndex,
    zoomToLayer,
} from "@/utils/arcgis_map";
import { getServer } from "@/views/onemap/api/onemapAPi";
// import Sortable from 'sortablejs'
import store from "@/store/index";

export default {
    name: "onemap",
    data() {
        return {
            input: "",
            treedata: [],
            defaultProps: {
                children: "childlist",
                label: "label",
                isLeaf: "leaf",
                disabled: "disabled"
            }, //设置树形控件的属性名称
            navdata: [
                {
                    label: "查询定位",
                    class: "icon-1",
                },
                {
                    label: "条件查询",
                    class: "icon-6",
                },
                {
                    label: "叠加图纸",
                    class: "icon-3",
                },
                {
                    label: "专题制图",
                    class: "icon-2",
                },
                {
                    label: "分屏对比",
                    class: "icon-5",
                },
                {
                    label: "数据下载",
                    class: "icon-4",
                },
            ],
            showif: true,
            showOpen: false,
            btnClass: -1,
            opacityValue: 100,
            expandedkeys: window.layerConfig,
            checkedkeys: [window.layerExpand],
            splitMap_Left_Data: null, //二分屏地图左侧地图数据
            splitMap_Right_Data: null, //二分屏地图右侧地图数据
            splitMap_lefttop_Data: null, //四分屏地图左上
            splitMap_leftbottom_Data: null, //四分屏地图左下
            splitMap_righttop_Data: null, //四分屏地图右上
            splitMap_rightbottom_Data: null, //四分屏地图右下
            username: "",
            splitNumber: -1, //分屏类型判断器
            tableData: [], //拖拽图层数据
            oldList: [],
            newList: [],
            tableConfig: {
                tableItems: [
                    {
                        label: "图层名称",
                        prop: "name",
                    },
                ],
            }, //拖拽图层表格头
            sublayerParentName: "", //拖拽图层的子图层父级名称
        };
    },
    components: {
        ArcGISMap,
        mapcontrol,
        mapswitch,
        search,
        ztzt,
        djtz,
        hxxz,
        tjcx,
        LayerTree,
    },
    created() {
        this.username = JSON.parse(sessionStorage.getItem("appuser")).name;
        // let token = 'eyJhbGciOiJIUzUxMiJ9.eyJjcmVhdGVkIjoxNjc3ODEyNzI3MzkzLCJ1c2VyUGlkIjoiMTk5OCIsImpzb25PYmplY3QiOiJ7XCJkZXBhck5hbWVcIjpcIuezu-e7n-euoeeQhuWRmFwiLFwiZGVwYXJ0aWRcIjoyOCxcImxheWVyUnVsZUlkc1wiOlwiMTUsMTYsMjcsMTcsMTgsMjhcIixcIm5hbWVcIjpcIjEyM1wiLFwib2ZmaWNlTmFtZVwiOlwi57O757uf566h55CG5ZGYXCIsXCJvZmZpY2VpZFwiOjYzLFwicGlkXCI6XCIxOTk4XCIsXCJwb3dlcnNcIjpcIjEwMDEsMTAwMiwzLDksMTAsMTEsMTIsMTMsMTQsMTUsMTYsNCwxNywyLDYsNyw4LDUsMTgsMjEsMjJcIixcIndlYm9wZW5pZFwiOlwiXCJ9IiwiZXhwIjoxNjc4MTcyNzI3fQ.N1zeRg3RIT1GWw6mHk14emUIb0TrxFTUogDt4L7oNbEY-Kg0_TWI5G3I-yDHgex2zvu6_wvfBNQIiXY_WOKUTg';
        // window.open('http://192.168.1.148:5173/?token='+token);
        // this.$mapToken()
    },
    mounted() {
        this.getLayerTree();
        this.oldList = JSON.parse(JSON.stringify(this.tableConfig.tableItems));
        this.newList = JSON.parse(JSON.stringify(this.tableConfig.tableItems));

        if (window.layerConfig.length > 0) {
            setTimeout(() => {
                let node = this.$refs.tree.getNode(window.layerExpand);
                node.expand();
                node.childNodes.forEach((each) => {
                    this.$refs.tree.setChecked(each, true);
                });
                openlayer(node.data.label, node.data);
                if (node.data.identify == 0) {
                    pushIdentifylayer(node.data.label);
                }
            }, 1000);
        }
    },
    computed: {
        ...mapState("onemap-store", [
            "btnclass",
            "showSplit",
            "layerCheckedKeys",
            "closeId",
            "closeIdList",
        ]),
        ...mapGetters({
            splitScreen: "onemap-store/splitScreen",
        }),
    },
    watch: {
        btnClass(val) {
            if (val == 5) {
                this.$message.error("功能正在开发中");
            }
        },
        // 图层搜索监听
        input(val) {
            this.$refs.tree.filter(val);
        },
        closeIdList: {
            handler() {
                if (this.closeIdList.length > 0) {
                    debugger;
                    this.closeIdList.forEach((closeId) => {
                        if ((closeId + "").includes("-")) {
                            let idList = closeId.split("-");
                            let node = this.$refs.tree.getNode(closeId);
                            this.$refs.tree.setChecked(node, false);
                            let findLayerData =
                                store.state["onemap-store"].openedLayerData;
                            const findIndex = findLayerData.findIndex(function (
                                val
                            ) {
                                return val.id == idList[0];
                            });
                            if (findIndex > -1) {
                                let serverLayer = findLayerData[findIndex];
                                if (serverLayer.sublayer.length > 0) {
                                    serverLayer.sublayer.forEach((item) => {
                                        if (item.id === closeId) {
                                            item.isClick = false;
                                        }
                                    });
                                }
                                serverLayer.isClick = false;
                                findLayerData.splice(findIndex, 1, serverLayer);
                                store.commit(
                                    "onemap-store/setAllOpenedLayerData",
                                    findLayerData
                                );
                            }
                        } else {
                            debugger;
                            let node = this.$refs.tree.getNode(closeId);
                            this.$refs.tree.setChecked(node, false);
                            // 切片服务关闭
                            let findLayerData =
                                store.state["onemap-store"].openedLayerData;
                            const findIndex = findLayerData.findIndex(function (
                                val
                            ) {
                                return val.id == closeId;
                            });
                            if (findIndex > -1) {
                                let serverLayer = findLayerData[findIndex];

                                serverLayer.isClick = false;
                                findLayerData.splice(findIndex, 1, serverLayer);
                                store.commit(
                                    "onemap-store/setAllOpenedLayerData",
                                    findLayerData
                                );
                            }
                        }
                    });
                }
            },
            deep: true,
        },
        closeId: {
            handler() {
                let idList = this.closeId.split("-");
                let node = this.$refs.tree.getNode(this.closeId);
                this.$refs.tree.setChecked(node, false);
                let findLayerData = store.state["onemap-store"].openedLayerData;
                const findIndex = findLayerData.findIndex(function (val) {
                    return val.id == idList[0];
                });
                if (findIndex > -1) {
                    let serverLayer = findLayerData[findIndex];
                    if (serverLayer.sublayer.length > 0) {
                        let flag = false;
                        serverLayer.sublayer.forEach((item) => {
                            if (item.id == this.closeId) {
                                flag = true;
                                item.isClick = !item.isClick;
                            }
                        });
                        if (flag) {
                            findLayerData.splice(findIndex, 1, serverLayer);
                            store.commit(
                                "onemap-store/setAllOpenedLayerData",
                                findLayerData
                            );
                        }
                    }
                }
            },
            deep: true,
        },
        layerCheckedKeys: {
            handler() {
                this.$nextTick(() => {
                    this.layerCheckedKeys.forEach((id) => {
                        let node = this.$refs.tree.getNode(id);
                        // this.$refs.tree.setChecked(node, !node.checked);
                        // console.log(node);
                        this.$refs.tree.setChecked(node, !node.isShow);
                    });
                    // this.$refs.tree.setCheckedKeys(this.layerCheckedKeys);
                });
            },
            deep: true,
        },
    },
    methods: {
        //图层更换按钮事件
        // changeTuCeng() {
        //   let app = this;
        //   if (this.tuceng == true) {
        //     this.tuceng = false;
        //   } else if (this.tuceng == false) {
        //     this.tuceng = true;
        //     this.$refs.mapsort.showDialog({
        //     title: "调整图层顺序"
        //   });
        //   }

        // },
        // 图层树过滤事件
        filterNode(value, data, node) {
            if (!value) return true;
            let level = node.level;
            let _array = [];
            this.getReturnNode(data, _array, value);
            let result = false;
            _array.forEach((item) => {
                result = result || item;
            });
            if (result) {
                this.expandedkeys.push(data.id);
            }
            return result;
        },
        getReturnNode(data, _array, value) {
            console.log(data, _array, value);
            let isPass = data.label && data.label.indexOf(value) !== -1;
            isPass ? _array.push(isPass) : "";
            this.index++;
            // if (data.level == "layer") {
            //   console.log(1);
            // } else {
            if (data.childlist?.length > 0) {
                data.childlist.forEach((element) => {
                    let _elementArray = [];
                    this.getReturnNode(element, _elementArray, value);
                    let result = false;
                    _elementArray.forEach((item) => {
                        result = result || item;
                        _array.push(item);
                    });
                    if (result) {
                        this.expandedkeys.push(element.id);
                    }
                });
                // }
            }
            // if (!isPass && node.level != 1 && node.parent) {
            //   debugger
            //   this.getReturnNode(node.parent, _array, value);
            // }
        },
        // 滑块展示判断
        showSlider(scope) {
            if (scope.data.childlist) {
                var arr = scope.node.childNodes.find((item) => {
                    return item.checked == true;
                });
            }
            return (
                (scope.data.level === "server" &&
                    scope.data.isShow &&
                    Boolean(arr)) ||
                (scope.data.level === "server" &&
                    scope.data.isShow &&
                    scope.node.checked == true) ||
                (scope.data.level === "server" && scope.node.indeterminate)
            );
        },
        //缩放到图层图标
        showZoomIco(scope) {
            if (scope.data.childlist) {
                var arr = scope.node.childNodes.find((item) => {
                    return item.checked == true;
                });
            }
            return (
                (scope.data.level === "server" &&
                    scope.data.isShow &&
                    Boolean(arr)) ||
                (scope.data.level === "server" &&
                    scope.data.isShow &&
                    scope.node.checked == true) ||
                (scope.data.level === "server" && scope.node.indeterminate) ||
                (scope.data.level === "layer" &&
                    scope.data.isShow &&
                    scope.node.checked == true)
            );
        },
        // 递归添加数组
        async addNode(childList) {
            if (
                childList == undefined ||
                childList == null ||
                childList == "" ||
                childList.length == 0
            ) {
                return;
            }
            if (childList.length > 0) {
                childList.forEach((item) => {
                    if (item.level == "server") {
                        // 判断是否已经存在数据了
                        if (item.childlist.length <= 0) {
                            // 不存在图层数据，调用接口创建图层数据
                            if (!item.disabled) {
                              item.childlist = this.getLayerUrl(item);
                            }
                        }
                    } else if (item.level == "group") {
                        this.addNode(item.childlist);
                    }
                });
            }
        },
        // 节点展开事件 添加服务的子图层
        nodeClick(node, resolve) {
            let obj = node.data;
            if (node.id == 0) {
                return;
            }
            // console.log(obj.childlist, obj.childlist.length, obj);
            if (obj.childlist?.length > 0) {
                return resolve(obj.childlist);
            }
            if (obj.kind == 5) {
                return resolve([]);
            }
            if (obj.level == "layer") {
                return resolve([]);
            }
            if (obj.level == "server") {
                if (obj.url == null && obj.kind == 5) {
                    setTimeout(() => {
                        return resolve([]);
                    }, 100);
                } else {
                    if (obj.childlist.length <= 0) {
                        // 不存在图层数据，调用接口创建图层数据
                        if (!obj.disabled) {
                          this.getLayerUrl(obj);
                        }
                    }
                }
            }
            if (obj.childlist == undefined || obj.childlist.length < 0) {
                return resolve([]);
            }

            this.addNode(obj.childlist);
            return resolve(obj.childlist);
        },
        getLayerUrl(obj) {
            return getServer(obj.url).then((res) => {
                if (res == null) {
                    return;
                }
                if (res.data.tileInfo != null) {
                    return;
                }
                if (res.data.layers == null) {
                    this.$message.warning("该图层服务地址不存在！");
                    return;
                }
                if (res.data.layers.length > 0) {
                    let childlist = [];
                    for (let i = 0; i < res.data.layers.length; i++) {
                        const sonlayer = res.data.layers[i];
                        var child = {
                            id: obj.id + "-" + sonlayer.id,
                            label: sonlayer.name,
                            isShow: false,
                            value: 100,
                            level: "layer",
                            parent: obj.label,
                            isLeaf: true,
                            url: obj.url,
                            visiable: obj.visiable,
                            leaf: true,
                            kind: obj.kind,
                        };
                        childlist.push(child);
                    }
                    obj.childlist = childlist;
                }
                return;
            });
        },
        // 获取地图服务地址 拿到服务的所有子图层
        async getServerUrl(obj, resolve) {
            const { data: res } = await getServer(obj.url);
            if (res == null) {
                setTimeout(() => {
                    return resolve([]);
                }, 200);
            }
            if (res.tileInfo != null) {
                // this.$message.warning('切片图层无法控制子图层');
                return resolve([]);
            }
            if (res.layers == null) {
                console.log("当前图层 -> ", res);
                this.$message.warning("该图层服务地址不存在！");
                setTimeout(() => {
                    return resolve([]);
                }, 200);
            }
            if (res.layers.length > 0) {
                for (let i = 0; i < res.layers.length; i++) {
                    const sonlayer = res.layers[i];

                    var child = {
                        id: obj.id + "-" + sonlayer.id,
                        label: sonlayer.name,
                        isShow: false,
                        value: 100,
                        level: "layer",
                        parent: obj.label,
                        isLeaf: true,
                        url: obj.url,
                        visiable: obj.visiable,
                        leaf: true,
                        kind: obj.kind,
                    };
                    if (this.layerCheckedKeys.indexOf(child.id) > -1) {
                        // 代表存在
                        child.isShow = true;
                    }
                    obj.childlist.push(child);
                }
                setTimeout(() => {
                    return resolve(obj.childlist);
                }, 200);
            } else {
                setTimeout(() => {
                    return resolve([]);
                }, 200);
            }
        },
        ...mapMutations("onemap-store", [
            "setBtn",
            "switchBtn",
            "handleSplit",
            "setloadlayers",
        ]),
        // 拖拽开始
        handleDragStart(node, event) {
            console.dir(document.getElementById("leftMap"));
        },
        // 拖拽结束
        handleDragEnd(node, endNode, position, event) {
            let app = this;
            // if (!this.splitScreen) return
            if (app.splitNumber == 2) {
                let bodyHeight = document.body.clientHeight;
                let mapOneTop =
                    document.getElementsByClassName("el-header")[0]
                        .clientHeight;
                let mapOneLeft = 0;
                let mapTwoLeft = document.getElementById("leftMap").clientWidth;
                let mapRight = document.body.clientWidth;
                // 左侧
                if (
                    event.clientY > mapOneTop &&
                    event.clientY < bodyHeight &&
                    event.clientX > mapOneLeft &&
                    event.clientX < mapTwoLeft
                ) {
                    if (
                        node.data.level == "group" ||
                        node.data.level == "layer"
                    ) {
                        app.$message.warning("该层级拖拽无效，请拖拽地图服务");
                    } else {
                        app.splitMap_Left_Data = node;
                    }
                } else if (
                    event.clientY > mapOneTop &&
                    event.clientY < bodyHeight &&
                    event.clientX > mapTwoLeft &&
                    event.clientX < mapRight
                ) {
                    if (
                        node.data.level == "group" ||
                        node.data.level == "layer"
                    ) {
                        app.$message.warning("该层级拖拽无效，请拖拽地图服务");
                    } else {
                        app.splitMap_Right_Data = node;
                    }
                }
            } else if (app.splitNumber == 4) {
                let mapOneLeft = 0;
                let maptop_top =
                    document.getElementsByClassName("el-header")[0]
                        .clientHeight;
                let maptop_right =
                    document.getElementById("leftTopMap").clientWidth;
                let maptop_bottom =
                    document.getElementsByClassName("el-header")[0]
                        .clientHeight +
                    document.getElementById("leftTopMap").clientHeight;
                let bodyHeight = document.body.clientHeight;
                let maptop_right_right = document.body.clientWidth;
                if (
                    event.clientY > maptop_top &&
                    event.clientY < maptop_bottom &&
                    event.clientX > mapOneLeft &&
                    event.clientX < maptop_right
                ) {
                    //判断四分屏中的左上
                    if (
                        node.data.level == "group" ||
                        node.data.level == "layer"
                    ) {
                        app.$message.warning("该层级拖拽无效，请拖拽地图服务");
                    } else {
                        app.splitMap_lefttop_Data = node;
                    }
                } else if (
                    event.clientY > maptop_bottom &&
                    event.clientY < bodyHeight &&
                    event.clientX > mapOneLeft &&
                    event.clientX < maptop_right
                ) {
                    //判断四分屏中的左下
                    if (
                        node.data.level == "group" ||
                        node.data.level == "layer"
                    ) {
                        app.$message.warning("该层级拖拽无效，请拖拽地图服务");
                    } else {
                        app.splitMap_leftbottom_Data = node;
                    }
                } else if (
                    event.clientY > maptop_top &&
                    event.clientY < maptop_bottom &&
                    event.clientX > mapOneLeft &&
                    event.clientX < maptop_right_right
                ) {
                    //判断四分屏中的右上
                    if (
                        node.data.level == "group" ||
                        node.data.level == "layer"
                    ) {
                        app.$message.warning("该层级拖拽无效，请拖拽地图服务");
                    } else {
                        app.splitMap_righttop_Data = node;
                    }
                } else if (
                    event.clientY > maptop_bottom &&
                    event.clientY < bodyHeight &&
                    event.clientX > mapOneLeft &&
                    event.clientX < maptop_right_right
                ) {
                    //判断四分屏中的右下
                    if (
                        node.data.level == "group" ||
                        node.data.level == "layer"
                    ) {
                        app.$message.warning("该层级拖拽无效，请拖拽地图服务");
                    } else {
                        app.splitMap_rightbottom_Data = node;
                    }
                }
            }
        },
        changeSlider(obj, state) {
            obj.isShow = state;
        },
        currChangeLayer(obj, isShow) {
            if (obj.level === "group") {
                let childlist = obj.childlist;
                for (var i = 0; i < childlist.length; i++) {
                    let objchild = obj.childlist[i];
                    this.currChangeLayer(objchild, isShow);
                }
            } else if (obj.level === "server") {
                if (isShow) {
                    openlayer(
                        obj.label,
                        obj,
                        this.$refs.tree
                            .getCheckedKeys()
                            .concat(this.$refs.tree.getHalfCheckedKeys())
                    );
                    if (obj.identify == 0) {
                        pushIdentifylayer(obj.label);
                    }
                } else {
                    closelayer(obj.label, true);
                    popIdentifylayer(obj.label);
                }
            } else {
                var name = obj.parent;
                var id = obj.id;
                if (isShow) {
                    openlayerById(name, id, obj);
                    //this.sublayerParentName.push(name);
                } else {
                    closelayerById(name, id, true);
                    // this.sublayerParentName.splice(name);
                }
            }
        },
        currChange(obj, nodestate) {
            this.addNode(obj.childlist);
            this.currChangeLayer(obj, obj.isShow);

            // this.$nextTick(() => {
            //     var node = this.$refs.tree.getNode(obj.id);
            //     this.expandNode(node);
            // })
            //
            // console.log("点击事件");

            setTimeout(() => {
                var node = this.$refs.tree.getNode(obj.id);
                this.expandNode(node);
            }, 500);
        },
        expandNode(node) {
            const self = this;
            node.expand(function () {
                for (let i = 0; i < node.childNodes.length; i++) {
                    node.childNodes[i].expand();
                    self.expandNode(node.childNodes[i]);
                }
            });
        },
        addspan(index) {
            this.btnClass = index;
            this.switchBtn(1);
        },
        closeSlide() {
            this.showif = !this.showif;
            this.showOpen = !this.showOpen;
        }, //关闭图层树侧边栏
        openSlide() {
            this.showif = !this.showif;
            this.showOpen = !this.showOpen;
        }, //展开图层树侧边栏
        async getLayerTree() {
            let { data } = await getMenuList({
                datasource: 0,
            });
            this.treedata = data.menus;
            this.setloadlayers(this.treedata);
        },
        // log(scope) {
        //   console.log(scope.data.isShow);
        // },
        changeOpacity(data, value) {
            opacitylayer(data.label, value);
        },
        setBtnClass(val) {
            this.btnClass = val;
        },
        setSplitNumber(val) {
            this.splitNumber = val;
        }, //设置图层拖拽的判断类型
        returnIndex() {
            this.$router.push({
                path: "/index",
            });
        }, //返回首页
        out() {
            sessionStorage.removeItem("apptoken");
            sessionStorage.removeItem("appuser");
            this.$router.push({
                path: "/login",
            });
        }, //退出
    },
};
</script>
<style lang="scss" scoped>
@import "../style/onemap.scss";
</style>
