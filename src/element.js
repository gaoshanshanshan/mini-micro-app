import CreateApp, { appInstanceMap } from "./app";

class MicroAppElement extends HTMLElement {
  // 自定义元素需要观测的属性，这些属性的变化会触发attributeChangeCallback函数
  static get observedAttributes() {
    return ["name", "url"];
  }
  // 元素插入到document时执行
  connectedCallback() {
    console.log("micro-app-element is connected");
    // 创建微应用实例
    const app = new CreateApp({
      name: this.name,
      url: this.url,
      container: this,
    });
    appInstanceMap.set(this.name, app);
  }
  // 元素从document卸载时执行
  disconnectedCallback() {
    console.log("micro-app-element has  disconnected");
    // 获取元素对应的app实例，调用实例的unmount方法
    const app = appInstanceMap.get(this.name);
    app.unmount(this.hasAttribute("destory"));
  }
  // 观测的属性变化时执行
  attributeChangedCallback(attrName, oldVal, newVal) {
    console.log(`attribute ${attrName}: ${newVal}`);
    // 分别记录name及url的值
    if (attrName === "name" && !this.name && newVal) {
      this.name = newVal;
    } else if (attrName === "url" && !this.url && newVal) {
      this.url = newVal;
    }
  }
}

export function defineElement() {
  if (!window.customElements.get("micro-app")) {
    window.customElements.define("micro-app", MicroAppElement);
  }
}
