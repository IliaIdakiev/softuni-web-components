
const buttonTypes = ['primary', 'accent', 'warn'];

class AppButton extends HTMLButtonElement {

  static get observedAttributes() {
    return ['btn-type', 'text'];
  }

  set btnType(newValue) {
    if (this._btnType) { this.classList.remove(this._btnType); }
    this.classList.add(newValue);
    this._btnType = newValue;
  }

  set text(newValue) {
    this.textContent = newValue;
  }

  constructor() {
    super();
    this.classList.add('btn');
    console.log('Btn was constructed!');
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'btn-type') {
      this.btnType = newValue;
    } else if (name === 'text') {
      this.text = newValue;
    }
  }
}

customElements.define('app-button', AppButton, { extends: 'button' });