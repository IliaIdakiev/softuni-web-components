







const appRootTemplate = document.createElement('template');
appRootTemplate.innerHTML = `
<style>.test { color: green; }</style>
<h1>
<slot name="header"></slot>
<slot></slot>
<ul id="users"></ul>
</h1><span class="test">TEST</span>
<slot name="footer"></slot>
`;

class AppRoot extends HTMLElement {

  static get observedAttributes() {
    return ['title', 'value'];
  }

  get myProp() {
    return this._myProp;
  }

  set myProp(newValue) {
    this._myProp = newValue;
  }

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'closed' });
    root.appendChild(appRootTemplate.content.cloneNode(true));
    root.addEventListener('click', console.log);
    console.log('AppRoot constructed!');

    this._update = function (data) {
      const users = root.getElementById('users');
      data.forEach(element => {

      });
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log(name, oldValue, newValue);
  }

  connectedCallback() {
    this.uid = setInterval(this.updateTime, 60000)
    console.log('Component was connected!');

    console.log(this.getAttribute('test'));

    // fetch('').then(this._update)
  }

  disconnectedCallback() {
    clearInterval(this.uid);
    console.log('Component was disconnected!');
  }
}

customElements.define('app-root', AppRoot);


const appRoot2 = new AppRoot();
setTimeout(function () {
  document.body.appendChild(appRoot2);
  setTimeout(function () {
    appRoot2.remove();
  }, 3000);
}, 3000); 