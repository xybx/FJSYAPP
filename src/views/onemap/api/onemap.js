import request from '@/utils/request';

// 查询定位服务列表接口
export const getQuery = (params) => {
    return request({
        method: 'GET',
        url: '/api/OneMap/GetQueryLocation',
        params,
    });
};

// 获取计算服务配置
export const getMapGeometryService = (params) => {
    return request({
        method: 'GET',
        url: '/api/MapConfig/GetUserGeometryService',
        params,
    });
};

  //记录图层异常日志
  export const writeMapServerLog = (params) => {
    return request({
        method: 'GET',
        url: '/api/Log/writeMapServerLog',
        params,
    });
  };
  //获取计算服务地址 专题制图用
export const getMapGeometryServiceUrl = async () => {
    let MapGeometryServerUrl="";
    // let user = {
    //   // uid: window.sessionStorage.getItem("userid"),
    //   uid:603
    // };
    const  data = await getMapGeometryService();
    if (data.code === 200) {
      MapGeometryServerUrl = data.data.MAPGEOMETRYSERVICEURL;
    }
    return MapGeometryServerUrl;
  };
  //保存地图打印的图片 专题制图用
export const savePrintBitImage = (data) => {
    return request({
        method: 'POST',
        url: '/api/Upload/SavePrintBitImage',
        data,
    });
  };


// 红线下载用 解析DWG文件接口
export const getHXDownLoadLayers = (params) => {
    return request({
        method: 'GET',
        url: '/api/HXDownload/getHXDownLoadLayers',
        params,
    });
};

//生成红线cad
export const getHXCAD = (params) => {
    return request({
        method: 'GET',
        url: '/api/HXDownload/ExportHXCAD',
        params,
    });
};
// 获取标签页接口
export const getConditionTypeList = (params) => {
  return request({
      method: 'GET',
      url: '/api/Condition/GetConditionTypeList',
      params,
  });
};

// 获取条件查询图层列表接口
export const getConditionLayerList = (params) => {
  return request({
      method: 'GET',
      url: '/api/Condition/GetConditionLayerList',
      params,
  });
};

// 获取条件查询表单字段列表接口
export const getConditionFieldList = (params) => {
  return request({
      method: 'GET',
      url: '/api/Condition/GetConditionFieldList',
      params,
  });
};

// 获取条件查询表单下拉列表接口
export const getConditionFieldValueList = (params) => {
  return request({
      method: 'GET',
      url: '/api/Condition/GetConditionFieldValueList',
      params,
  });
};


// 获取条件查询每个类型对应的查询结果展示字段列表
export const getConditionTabResultFields = (params) => {
  return request({
      method: 'GET',
      url: '/api/Condition/GetConditionTabResultFields',
      params,
  });
};

//叠加图纸上传文件解析接口
export const readFile = (params) =>{
  return request({
    method:"POST",
    url:'/fjsy/File/handleFile',
    data:params,
  })
}