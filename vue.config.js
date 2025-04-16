/*
 * @Author: ssq
 * @Date: 2022-10-18 15:41:11
 * @LastEditors: error: git config user.name && git config user.email & please set dead value or install git
 * @LastEditTime: 2022-11-25 11:48:52
 * @FilePath: \fjsy-app\vue.config.js
 * @Description: 
 * 
 * Copyright (c) 2022 by hydp, All Rights Reserved. 
 */
const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  publicPath: './',
  transpileDependencies: true, 
  runtimeCompiler: true,
  productionSourceMap: false,
})
