let templateStyle;

export default function scopedCss(styleElement, appName) {
  const prefix = `micro-app[name=${appName}]`;
  // 创建模版style标签，styleElement可能还没有插入到dom中，就不会有sheet属性，所以用模版style
  if (!templateStyle) {
    templateStyle = document.createElement("style");
    document.body.appendChild(templateStyle);
    templateStyle.sheet.disabled = true;
  }
  if (styleElement.textContent) {
    templateStyle.textContent = styleElement.textContent;
    // 将格式化好的规则赋值给styleElement
    styleElement.textContent = scopedRule(
      Array.from(templateStyle.sheet.cssRules ?? []),
      prefix
    );
    templateStyle.textContent = "";
  } else {
    // 通过MutaionObserver观测已经插入到dom中的style，sytle一旦变化重新格式化
    const observe = new MutationObserver(() => {
      observe.disconnect();
      styleElement.textContent = scopedRule(
        Array.from(styleElement.sheet.cssRules ?? []),
        prefix
      );
    });
    observe.observe(styleElement, { childList: true });
  }
}

function scopedRule(ruleList, prefix) {
  let result = "";
  // rule有多个种类，只处理 style_rule media_rule supports_rule
  for (const rule of ruleList) {
    switch (rule.type) {
      case 1:
        result += scopedStyleRule(rule, prefix);
        break;
      case 4:
        result += scopedPackRule(rule, prefix, "media");
        break;
      case 12:
        result += scopedPackRule(rule, prefix, "supports");
        break;
      default:
        result += rule.cssText;
        break;
    }
  }
  return result;
}

function scopedPackRule(rule, prefix, packName) {
  // 递归执行scopedRule，转换media supports内部规则
  const result = scopedRule(Array.from(rule.cssRules), prefix);
  return `@${packName} ${rule.conditionText} {${result}}`;
}

function scopedStyleRule(rule, prefix) {
  const { selectorText, cssText } = rule;

  // 将顶层选择器 html body :root 替换为micro-app[name=appName]
  if (/^((html[\s>~,]+body)|(html|body|:root))$/.test(selectorText)) {
    return cssText.replace(/^((html[\s>~,]+body)|(html|body|:root))/, prefix);
  } else if (selectorText === "*") {
    return cssText.replace("*", `${prefix} *`);
  }
  
  const buildInRootSelectorRe =
    /(^|\s+)(html[\s>~]+body)|(html|body|:root)(?=[\s>~]|$)/;

  return cssText.replace(/[\s\S]+{/, (selectors) => {
    return selectors.replace(/(^|,)([^,]+)/g, (all, $1, $2) => {
      // 选择器中包含顶层选择器，单独处理
      if (buildInRootSelectorRe.test($2)) {
        return all.replace(buildInRootSelectorRe, prefix);
      }
      // 选择器前添加前缀
      return `${$1} ${prefix} ${$2.replace(/^\s*/, "")}`;
    });
  });
}
