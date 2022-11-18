import { createApp } from "vue";
import App from "./App.vue";

window.globalStr = "child";
window.addEventListener("scroll", (e) => {
  console.log("child onScroll: ", e);
});
createApp(App).mount("#app");
