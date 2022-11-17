## mini-micro-app

微前端框架[micro-app](https://github.com/micro-zoe/micro-app)简单实现，参考 [simple-micro-app](https://github.com/bailicangdu/simple-micro-app)，用来了解微前端的实现原理

### 核心原理
micro-app借鉴了webComponent的思想，以组件化的方式加载子应用。以html作为资源入口，通过加载远程html，解析dom结构获取js、css静态资源来渲染微前端应用。微应用与主应用是运行在同一个window下，就要考虑主应用与子应用的样式隔离、js作用域的隔离、数据通信等问题。

#### 渲染子应用
mini-micro-app的核心功能基于webComponent的CustomElement进行构建。CustomElement用于创建自定义标签，并提供了渲染、卸载、属性变化等钩子。通过钩子就可以知道微应用的渲染时机。自定义标签同时也是一个容器，微应用的元素和样式的作用域都在容器中，形成了封闭的环境。
通过监听自定义标签micro-app的生命周期函数connectedCallback得知标签被渲染，加载子应用的html，并转换为dom结构。递归的提取dom中的script和link标签，并远程加载标签对应的静态资源内容，然后插入到dom中。最后通过自定义标签的appChild将dom插入到document中，完成子应用的渲染。
#### js 沙箱
#### css 隔离
#### 数据通信

### 项目结构
``` 
    ├── examples
    │   ├── vue2        // 主应用
    │   └── vue3        // 子应用
    ├── package.json
    ├── readme.md
    └── src             // 微前端实现
        ├── app.js
        ├── element.js
        ├── index.js
        ├── source.js
        └── utils.js
```