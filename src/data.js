import { appInstanceMap } from "./app";
// 事件中心
class EventCenter {
  eventList = new Map();
  // 添加事件监听
  on(name, f) {
    let eventInfo = this.eventList.get(name);
    if (!eventInfo) {
      eventInfo = {
        data: {},
        callbacks: new Set(),
      };
      this.eventList.set(name, eventInfo);
    }
    eventInfo.callbacks.add(f);
  }
  // 停止事件监听
  off(name, f) {
    const eventInfo = this.eventList.get(name);
    if (eventInfo && typeof f === "function") {
      eventInfo.delete(f);
    }
  }
  // 触发事件
  dispatch(name, data) {
    const eventInfo = this.eventList.get(name);
    if (eventInfo && data !== eventInfo.data) {
      eventInfo.data = data;
      eventInfo.callbacks.forEach((callback) => {
        callback(data);
      });
    }
  }
}
const eventCenter = new EventCenter();
function formatEventName(appName, fromBaseApp) {
  if (!appName || typeof appName !== "string") return "";
  return fromBaseApp
    ? `__from_base_app_${appName}__`
    : `__from_micro_app_${appName}__`;
}

// 主应用事件处理
export class EventCenterForBaseApp {
  // 向子应用发送数据
  setData(appName, data) {
    eventCenter.dispatch(formatEventName(appName, true), data);
  }
  // 清空某个子应用的事件监听
  clearDataListener(appName) {
    eventCenter.off(formatEventName(appName, true));
  }
}

// 子应用事件处理
export class EventCenterForMicroApp {
  constructor(appName) {
    this.appName = appName;
  }
  // 添加对主应用的事件监听
  addDataListener(f) {
    eventCenter.on(formatEventName(this.appName, true), f);
  }
  // 移除对主应用的事件监听
  removeDataListener(f) {
    if (typeof f === "function") {
      eventCenter.off(formatEventName(this.appName, true), f);
    }
  }
  // 清空所有监听的事件
  clearDataListener() {
    eventCenter.off(formatEventName(this.appName, true));
  }
  // 通过dom的自定义事件向主应用发送数据
  dispatch(data) {
    const app = appInstanceMap.get(this.appName);
    if (app?.container) {
      const event = new CustomEvent("datachange", {
        detail: {
          data,
        },
      });
      app.container.dispatchEvent(event);
    }
  }
}
