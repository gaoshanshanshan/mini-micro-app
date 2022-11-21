import { createApp } from "vue";
import App from "./App.vue";

window.globalStr = "child";

window.addEventListener("scroll", (e) => {
  console.log("child onScroll: ", e);
});

window.microApp?.addDataListener((data) => {
  console.log("接受数据：", data);
});

setTimeout(() => {
  window.microApp?.dispatch({ name: "来自子应用的数据" });
}, 3000);

createApp(App).mount("#app");
