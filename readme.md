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
样式隔离是指对子应用的`link`和`style`元素的`css`内容进行格式化处理，确保子应用的样式只作用于自身，不影响外部。

渲染过程中将`link`远程引入的`css文件`转换为了`style标签`，子应用中只会存在`style标签`，实现隔离的方式就是在`style`的每一条`css规则`前加上`micro-app[name=xx]`前缀。通过添加`css前缀`的方式让`css`只作用于子应用。

`style元素`插入到文档中，浏览器会为`style`创建`CSSStyleSheet样式表`，该样式表的`cssRules`属性包含了一组用于描述样式规则的`CSSRule`对象，通过该对象就可以对样式规则进行访问和修改。
#### 数据通信
子应用本身是可以独立运行的，通信系统不应该对子应用侵入的太深，所以采用了发布订阅模式。`micro-app`是以组件化的思想实现微前端的，我们在写`vue`或者`react`组件时，传递数据或注册监听都是以组件属性方式添加的，我们希望`micro-app`也能实现这种效果。

自定义元素无法支持对象类型的属性，只能传递字符串，例如<micro-app data={x: 1}></micro-app> 会转换为 <micro-app data='[object Object]'></micro-app>，想要以组件化形式进行数据通信必须让元素支持对象类型属性，为此我们需要重写`micro-app`原型链上`setAttribute`方法处理对象类型属性。

主应用通过`micro-app`的`data`属性发送数据，重写后的`setAttribute`方法会拦截`data`属性的变化，结合发布订阅将变化后的数据发送给子应用的监听。子应用通过全局注入的`microApp`属性注册数据变化的监听。

子应用通过全局注入的`dispath`向父应用传递数据，`dispatch`方法中则会构造一个`CustomEvent`自定义事件，以自定义事件的方式向主应用发送数据。父应用这边则通过监听与子应用协商好的自定义事件拿到子应用的数据。

### 项目结构
``` 
    ├── examples
    │   ├── vue2            // 主应用
    │   └── vue3            // 子应用
    ├── package.json
    ├── readme.md
    └── src                 // 微前端实现
        ├── app.js          // 子应用对应的微前端实例
        ├── data.js         // 数据通信
        ├── element.js      // micro-app自定义元素
        ├── index.js        // 应用入口
        ├── sandBox.js      // js沙箱
        ├── scopedcss.js    // css隔离
        ├── source.js       // 子应用静态资源加载
        └── utils.js        // 辅助函数
```

### 使用
```bash
# 分别进入examples/vue2、vue3 安装依赖
npm i

# 分别进入exapmles/vue3、vue3 启动项目
npm run serve
```