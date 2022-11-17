import { loadHtml } from "./source";

export const appInstanceMap = new Map();

export default class CreateApp {
  constructor({ name, url, container }) {
    this.name = name;
    this.url = url;
    this.container = container;
    this.status = "loading";
    loadHtml(this);
  }
  // 组件状态：created/loading/mount/unmount
  status = "created";
  // 存放应用的静态资源
  source = {
    links: new Map(),
    scripts: new Map(),
    html: null,
  };
  // 资源加载完成时触发
  onLoad(htmlDom) {
    this.loadCount = this.loadCount ? this.loadCount + 1 : 1;
    // 加载完css和加载完script后，执行app的mount
    if (this.loadCount === 2 && this.status !== "unmount") {
      this.source.html = htmlDom;
      this.mount();
    }
  }
  // 挂载应用
  mount() {
    const cloneHtml = this.source.html.cloneNode(true);
    const fragment = document.createDocumentFragment();
    Array.from(cloneHtml.childNodes).forEach((child) => {
      fragment.appendChild(child);
    });

    this.container.appendChild(fragment);

    this.source.scripts.forEach((info) => {
      (0, eval)(info.code);
    });

    this.status = "mounted";
  }
  // 卸载应用
  unmount(destory) {
    this.status = "unmount";
    this.container = null;
    if (destory) {
      appInstanceMap.delete(this.name);
    }
  }
}
