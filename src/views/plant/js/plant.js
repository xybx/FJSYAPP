/*
 * @Author: xybx
 * @Date: 2023-05-10 10:58:15
 * @LastEditTime: 2023-05-11 16:25:48
 * @LastEditors: xybx
 * @Description: WEB OR VUE Page
 * Copyright (c) 2022 by xybx, All Rights Reserved.
 */
/*
 * @ProjectName:fjsy-app
 * @Author:12390
 * @Date: 2023/3/14 15:19:09
 * @LastEditors: xybx
 * @LastEditTime: 2023-05-10 14:14:58
 * @Description: HTML Page of Javascript
 * Copyright (c) 2022 by xybx, All Rights Reserved. 
*/
import Videomap from '@/components/Video'
import esriId from '@arcgis/core/identity/IdentityManager';
export default {
  name: 'plant',
  data() {
    return {
      username: '',
      videoSrc: require('@/assets/plant/video.mp4'),
    }
  },
  components: {
    Videomap
  },
  computed: {
  },
  created() {

  },
  mounted() {
    this.getuser()
  },
  methods: {
    getuser() {
      this.username = JSON.parse(sessionStorage.getItem('appuser')).name
    },
    goback() {
      this.$router.push({
        path: "/shome",
      });
    },
    logout() {
      this.delCookie();
      sessionStorage.removeItem("apptoken");
      sessionStorage.removeItem("appuser");
      this.$router.push({
        path: "/login",
      });
    },
    endedClick() {
      this.$router.push({
        path: "/shome",
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
  }
}