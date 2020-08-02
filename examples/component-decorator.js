
import { render, html } from './node_modules/lit-html/lit-html.js';

function component(klass, mode = 'closed') {
  class Cmp extends HTMLElement {
    constructor(...args) {
      super();
      const obj = new klass(...args);

      const prototypeNames = Object.getOwnPropertyNames(klass.prototype);
      const classNames = Object.getOwnPropertyNames(obj);

      for (const prop of prototypeNames.concat(classNames).filter(i => i !== 'constructor')) {
        if (obj.hasOwnProperty(prop)) {
          let val = obj[prop];
          Object.defineProperty(this, prop, {
            set(newValue) {
              val = newValue;
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
          const template = this.render();
          render(template, root, { eventContext: this });
          this.hasUpdateScheduled = false;
        });
      }

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
      <app-test></app-test>
    `;
  }
}

customElements.define('app-root', component(AppRoot));