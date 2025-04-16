<template>
  <div id="app" style="overflow: hidden">
    <router-view></router-view>
  </div>
</template>

<script>
import { heart } from '@/api/OnlineLog-api'
export default {
  name: "App",
  data() {
    return {
      worker: null
    }
  },
  created() {
    this.start();
    this.$mapToken()
  },
  beforeDestroy() {
    this.worker && this.worker.terminate();
  },
  methods: {
    loop(cb) {
      const worker = new Worker('worker.js');
      this.worker = worker;
      worker.postMessage({ time: 15000, message: 'heart' });
      worker.onmessage = function (event) {
        if (event.data === 'heart') {
          cb()
        }
      }
    },
    start() {
      this.loop(() => {
        setTimeout(() => {
          let onlineData = JSON.parse(sessionStorage.getItem(window.onlineKey));
          if (onlineData) {
            heart(onlineData);
          }
        }, 0)
      })
    }
  }
};
</script>

<style lang="scss">
html,
body,
#app {
  padding: 0;
  margin: 0;
  position: relative;
  height: 100%;
}

.esri-view .esri-view-surface--inset-outline:focus::after {
  outline: auto 0px Highlight !important;
  outline: auto 0px -webkit-focus-ring-color !important;
}

//数据底座模块右下角组件样式设置（图例、比例尺）
//图例
.esri-ui-corner .esri-expand .esri-widget--panel,
.esri-ui-corner .esri-expand .esri-widget--panel-height-only,
.esri-ui-corner .esri-component>.esri-widget--panel,
.esri-ui-corner .esri-component.esri-widget--panel {
  width: 100% !important;
}

.esri-ui-corner {
  flex-flow: column-reverse !important;
  // width: 35vw;
  max-width: 35vw !important;

  .esri-legend {


    >div {
      display: flex;

      .esri-legend__service {
        padding: 6px 8px !important;
        border-bottom: 1px solid rgba(110, 110, 110, 0.3);

        .esri-legend__layer {
          margin-left: 7px;

          .esri-legend__layer-table {
            margin-bottom: 0px !important;
          }
        }
      }
    }
  }

  //比例尺
  .esri-scale-bar {
    // background-color: white !important;
    margin-top: 1vh;

    // margin-left: 0 !important;
    // width: 18.45vw !important;
    .esri-scale-bar__bar-container--ruler {
      flex-direction: column-reverse !important;
      margin-right: 1vw !important;
    }

    .esri-scale-bar__label-container--ruler .esri-scale-bar__label {
      margin-right: -1vw;
    }

    .esri-scale-bar__ruler {
      height: 2.5px !important;
    }
  }
}</style>
