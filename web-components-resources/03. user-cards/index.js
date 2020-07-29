import { html, render } from './node_modules/lit-html/lit-html.js';

function getUserCardTemplate(context) {

  const userInfo = context.showInfo ? html`<div>
    <p>
        <slot name="email" />
    </p>
    <p>
        <slot name="phone" />
    </p>
  </div>`: null;

  return html`
   <style>
      .user-card {
          display: flex;
          font-family: 'Arial', sans-serif;
          background-color: #EEE;
          border-bottom: 5px solid darkorchid;
          width: 100%;
      }

      .user-card img {
          width: 200px;
          height: 200px;
          border: 1px solid darkorchid;
      }

      .info {
          display: flex;
          flex-direction: column;
      }

      .info h3 {
          font-weight: bold;
          margin-top: 1em;
          text-align: center;
      }

      .info button {
          outline: none;
          border: none;
          cursor: pointer;
          background-color: darkorchid;
          color: white;
          padding: 0.5em 1em;
      }

      @media only screen and (max-width: 500px) {
          .user-card {
              flex-direction: column;
              margin-bottom: 1em;
          }

          .user-card figure,
          .info button {
              align-self: center;
          }

          .info button {
              margin-bottom: 1em;
          }

          .info p {
              padding-left: 1em;
          }
      }
  </style>
  <div class="user-card">
      <figure>
          <img src=${context['avatar-url']} />
      </figure>
      <div class="info">
        <h3>${context.name}</h3>
        ${userInfo}
        <button @click=${context.toggleHandler} class="toggle-info-btn">Toggle Info</button>
      </div>
  </div>
  `;
}

class UserCard extends HTMLElement {

  static get observedAttributes() {
    return ['avatar-url', 'name'];
  }

  constructor() {
    super();

    this.showInfo = false;
    this.avatarUrl = null;
    this.name = null;

    const root = this.attachShadow({ mode: 'closed' });

    // this render method is not optimal please check 07.carousel to see the proper way
    // for creating the render
    this._render = function () {
      const templateResult = getUserCardTemplate(this);
      render(templateResult, root, { eventContext: this });
    };

    this._render();
  }

  toggleHandler() {
    this.showInfo = !this.showInfo;
    this._render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this[name] = newValue;
    this._render();
  }
}

customElements.define('user-card', UserCard);