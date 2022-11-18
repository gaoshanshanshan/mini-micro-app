## mini-micro-app

微前端框架[micro-app](https://github.com/micro-zoe/micro-app)简单实现，参考 [simple-micro-app](https://github.com/bailicangdu/simple-micro-app)，用来了解微前端的实现原理

### 核心原理
`micro-app`借鉴了`webComponent`的思想，以组件化的方式加载子应用。以`html`作为资源入口，通过加载远程`html`，解析`dom结构`获取`js、css静态资源`来渲染微前端应用。微应用与主应用是运行在同一个`window`下，就要考虑主应用与子应用的样式隔离、`js作用域`的隔离、数据通信等问题。

#### 渲染子应用
`mini-micro-app`的核心功能基于`webComponent`的`CustomElement`进行构建。`CustomElement`用于创建自定义标签，并提供了渲染、卸载、属性变化等钩子。通过钩子就可以知道微应用的渲染时机。自定义标签同时也是一个容器，微应用的元素和样式的作用域都在容器中，形成了封闭的环境。

通过监听自定义标签`micro-app`的生命周期函数`connectedCallback`得知标签被渲染，加载子应用的`html`，并转换为`dom结构`。递归的提取`dom`中的`script`和`link`标签，并远程加载标签对应的静态资源内容，然后插入到`dom`中。最后通过自定义标签的`appendChild`将`dom`插入到`document`中，完成子应用的渲染。
#### js 沙箱
`js沙箱`通过`Proxy`代理子应用的全局对象，防止应用之间的全局变量的冲突，同时记录和清空了子应用的副作用函数（通过`addEventListener`添加的事件)，还可以向子应用注入全局变量。

当子应用实例化时，会创建应用对应的`js沙箱`，沙箱会创建`proxy代理`。通过`with`语法将子应用的`window`代理到`proxy`。

将子应用的`window`代理到`proxy`后，子应用对`window`的属性访问、添加实际操作的是`proxy`，从而实现了`js作用域`的隔离，避免了全局变量的冲突。
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