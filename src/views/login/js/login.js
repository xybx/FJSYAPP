/*
 * @Author: CPL
 * @Date: 2022-10-20 10:47:36
 * @LastEditTime: 2022-12-22 16:03:05
 * @LastEditors: ssq
 * @Description:
 * @FilePath: \fjsy-app\src\views\login\js\login.js
 * Copyright (c) 2022 by hydp, All Rights Reserved.
 */

import { login } from "@/views/login/api/login";
import JSEncrypt from "jsencrypt";
export default {
  name: "login",
  props: {},
  components: {},
  data() {
    return {
      remember: false,
      form: {
        userName: "",
        password: "",
        type: "",
      },
      key: "-----BEGIN PUBLIC KEY-----" +
          "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlkvKOe+o21kdr4OvhPDN" +
          "dDT+UqRlWLE6xBSwaOxXWV1vYf6JTJsoYYifn43DcbBtaeQxPMWANqmZ3rot4Xkm" +
          "aj/8X8HT2QVXw8MITFiJ396c4CgLh5u4S5KBONQBcQ4XyX5Oe9S9G71da/QUeove" +
          "BllDHI8H10AbUFBPpKFsMI4tHwWXLEMFVWnqU9zizWzdnWzZXzZEqyLju8Qlhyf2" +
          "yz8GxiRFtkqPfK/oGsYDvm0M92y2LaZqZz+QtPvYajFo/QN0HFf+ixM62SGI93Pm" +
          "8Yn6X4TwG8EOfEKoOEqyrxBptoZYBE2tdWuVLgmfqC/4dlFrPKQycgyQ3wbSicXA" +
          "CQIDAQAB" +
          "-----END PUBLIC KEY-----",
    };
  },
  computed: {},
  created() {
    // document.title = "智慧规划平台登录页面";
    //记住密码
    let userName = localStorage.getItem("appuserName");
    let password = localStorage.getItem("apppassword");
    if (userName && password) {
      this.form.userName = localStorage.getItem("appuserName");
      this.form.password = localStorage.getItem("apppassword");
      this.remember = true; //这一步是回显后让勾选框为选中状态
    } else {
      this.form.userName = localStorage.removeItem("appuserName");
      this.form.password = localStorage.removeItem("apppassword");
      this.remember = false; //这一步是回显后让勾选框为未选中状态
    }
  },
  watch: {},
  methods: {
    keyDown (e) {
      // 回车则执行登录方法 enter键的ASCII是13
      if (e.keyCode === 13) {
        this.webLogin() // 需要执行的方法方法
      }
    },
    //登录提示
    async webLogin() {
      // this.$router.push({ path: '/index' })
      if (this.form.userName == null || this.form.userName == "") {
        this.$message.warning("账号不能为空");
        return;
      }
      if (this.form.password == null || this.form.password == "") {
        this.$message.warning("密码不能为空");
        return;
      }
      const encryptor = new JSEncrypt();
      encryptor.setPublicKey(this.key);
      // this.form.userName = encryptor.encrypt(this.form.userName);
      // this.form.password = encryptor.encrypt(this.form.password);

      let param = {
        userName: encryptor.encrypt(this.form.userName),
        password: encryptor.encrypt(this.form.password)
      }

      //登录
      const res = await login(param);
      // const res = await login(this.form);
      if (res.code == "500") {
        this.$message({
          type: "error",
          message: res.msg,
        });
      } else if (res.code == 200) {
        // 登录成功
        //记住密码
        this.rememberInfo();
        sessionStorage.setItem("apptoken", res.data.token);
        res.data.token = "";
        sessionStorage.setItem("appuser", JSON.stringify(res.data));
        this.$message({
          type: "success",
          message: "登录成功",
        });
        this.$router.push("/index");
      } else {
        this.$message({
          type: "error",
          message: "登录失败",
        });
      }
    },
    //记住密码
    rememberInfo() {
      //判断用户是否勾选记住密码，如果勾选，在本地储存中储存登录信息
      if (this.remember) {
        localStorage.setItem("appuserName", this.form.userName);
        localStorage.setItem("apppassword", this.form.password);
      } else {
        localStorage.removeItem("appuserName", this.form.userName);
        localStorage.removeItem("apppassword", this.form.password);
      }
    },
  },
  mounted() {
    window.addEventListener('keydown', this.keyDown);
   },
   // 销毁事件
  destroyed () {
    window.removeEventListener('keydown', this.keyDown, false)
  }
};
