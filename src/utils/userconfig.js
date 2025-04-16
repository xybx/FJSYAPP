//定义公共函数和变量
var userconfig = {
    LevelInfo:{},
    toolname:{
      large:false,
      small:false,
      length:false,
      area:false,
      attr:false,
      grid:false,
      deletegrid:false,
      query:false
    },
    option: {
      // url:
      //   window.location.protocol + '//' + window.location.host + '/acrg4.15/init.js',
      url:'/arcgis_js_api/library/4.15/init.js',
      css:'/arcgis_js_api/library/4.15/esri/css/main.css',
      // css:
      //   window.location.protocol +
      //   '//' +
      //   window.location.host +
      //   '/acrg4.15/esri/themes/light/main.css',
    },
  
    imgurl:'@/assets/Marker.png',
  
    view : null,//用户地图
    zt_view :null, //用户专题地图
    sketch : null,
    sketch_area:null,
    lengedLayerlist:[],
    treemenulayers:[],
    basemap:null, //基础地图
    cityService :null,//用户范围权限限定服务
    layersData : null,//所有的图层组和图层数据
    MapMaskLayer : null,//地图掩膜
    usergeometry : null,//用户权限内地图范围
    MapGeometryService :null, //通用计算服务地址
    attributelayerlist :[],  //可查询的属性图层
    MapPrintService :null, //地图打印服务
  
    userGraphicLayer :null,  //用户临时图层
  
  //叠加分析变量
    overgraphic :null,
    overurl :null,
    overfield :null,
  
  //合规审查的图层
    hgscgraphic :null,
    hgscGraphicLayer :null,
    userhgscGraphicsLayer :null, //用户存放上传图形的图层
    hgscResultGraphicLayer :null,//临时存放合规审查的结果图斑
  
    //分屏地图
    spliteViewOne :null,
    spliteViewTwo :null,
    spliteViewThree :null,
    spliteViewFour :null,
    spliteViewFive :null,
  
    //分屏地图的状态
    view_0 :false,
    view_1 :false,
    view_2 :false,
    view_3 :false,
    view_4 :false,
    view_5 :false,
    wlserviceurl:""
  
  };
  
  export default userconfig