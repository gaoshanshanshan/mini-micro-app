const rawAddEventListener = window.addEventListener;
const rawRemoveEventlistener = window.removeEventListener;

// 拦截microWindow的addEventListener和removeListener函数，将添加的事件记录到eventListener中，在应用卸载时将记录事件清空
function effect(microWindow) {
  const eventListenerMap = new Map();

  microWindow.addEventListener = function (type, listener, options) {
    const listenerList = eventListenerMap.get(type);
    if (listenerList) {
      listenerList.add(listener);
    } else {
      eventListenerMap.set(type, new Set([listener]));
    }
    return rawAddEventListener.call(window, type, listener, options);
  };

  microWindow.removeEventListener = function (type, listener, options) {
    const listenerList = eventListenerMap.get(type);
    if (listenerList?.size && listenerList.has(listener)) {
      listenerList.delete(listener);
    }
    rawRemoveEventlistener.call(window, type, listener, options);
  };
  
  return () => {
    console.log("卸载全局事件", eventListenerMap);
    if (eventListenerMap.size) {
      eventListenerMap.forEach((listenerList, type) => {
        for (const listener of listenerList) {
          rawRemoveEventlistener.call(window, type, listener);
        }
      });
      eventListenerMap.clear();
    }
  };
}

export default class SandBox {
  // 沙箱是否启用
  active = false;
  // window代理对象
  microWindow = {};
  // 注入到代理对象的key
  injectedKeys = new Set();

  constructor() {
    this.proxyWindow = new Proxy(this.microWindow, {
      get: (target, key) => {
        // 优先去缓存中的数据
        if (Reflect.has(target, key)) {
          return Reflect.get(target, key);
        }
        const rawValue = Reflect.get(window, key);
        // 修正函数的this为window
        if (typeof rawValue === "function") {
          const valueStr = rawValue.toString();
          if (
            !/^function\s+[A-Z]/.test(valueStr) &&
            !/^class\s+/.test(valueStr)
          ) {
            return rawValue.bind(window);
          }
        }
        return rawValue;
      },
      set: (target, key, value) => {
        // 沙箱及启用状态下才可以添加属性
        if (this.active) {
          // 将新添加的属性记录到缓存中
          this.injectedKeys.add(key);
          return Reflect.set(target, key, value);
        }
      },
      deleteProperty: (target, key) => {
        // 删除掉代理对象上的key
        if (target.hasOwnProperty(key)) {
          return Reflect.deleteProperty(target, key);
        }
        return true;
      },
    });
    this.releaseEffect = effect(this.microWindow);
  }
  start() {
    if (!this.active) {
      this.active = true;
    }
  }
  stop() {
    if (this.active) {
      this.active = false;
      this.injectedKeys.forEach((key) => {
        Reflect.deleteProperty(this.microWindow, key);
      });
      this.injectedKeys.clear();
      // 卸载掉全局事件
      this.releaseEffect();
    }
  }
  // 修改js作用域
  bindScope(code) {
    // 将代理window挂载到全局，通过with修改子应用的js的window为代理window
    if (this.active) {
      window.proxyWindow = this.proxyWindow;
      return `;(function(window){with(window){${code}}}).call(window.proxyWindow,window.proxyWindow,window,proxyWindow)`;
    } else {
      return code;
    }
  }
}
