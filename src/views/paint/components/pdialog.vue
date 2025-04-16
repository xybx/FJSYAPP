<template>
  <div class="pdialog">
      <div class="phead">
        <i v-if="showbtn" class="iconfont icon-guanbi" @click="closeMenu()"></i>
      </div>
      <div class="pbody">
        <el-form :inline="true" ref="queryForm" :model="queryForm" label-width="208px" @submit.native.prevent>
          <el-form-item v-for="(item, index) in queryForm.domains" :key="index" :label="item.fieldDesc">
            <div class="twoinput" v-if="item.controlType == 'text'">
              <el-select v-model="queryForm.domains[index]['searchType']" popper-class="fselbox" :placeholder="`请选择`" clearable>
                <el-option label="等于" :value="1"></el-option>
                <template v-if="item.fieldType == 'number'">
                  <el-option label="小于" :value="2"></el-option>
                  <el-option label="大于" :value="3"></el-option>
                  <el-option label="范围" :value="4"></el-option>
                </template>
                <el-option v-if="item.fieldType != 'number'" label="模糊" :value="5"></el-option>
              </el-select>
              <el-input v-if="queryForm.domains[index]['searchType'] != 4" v-model="queryForm.domains[index][`value`]" class="sinput" placeholder="请输入值" clearable />
              <template v-if="queryForm.domains[index]['searchType'] == 4">
                <el-input v-model="queryForm.domains[index][`value1`]" :placeholder="`请输入`" class="dinput" clearable />
                <span>-</span>
                <el-input v-model="queryForm.domains[index][`value2`]" :placeholder="`请输入`" class="dinput" clearable />
              </template>
            </div>
            <el-select v-if="item.controlType == 'list'" v-model="queryForm.domains[index][`value`]" popper-class="fselbox" :placeholder="`请选择${item.fieldDesc}`" clearable>
              <el-option v-for="(val, keys) in item.searchOptionsList" :key="keys" :label="val.name" :value="val.value"></el-option>
            </el-select>
            <el-date-picker v-if="item.controlType == 'date'" type="daterange" :unlink-panels="true" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" popper-class="fselbox" v-model="queryForm.domains[index][`value`]" value-format="yyyy-MM-dd" clearable />
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-search" type="primary" size="small" @click="queryClick">搜索</el-button>
            <el-button type="primary" size="small" @click="resetClick">清空筛选</el-button>
          </el-form-item>
        </el-form>
        <div class="tablebox">
          <el-table v-loading="tabloading" :data="tableData" class="custable" border tooltip-effect="dark" :max-height="tableMaxHeight" v-mousewheel="onMousewheel" :element-loading-text="loadingText" element-loading-background="rgba(255, 255, 255, 1)">
            <el-table-column type="index" label="序号" :index="indexAdd" align="center" width="60px"></el-table-column>
            <el-table-column v-for="item in tableColumns" :key="item.prop" align="center" show-overflow-tooltip :label="item.label">
              <template #default="{ row, $index }">{{ row[item.prop] ? row[item.prop] : ''}}</template>
            </el-table-column>
          </el-table>
        </div>
        <el-pagination background :current-page="pageNo" :page-size="pageSize" :page-sizes="pageSizes" :layout="layout" :total="total" @current-change="CurrentChange"></el-pagination>
      </div>
  </div>

</template>
<script>
import {getConditions, getFieldList, getQueryList} from "@/views/paint/api/paint";
export default {
  name: "pdialog",
  data(){
    return {
      tableColumns:[],
      tableData:[],
      tabloading:true,
      loadingText: "正在加载...",
      layout: "total, prev, pager, next",
      total: 0,
      pageNo: 1,
      pageSize: 0,
      pageSizes: [10, 15, 20],
      queryForm:{
        domains:[{
          controlType: '',
          displayName: '',
          fieldName: '',
          fieldType: '',
          searchOptionsList: [],
          searchType: 0,
          value: '',
          value1: '',
          value2: ''
        }]
      },
      cateData:[],
    }
  },
  props:['showbtn'],
  computed:{
    tableMaxHeight() {
      return window.innerHeight - 255
    }
  },
  created() {
    this.pageSize = this.pageSizes[0]
  },
  mounted() {
  },
  methods:{
    onMousewheel(e){
      let delta = e.deltaY;
      console.log(delta)
      if (delta < 0 && this.pageNo !== Math.ceil(this.total/this.pageSize)) {
        // 当向下滚动且不是最后一页时，切换到下一页
        this.changePage('next');
      } else if (delta > 0 && this.pageNo !== 1) {
        // 当向上滚动且不是第一页时，切换到前一页
        this.changePage('prev');
      }
    },
    changePage(direction){
      if(direction == 'next'){
        this.pageNo+=1
      }else {
        this.pageNo-=1
      }
      this.getListData()
    },
    async showDialog(){
      await this.getQueryCondition()
      await this.getTableFields()
    },
    async getTableFields(){
      let res = await getFieldList()
      this.tableColumns = res.data.length > 0 ? res.data.filter(item => item.fieldName != 'ID').map(val => {
        return {
          prop: val.fieldName,
          label: val.fieldDesc,
        }
      }) : []
      await this.getListData()
    },
    indexAdd(index){
      return (this.pageNo - 1) * this.pageSize + index + 1
    },
    async getQueryCondition(){
      let res = await getConditions()
      this.queryForm.domains = res.data
    },
    async getListData(){
      let params = { page: this.pageNo, pageSize: this.pageSize }
      let searchArr = this.queryForm.domains.filter(item => item.value).map(val => {
        return {
          controlType: val.controlType,
          dateValue: val.controlType == 'date' ? val.value.length > 0 ? val.value : [] : [],
          fieldName: val.fieldName,
          fieldType: val.fieldType,
          intValue: val.fieldType == 'number' ? val.searchType && val.searchType == 4 ? [Number(val?.value1), Number(val?.value2)] : val.value ? [Number(val.value)] : [] : [],
          searchType: val.controlType == 'date' ? 4 : val.searchType ? val.searchType : 1,
          stringValue: val.fieldType == 'string' && val.controlType != 'date' ? val.value ? [val.value] : [] : []
        }
      })
      Object.assign(params, searchArr.length > 0 ? { searchConditionList: searchArr } : {})
      let res = await getQueryList(params)
      if(res.code == 200){
        this.tableData = res.data.records
        this.total = res.data.total
      }else {
        this.tableData = []
        this.total = 0
      }
      setTimeout(() => {
        this.tabloading = false;
      }, 1000)
    },
    async resetClick(){
      this.queryForm = this.$options.data().queryForm
      await this.getQueryCondition()
      await this.getListData()
    },
    closeMenu(){
      this.$emit('closeMenu')
    },
    async queryClick(){
      this.pageNo = 1
      await this.getListData()
    },
    CurrentChange(val){
      this.pageNo = val
      this.getListData()
    },
  }
}
</script>
<style scoped lang="scss">
@import '../style/pdialog.scss';
</style>