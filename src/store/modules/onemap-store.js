const state = {
    onemapPopup: null, // 一张图弹窗code
    toggleIndex: false, // 顶部菜单激活状态 true:取消,false:默认
    userGraphicLayer: null, // 用户临时图层
    zttScale: null, // 专题图比例
    isScaleStatus: false, // 专题图比例同步开关
    //MapGeometryServerUrl: "", //地图图形计算服务地址
    ishow: false,//历史画像弹窗显示
    logData: {},//历史画像弹窗数据
    // 属性查询
    attrData:{},
    btnclass: 1,//一张图功能组件显示控制
    mapview: null, // 二维地图
    map: null,
    mapconfig: null, // 底图配置
    curBaseMap: null, // 当前底图
    setmap:null, //专题制图 底图
    showSplit: false, // 分屏
    splitScreen: false,
    //测量图层
    graphicLengthLrc: null,
    // 点符号
    pointSymbol: {
        type: "picture-marker",
        url: require("@/assets/onemap/point.gif"),
        width: "50px",
        height: "50px",
    },
    //用户自定义渲染
    symbol: {
        type: "simple-fill",
        color: [255, 255, 0, 0.8],
        style: "solid",
        outline: {
            color: "red",
            width: 2,
        },
    },
    attrdata: null,//属性数据源
    //属性窗口状态
    attrdialogstatus: false,
    number: 0,//一张图模块 底图传值
    linesymbol: {
        type: "simple-line",
        color: "red",
        width: 2,
        style: "solid",
      },
       //冲突图形符号-线
  intersectsLineSymbol: {
    type: "simple-line",
    color: "yellow",
    width: 1,
    style: "solid",
  },
  //冲突图形符号-面
  intersectsSymbol: {
    type: "simple-fill",
    color: [255, 255, 0, 0.2],
    style: "solid",
    outline: {
      color: "red",
      width: 1,
    },
  },
  setloadlayers:{},
  openedLayerData:[],
  layerCheckedKeys:[],
  closeId: -1,
  closeIdList: []

};
const getters = {
    splitScreen: (state) => state.splitScreen
};
const mutations = {
    //设置地图高亮符号
    setSymbol(state) {
        if (symbolStyle == 2) {
            state.symbol = state.linesymbol;
            state.intersectsSymbol = state.intersectsLineSymbol;
        }
    },
    //配置地图基础配置参数
    mapconfig(state, mapconfig) {
        state.mapconfig = mapconfig;
    },
    //当前底图设置
    setCurBaseMap(state, curBaseMap) {
        state.curBaseMap = curBaseMap;
    },
    //专题制图 设置底图
    setmapconfig(state, setmap) {
        state.setmap = setmap;
    },
    handleOnemapPopup(state, code) {
        state.onemapPopup = code;
    },

    handleToggleIndex(state, boo) {
        state.toggleIndex = boo;
    },
    // 用户临时图层
    handleUserGraphicLayer(state, userLayer) {
        state.userGraphicLayer = userLayer;
    },
    // 专题图比例
    handleZttScale(state, zttScale) {
        state.zttScale = zttScale;
    },
    // 是否开始专题图比例同步
    handleShowZttScale(state, boo) {
        state.isScaleStatus = boo;
    },
    setishow(state, is) {
        state.ishow = is.boolean;
        state.logData = is
    },
    setAttrData(state, is) {
        state.attrData = is
    },
    setBtn(state, istrue) {
        if (!istrue) {
            state.btnclass = -1;

        }
    },
    switchBtn(state,index) {
        state.btnclass = index;
    },
    //二维地图view对象
    mapview(state, mapview) {
        state.mapview = mapview;
    },
    //二位地图map对象
    map(state, map) {
        state.map = map;
    },
    graphicLength(state, graphicLengthLrc) {
        state.graphicLengthLrc = graphicLengthLrc;
    },
    // 分屏
    handleSplit(state, showSplit) {
        state.showSplit = showSplit;
    },
    setSplitScreen(state, split) {
        state.splitScreen = split
    },
    //属性查询表格数据源
    attrTableData(state, attrdata) {
        state.attrdata = attrdata;
    },
    attrdialogstatus(state, attrdialogstatus) {
        state.attrdialogstatus = attrdialogstatus;
    },
    getmapnumber(state, number) {
        state.number = number;
    },//调整主页底图
    setloadlayers(state,setloadlayers){
        state.setloadlayers=setloadlayers;
    },
    setOpenedLayerData(state,openedLayerData){
        state.openedLayerData.unshift(openedLayerData);
    },
    setAllOpenedLayerData(state,openedLayerData){
        state.openedLayerData=(openedLayerData);
    },
    setLayerCheckedKeys(state,layerCheckedKeys){
        state.layerCheckedKeys=layerCheckedKeys;
    },
    setCloseId(state,closeId){
        state.closeId=1;
        state.closeId=closeId;
    },
    setCloseIdList(state,closeIdList){
        state.closeIdList=[];
        state.closeIdList=closeIdList;
    },
};
const actions = {};

export default { state, getters, mutations, actions };
