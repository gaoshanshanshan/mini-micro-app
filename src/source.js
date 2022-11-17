import { fetchSource } from "./utils";

export function loadHtml(app) {
  fetchSource(app.url)
    .then((html) => {
      html = html
        .replace(/<head[^>]*>[\s\S]*?<\/head>/i, (match) => {
          // 将head标签替换为micro-app-head，因为web页面只允许有一个head标签
          return match
            .replace(/<head/i, "<micro-app-head")
            .replace(/<\/head>/i, "</micro-app-head>");
        })
        .replace(/<body[^>]*>[\s\S]*?<\/body>/i, (match) => {
          // 将body标签替换为micro-app-body，防止与基座应用的body标签重复导致的问题。
          return match
            .replace(/<body/i, "<micro-app-body")
            .replace(/<\/body>/i, "</micro-app-body>");
        });
      // 把html字符串转换为dom结构
      const htmlDom = document.createElement("div");
      htmlDom.innerHTML = html;
      console.log("html: ", html);

      // 进一步提取和处理js、css等静态资源
      extractSourceDom(htmlDom, app);

      // 请求css资源
      const microAppHead = htmlDom.querySelector("micro-app-head");
      if (app.source.links.size) {
        fetchLinksFromHtml(app, microAppHead, htmlDom);
      } else {
        app.onLoad(htmlDom);
      }

      // 请求script资源
      if (app.source.scripts.size) {
        fetchScriptsFromHtml(app, htmlDom);
      } else {
        app.onLoad(htmlDom);
      }
    })
    .catch((e) => {
      console.error("加载html出错：", e);
    });
}

function extractSourceDom(parent, app) {
  const children = Array.from(parent.children);

  // 递归处理子节点
  children.length && children.forEach((child) => extractSourceDom(child, app));

  for (const dom of children) {
    // 处理css类型的link标签
    if (dom instanceof HTMLLinkElement) {
      // 提取出href，并缓存到app的links中，后续会请求href拿到对应的css样式文件
      const href = dom.getAttribute("href");
      if (dom.getAttribute("rel") === "stylesheet" && href) {
        app.source.links.set(href, {
          code: "",
        });
        parent.removeChild(dom);
      }
    }
    // 处理script标签
    else if (dom instanceof HTMLScriptElement) {
      // 提取出src，并缓存到app的scripts中，后续会请求src拿到对应的script内容
      const src = dom.getAttribute("src");
      // 远程script
      if (src) {
        app.source.scripts.set(src, {
          code: "",
          isExternal: true,
        });
      }
      // 内联script
      else {
        const nonceStr = Math.random().toString(36).substr(2, 15);
        app.source.scripts.set(nonceStr, {
          code: dom.textContent,
          isExternal: false,
        });
      }
      parent.removeChild(dom);
    }
    // 处理style标签
    else if (dom instanceof HTMLStyleElement) {
      // TODO: 样式隔离时实现
    }
  }
}

function fetchLinksFromHtml(app, microAppHead, htmlDom) {
  const linksEntries = Array.from(app.source.links.entries());

  const fetchLinksPromise = [];
  for (const [url] of linksEntries) {
    fetchLinksPromise.push(fetchSource(normalizeUrl(app, url)));
  }
  // 加载所有css资源
  Promise.all(fetchLinksPromise)
    .then((res) => {
      // 1.创建style标签，插入到micro-app-head中
      // 2.将加载的css代码同步到app的source中
      for (let i = 0; i < res.length; i++) {
        const code = res[i];
        const link2Style = document.createElement("style");
        link2Style.textContent = code;
        linksEntries[i][1].code = code;
        microAppHead.appendChild(link2Style);
      }
      // 加载css资源完成后，调用app的onLoad
      app.onLoad(htmlDom);
    })
    .catch((e) => {
      console.error("加载css出错：", e);
    });
}

function fetchScriptsFromHtml(app, htmlDom) {
  const scriptEntries = Array.from(app.source.scripts.entries());

  const fetchScriptPromise = [];
  for (const [url, info] of scriptEntries) {
    fetchScriptPromise.push(
      info.code
        ? Promise.resolve(info.code)
        : fetchSource(normalizeUrl(app, url))
    );
  }

  // 加载所有script
  Promise.all(fetchScriptPromise)
    .then((res) => {
      //将加载的script代码同步到app的scrips中
      for (let i = 0; i < res.length; i++) {
        const code = res[i];
        scriptEntries[i][1].code = code;
      }
      // 加载完script后，调用app的onLoad方法
      app.onLoad(htmlDom);
    })
    .catch((e) => {
      console.error("加载script出错：", e);
    });
}

function normalizeUrl(app, url) {
  return url.startsWith("http") ? url : app.url + url;
}
