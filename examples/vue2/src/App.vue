<template>
  <div id="app1">
    <div class="left">
      <img alt="Vue logo" src="./assets/logo.png" />
      <h2>vue2 应用</h2>
      <h3 class="text-color">主应用字体颜色</h3>
      <button @click="toogleDisplay">
        {{ showChildApp ? "隐藏" : "显示" }}子应用
      </button>
    </div>
    <div class="rigth">
      <micro-app v-if="showChildApp" name="vue3" url="http://localhost:8081" />
    </div>
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      showChildApp: true,
    };
  },
  methods: {
    toogleDisplay() {
      this.showChildApp = !this.showChildApp;
    },
  },
};
</script>

<style>
#app1 {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  display: flex;
  height: 120vh;
}
.left,
.right {
  width: 50%;
}
.text-color {
  color: red;
}
</style>
