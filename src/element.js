class MicroAppElement extends HTMLElement {
  static get observedAttributes() {
    return ["name", "url"];
  }
  connectedCallback() {
    console.log("micro-app-element is connected");
  }
  disconnectedCallback() {
    console.log("micro-app-element has  disconnected");
  }
  attributeChangedCallback(attrName, oldVal, newVal) {
    console.log(`attribute ${attrName}: ${newVal}`);
  }
}

export function defineElement() {
  if (!window.customElements.get("micro-app")) {
    window.customElements.define("micro-app", MicroAppElement);
  }
}
