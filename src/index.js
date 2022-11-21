import { defineElement } from "./element";
import { EventCenterForBaseApp } from "./data";

const BaseAppData = new EventCenterForBaseApp();

// 拦截原生的setAttribute，如果是修改的是子应用data属性，则通过事件中心向子应用发送数据
const rawSetAttribute = Element.prototype.setAttribute;
Element.prototype.setAttribute = function (key, value) {
  if (/^micro-app/i.test(this.tagName) && key === "data") {
    if (value.toString() === "[object Object]") {
      const cloneObj = {};
      Object.getOwnPropertyNames(value).forEach((propertyKey) => {
        if (
          !(typeof propertyKey === "string" && propertyKey.indexOf("__") === 0)
        ) {
          cloneObj[propertyKey] = value[propertyKey];
        }
      });
      BaseAppData.setData(this.getAttribute("name"), cloneObj);
    }
  } else {
    rawSetAttribute.call(this, key, value);
  }
};

const SimpleMicroApp = {
  start() {
    defineElement();
  },
};

export default SimpleMicroApp;
