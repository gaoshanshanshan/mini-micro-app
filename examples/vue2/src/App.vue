<template>
  <div id="app">
    <div class="left">
      <img alt="Vue logo" src="./assets/logo.png" />
      <h2>vue3 应用</h2>
    </div>
    <div class="rigth">
      <micro-app name="vue3" url="http://localhost:8081" />
    </div>
  </div>
</template>

<script>
export default {
  name: "App",
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  display: flex;
}
.left,
.right {
  width: 50%;
}
</style>
