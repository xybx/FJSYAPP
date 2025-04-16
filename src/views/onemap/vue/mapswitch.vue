<template>
    <div class="mapswitch">
        <div class="mapcontent">
            <div
                @click="mapswitch(sltShow, 1)"
                :class="{ click: sltShow == true }"
            >
                <i class="sl"></i>矢量图
            </div>
            <div
                @click="mapswitch(yxtShow, 2)"
                :class="{ click: yxtShow == true }"
            >
                <i class="yx"></i>影像图
            </div>
        </div>
        <ul
            v-show="yxtItemShow"
            class="itemlist"
            :class="yxtData.length < 2 ? 'wlist' : ''"
        >
            <span>
                <u>{{ title }}</u>
                <i class="el-icon-close" @click="closeClick"></i>
            </span>
            <li
                v-for="(item, index) in yxtData"
                :class="{
                    // click:
                    //     (mapnumber == -1 && item.defaultchoose == true) ||
                    //     mapnumber == item.PID,
                    click:
                        (item.defaultchoose &&
                            item.MODULETYPE.includes('矢量图')) ||
                        (item.MODULETYPE.includes('影像图') &&
                            mapnumber == item.PID &&
                            item.defaultchoose),
                }"
                :key="item.PID"
                @click="mapitem(item)"
            >
                <el-image :src="imageSrc" fit="fill" />
                {{ item.MODULENAME }}
            </li>
        </ul>
    </div>
</template>
<script>
import { toggleBasemap, loadBaseMapLayer, closeYxt } from "@/utils/arcgis_map";
import { mapMutations, mapState } from "vuex";
import { getMapConfigList } from "@/api/arcgis-api";
export default {
    data() {
        return {
            mapnumber: -1,
            sltShow: false,
            yxtShow: false,
            yxtItemShow: false, //影像图切换列表显示控制
            yxtData: [],
            title: "",
            imageSrc: require("@/assets/onemap/slt.png"),
            sltList: [], // 矢量图列表
            yxtList: [], // 影像图列表
        };
    },
    mounted() {
        this.title = "矢量图分类";
        // this.getList(1);
        this.getAllBase(1);
    },
    methods: {
        ...mapMutations("onemap-store", ["getmapnumber"]),
        async getList(n) {
            let res = await getMapConfigList({
                modulename: n == 1 ? "矢量图" : "影像图",
            });
            this.yxtData = res.data.length > 0 ? res.data.flat() : [];
        },
        mapswitch(isShow, n) {
            this.yxtItemShow = true;
            if (n == 1) {
                this.sltShow = !this.sltShow;
                this.yxtShow = false;
                this.title = "矢量图底图";
                this.imageSrc = require("@/assets/onemap/slt.png");
                if (!this.sltShow) {
                    this.yxtItemShow = false;
                }
                this.yxtData = this.sltList;
            } else {
                this.yxtShow = !this.yxtShow;
                this.sltShow = false;
                this.title = "影像图底图";
                this.imageSrc = require("@/assets/onemap/yxt.png");
                if (!this.yxtShow) {
                    this.yxtItemShow = false;
                }
                this.yxtData = this.yxtList;
            }
            // if (isShow == true) {
            //     this.mapnumber = 1;
            //     this.getmapnumber(this.mapnumber);//底图切换传值
            // } else {
            //     this.mapnumber = 0;
            //     this.getmapnumber(this.mapnumber);
            // }
            // this.getList(n);
        },
        closeClick() {
            this.yxtItemShow = false;
            this.yxtShow = false;
            this.sltShow = false;
        },
        mapitem(item) {
            // toggleBasemap();
            console.log(item, "item");
            // let showItem = false;
            // if (this.mapnumber == item.PID) {
            //     this.mapnumber = 0;
            // } else {
            // this.mapnumber = item.PID;
            //     showItem = true;
            // }
            // toggleBasemap(item, showItem);
            // Object.assign(item, {
            //     defaultchoose: !item.defaultchoose,
            // });
            item.defaultchoose = !item.defaultchoose;
            if (item.MODULETYPE.includes("影像图")) {
                this.sltList.map((sltItem) => {
                    sltItem.defaultchoose = false;
                });
                if (item.defaultchoose) {
                    this.yxtList.map((yxtItem) => {
                        if (yxtItem.PID != item.PID) {
                            yxtItem.defaultchoose = false;
                        } else {
                            yxtItem.defaultchoose = item.defaultchoose;
                        }
                    });
                }
            } 
            else if (item.MODULETYPE.includes("矢量图")) {
                this.yxtList.map((yxtItem) => {
                    debugger
                    yxtItem.defaultchoose = false;
                    closeYxt(this.yxtList);
                });
            }
            this.mapnumber = item.PID;
            toggleBasemap(item, item.defaultchoose);
        },
        getSrcUrl() {
            if (this.yxtShow) {
                return require("@/assets/onemap/yxt.png");
            }
            if (this.sltShow) {
                return require("@/assets/onemap/slt.png");
            }
        },
        // 获取各个底图列表
        async getAllBase(n) {
            let sltRes = await getMapConfigList({
                modulename: "矢量图",
            });
            this.sltList = sltRes.data.length > 0 ? sltRes.data.flat() : [];
            let yxtRes = await getMapConfigList({
                modulename: "影像图",
            });
            this.yxtList = yxtRes.data.length > 0 ? yxtRes.data.flat() : [];
            n == 1
                ? (this.yxtData = this.sltList)
                : (this.yxtData = this.yxtList);
        },
    },
};
</script>
<style lang="scss" scoped>
.mapswitch {
    .mapcontent {
        position: absolute;
        top: 15vh;
        right: 2vw;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-evenly;
        background: white;
        padding: 9px;
        div {
            display: flex;
            flex-direction: column;
            margin-bottom: 5px;

            // height: 45%;
            i {
                width: 48px;
                height: 38px;
            }
        }

        div:hover {
            cursor: pointer;
        }
        .sl {
            background-image: url("@/assets/onemap/slt.png");
        }

        .yx {
            background-image: url("@/assets/onemap/yxt.png");
        }

        .click {
            // border: #204B85 2px solid;
            color: #f90404;
        }
    }
    .itemlist {
        margin: 0;
        padding: 8px;
        background-color: #fff;
        position: absolute;
        top: 15vh;
        right: 6vw;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        flex-wrap: wrap;
        width: 12%;
        &.wlist {
            width: 7%;
            li {
                width: 100%;
            }
        }
        span {
            width: 100%;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            u {
                text-decoration: none;
                font-size: 15px;
                color: #409eff;
            }
            i {
                position: absolute;
                right: 12px;
            }
        }
        .click {
            // border: #204B85 2px solid;
            border-color: red;
            color: red;
        }
        li {
            width: 40%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            cursor: pointer;
            margin-top: 10px;
            border: 2px solid;
            padding: 4px;
            .el-tag {
                width: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                font-size: 14px;
            }
        }
    }
}
</style>
