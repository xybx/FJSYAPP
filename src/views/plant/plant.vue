<!--
 * @Author: xybx
 * @Date: 2023-05-10 10:58:15
 * @LastEditTime: 2023-05-16 13:44:32
 * @LastEditors: xybx
 * @Description: WEB OR VUE Page
 * Copyright (c) 2022 by xybx, All Rights Reserved.
-->
<template>
  <div class="plant animate__animated animate__backInDown">
    <el-container>
      <el-header class="animate__animated animate__fadeInDown animate__delay-1s">
        <el-row>
          <el-col :span="8"></el-col>
          <el-col :span="8">
            <h3 class="animate__animated animate__bounceInDown animate__delay-2s">数字孪生城市1.0</h3>
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
          <Videomap :videoSrc="videoSrc" :controls="false" 
          :loop="false" :muted="false" preload="auto" 
          :showPlay="false" :playWidth="96" zoom="fill" @endedClick="endedClick"></Videomap>
      </el-main>
    </el-container>
  </div>
</template>  
<script>
export { default } from "./js/plant";
</script>  
<style lang="scss" scoped>
@import "./style/plant.scss";
</style>    