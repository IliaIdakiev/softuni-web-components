
import { render, html } from './node_modules/lit-html/lit-html.js';

function component(inputClass, mode = 'closed') {

  class Cmp extends HTMLElement {

    constructor(...args) {
      super();
      let proxy, renderProps = [];
      const obj = new inputClass(...args);

      const prototypeNames = Object.getOwnPropertyNames(inputClass.prototype);
      const classNames = Object.getOwnPropertyNames(obj);

      for (const prop of prototypeNames.concat(classNames).filter(i => i !== 'constructor')) {
        if (obj.hasOwnProperty(prop)) {
          let val = obj[prop];

          if (['object'].includes(typeof val)) {
            val = new Proxy(val, {
              get(target, name, receiver) {
                return Reflect.get(target, name, receiver);
              },
              set: (target, name, value, receiver) => {
                if (renderProps.includes(prop)) { this._update(); }
                return Reflect.set(target, name, value, receiver);
              }
            });
          }

          Object.defineProperty(this, prop, {
            set(newValue) {
              val = newValue;
              if (!renderProps.includes(prop)) { return; }
              this._update();
            },
            get() {
              return val;
            }
          });
        } else if (!Cmp.prototype[prop]) {
          Cmp.prototype[prop] = obj[prop];
        }
      }

      const root = this.attachShadow({ mode });
      this.hasUpdateScheduled = false;

      this._update = function () {
        if (this.hasUpdateScheduled) { return; }

        Promise.resolve().then(() => {
          renderProps = [];
          const template = this.render.call(proxy);
          render(template, root, { eventContext: this });
          this.hasUpdateScheduled = false;
        });
      }

      proxy = new Proxy(this, {
        get(target, propName, receiver) {
          renderProps = renderProps.concat(propName);
          return Reflect.get(target, propName, receiver);
        }
      })
      this._update();
    }
  }

  return Cmp;
}


class AppRoot {
  constructor() {
    this.age = 10;
  }

  handleBtnClick() {
    this.age++;
  }

  render() {
    return html`
      <div>HELLO! The age is ${this.age}</div>
      <button @click=${this.handleBtnClick}>Inc</button>
    `;
  }
}

customElements.define('app-root', component(AppRoot));