import { html, render } from './node_modules/lit-html/lit-html.js';
import { repeat } from './node_modules/lit-html/directives/repeat.js';


function getEditableListTemplate(context) {
  return html`<style>
    .container {
        max-width: 500px;
        margin: 50px auto;
        border-radius: 20px;
        border: solid 8px #2c3033;
        background: white;
        box-shadow: 0 0 0px 1px rgba(255, 255, 255, .4), 0 0 0px 3px #2c3033;
    }

    .editable-list-header {
        margin: 0;
        border-radius: 10px 10px 0 0px;
        background-image: linear-gradient(#687480 0%, #3b4755 100%);
        font: bold 18px/50px arial;
        text-align: center;
        color: white;
        box-shadow: inset 0 -2px 3px 2px rgba(0, 0, 0, .4), 0 2px 2px 2px rgba(0, 0, 0, .4);
    }

    .editable-list {
        padding-left: 0;
    }

    .editable-list>li,
    .editable-list-add-container {
        display: flex;
        align-items: center;
    }

    .editable-list>li {
        justify-content: space-between;
        padding: 0 1em;
    }

    .editable-list-add-container {
        justify-content: space-evenly;
    }

    .editable-list>li:nth-child(odd) {
        background-color: rgb(229, 229, 234);
    }

    .editable-list>li:nth-child(even) {
        background-color: rgb(255, 255, 255);
    }

    .editable-list-add-container>label {
        font-weight: bold;
        text-transform: uppercase;
    }

    .icon {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1.8rem;
        outline: none;
    }
  </style>
  <article class="container">
    <h1 class="editable-list-header">TODO LIST TITLE</h1>

    <ul class="editable-list" @click=${context.deleteHandler}>
      ${repeat(context.items, context.itemKeyFn, context.itemRenderFn)}
    </ul>

    <div class="editable-list-add-container">
        <label>ADD NEW TODO</label>
        <input @input=${context.itemInputHandler} .value=${context.inputValue} class="add-new-list-item-input" type="text" />
        <button class="editable-list-add-item icon" @click=${context.addItemHandler}>&oplus;</button>
    </div>
  </article>`;
}


class EditableList extends HTMLElement {

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'closed' });
    this.inputValue = '';
    this.items = [];

    // this update method is not optimal please check 07.carousel to see the proper way
    // for creating the update (there the method is called render)
    this._update = function () {
      const templateResult = getEditableListTemplate(this);
      render(templateResult, root, { eventContext: this });
    };
    this._update();
  }

  itemInputHandler(event) {
    this.inputValue = event.target.value;
    this._update();
  }

  deleteHandler({ target }) {
    if (!target.classList.contains('editable-list-remove-item')) { return; }
    const index = target.getAttribute('data-index');
    this.items.splice(index, 1);
    this._update();
  }

  addItemHandler() {
    if (this.inputValue === '') { return; }
    this.items.push({ text: this.inputValue });
    this.inputValue = '';
    this._update();
  }

  itemKeyFn(item, index) {
    return index;
  }

  itemRenderFn(item, index) {
    return html`<li>
        <p class="editable-list-item-value">${item.text}</p>
        <button data-index=${index} class="editable-list-remove-item icon">&ominus;</button> 
    </li>
    `;
  }
}

customElements.define('editable-list', EditableList);