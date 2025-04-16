<!--
 * @ProjectName:fjsy-app
 * @Author:12390
 * @Date: 2023/3/14
 * @LastEditors: 12390
 * @LastEditTime: 2023/3/14
 * @Description: VUE Single Page
 * Copyright (c) 2022 by xybx, All Rights Reserved. 
-->
<template>
  <div class="espace animate__animated animate__backInLeft">
    <el-container class="paint">
      <el-header class="animate__animated animate__backInDown animate__delay-1s">
        <el-row>
          <el-col :span="8"></el-col>
          <el-col :span="8">
            <h3 class="animate__animated animate__bounceInDown animate__delay-2s">福建省城市体检指标监测</h3>
          </el-col>
          <el-col :span="8">
            <ul class="rlist">
              <li><el-button @click="goback">返回上一级</el-button></li>
              <li><span>{{ username }}</span></li>
              <li><span @click="logout">退出</span></li>
            </ul>
          </el-col>
        </el-row>
      </el-header>
      <el-main>
        <el-row>
          <el-col :span="7">
            <ul class="leftList">
              <li v-for="(item, index) in allData.slice(0,2)" :key="index"  @mouseenter="overChartBox(item, false)" @mouseleave="overChartBox(item, true)">
                <div class="chart-header animate__animated animate__fadeInLeft animate__delay-2s">
                  <span class="iconfont">{{item.typeName}}</span>
                </div>
                <div class="chart-body animate__animated animate__lightSpeedInLeft animate__delay-3s">
                  <div class="bodytop">
                    <span class="iconfont">{{item.typeNameList[item.curPage - 1].typeName}}</span>
                  </div>
                  <div class="bodyend">
                    <Gchart ref="gchart" :chartid="item.chartid" @getoption="getoption" />
                  </div>
                </div>
              </li>
            </ul>
          </el-col>
          <el-col :span="10">
            <div class="centerbtn">
              <el-select v-model="years" placeholder="请选择年份" popper-class="tselbox" @change="yearChange">
                <el-option v-for="item in yearData" :key="item" :value="item" :label="`${item}年度`"></el-option>
              </el-select>
              <el-popover placement="bottom-start" trigger="hover" popper-class="zb-search-layer">
                <template #reference>
                  <el-button class="index-query-btn">指标查询</el-button>
                </template>
                <ul class="zb-list" v-if="targetData.length > 0">
                  <li v-for="(item,index) in targetData" :key="index" @click="handleTarget(item)" :class="item.typeName == currFirst ? 'focusFirst' : ''">- {{ item.typeName }} -</li>
                  <ul class="sub-zb-list">
                    <li v-for="(item, keys) in secondData" :key="keys" @click="handleSecTarget(item)" :class="item.typeName == currSecond ? 'focusFirst' : ''">
                      {{ item.typeName }}
                    </li>
                  </ul>
                </ul>
              </el-popover>
            </div>
            <div id="mapbox"></div>
          </el-col>
          <el-col :span="7">
            <ul class="rightList">
              <li v-for="(item, index) in allData.slice(2)" :key="index" @mouseenter="overChartBox(item, false)" @mouseleave="overChartBox(item, true)">
                <div class="chart-header animate__animated animate__fadeInRight animate__delay-2s">
                  <span class="iconfont">{{item.typeName}}</span>
                </div>
                <div class="chart-body animate__animated animate__lightSpeedInRight animate__delay-3s">
                  <div class="bodytop">
                    <span class="iconfont">{{item.typeNameList[item.curPage - 1].typeName}}</span>
                  </div>
                  <div class="bodyend">
                    <Gchart ref="gchart" :chartid="item.chartid" :xdata="item.xdata" :ydata="item.ydata" />
                  </div>
                </div>
              </li>
            </ul>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </div>
</template>

<script>
export { default } from './js/espace'
</script>

<style lang="scss" scoped>
@import './style/espace.scss';
</style>