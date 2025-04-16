<!--
 * @Author: xybx
 * @Date: 2023-05-10 10:58:15
 * @LastEditTime: 2023-05-11 17:37:23
 * @LastEditors: xybx
 * @Description: WEB OR VUE Page
 * Copyright (c) 2022 by xybx, All Rights Reserved.
-->
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
  <div class="shome animate__animated animate__backInDown">
    <el-container>
      <el-header class="animate__animated animate__fadeInDown animate__delay-1s">
        <el-row>
          <el-col :span="8"></el-col>
          <el-col :span="8">
            <h3 class="animate__animated animate__bounceInDown animate__delay-1s">空间治理场景应用</h3>
          </el-col>
          <el-col :span="8">
            <ul class="rlist">
              <li><el-button @click="goback">返回首页</el-button></li>
            </ul>
          </el-col>
        </el-row>
      </el-header>
      <el-main>
        <el-row>
          <el-col :span="24">
            <ul class="warplist">
              <li v-for="(item,index) in moudleData" :key="index">
                <div class="mouldhead animate__animated" :class="item.uclass">
                    <i class="iconfont" :class="item.icon"></i>
                    <span>{{item.title}}</span>
                </div>
                <div class="mouldbody animate__animated animate__delay-1s" :class="item.dclass">
                  <dl class="innerlist">
                    <dd v-for="(val,keys) in item.children" :key="keys" @click="navClick(val.url)">
                        <i class="iconfont icon-gjiantous"></i>
                        <span :class="val.url == '' ? 'dotbox' : ''">{{val.name}}</span>
                    </dd>
                  </dl>
                </div>
              </li>
            </ul>
            <i class="arrow animate__animated animate__shakeY animate__delay-3s animate__slower animate__infinite"></i>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </div>
</template>

<script>
export { default } from './js/shome'
</script>

<style lang="scss" scoped>
@import './style/shome.scss';
</style>