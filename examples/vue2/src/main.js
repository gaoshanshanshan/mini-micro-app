import Vue from "vue";
import App from "./App.vue";
import SimpleMicroApp from "simple-micro-app";

Vue.config.productionTip = false;
SimpleMicroApp.start();

new Vue({
  render: (h) => h(App),
}).$mount("#app");
