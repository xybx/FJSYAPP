<template>
  <el-container class="paint">
    <el-header>
      <el-row :gutter="10">
        <el-col :span="8"></el-col>
        <el-col :span="8">
          <div class="title">福建省城乡规划设计研究院项目业绩画像</div>
        </el-col>
        <el-col :span="8">
          <ul class="rlist">
            <li><el-button v-if="showAuth" @click="totalClick">项目检索</el-button></li>
            <li><el-button @click="goback">返回首页</el-button></li>
            <li><span>{{ username }}</span></li>
            <li><span @click="logout">退出</span></li>
          </ul>
        </el-col>
      </el-row>
    </el-header>
    <el-main>
      <component :is="compontName" :ref="compontName" :showbtn="showAuth" @closeMenu="closeMenu"></component>
    </el-main>
  </el-container>
</template>

<script>
import { getPower } from "./api/paint";
let componArr = []
let components = require.context("./components/", true, /\w+.vue$/)
let comObj = {};
components.keys().forEach(fileName => {
  var names = fileName.split("/").pop().replace(/.\w+$/, "");
  componArr.push(names)
  const comp = components(fileName);
  comObj[names] = comp.default || comp;
})
export default {
  name: "paint",
  data() {
    return {
      showAuth:null,
      username: "",
      compontName:'',
    };
  },
  components: comObj,
  created() {
  },
  mounted() {
    let token = sessionStorage.getItem("apptoken");
    if (token == null || token == "") {
      this.$router.push({
        path: "/login",
      });
      return;
    }
    this.getAuthority()
    this.getuser()
  },
  methods: {
    async getAuthority() {
      let res = await getPower();
      this.showAuth = res.data
      await this.getShowCompoents()
    },
    getShowCompoents(){
      if(this.showAuth){
        this.compontName = componArr[1]
      }else {
        this.compontName = componArr[0]
        this.$nextTick(()=>{
          let dynamicComponent = this.$refs[this.compontName]
          dynamicComponent.showDialog()
        })
      }
    },
    closeMenu(){
      this.$nextTick(()=>{
        this.compontName = componArr[1]
      })
    },
    getuser() {
      this.username = JSON.parse(sessionStorage.getItem("appuser")).name;
    },
    totalClick() {
      this.compontName = componArr[0]
      this.$nextTick(()=>{
        let dynamicComponent = this.$refs[this.compontName]
        dynamicComponent.showDialog()
      })
    },
    goback() {
      this.$router.push({
        path: "/index",
      });
    },
    delCookie() {
      var cookies = document.cookie.split(";");
      for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie =
          name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      }
      if (cookies.length > 0) {
        for (var i = 0; i < cookies.length; i++) {
          var cookie = cookies[i];
          var eqPos = cookie.indexOf("=");
          var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
          var domain = location.host.substr(location.host.indexOf("."));
          document.cookie =
            name +
            "=;expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=" +
            domain;
        }
      }
    },
    logout() {
      sessionStorage.removeItem("apptoken");
      sessionStorage.removeItem("appuser");
      this.delCookie();
      this.$router.push({
        path: "/login",
      });
    },
  }
}
</script>
<style lang="scss">
@import "./style/paint.scss";
</style>
