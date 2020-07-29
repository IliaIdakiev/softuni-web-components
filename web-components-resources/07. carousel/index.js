import { html, render } from './node_modules/lit-html/lit-html.js';
import { repeat } from './node_modules/lit-html/directives/repeat.js';
import { classMap } from './node_modules/lit-html/directives/class-map.js';


function getCarouselTemplate(context) {
  return html`<style>
  .carousel-container {
      max-width: 60rem;
      position: relative;
      margin: 0 auto;
      height: 320px;

  }

  .carousel-controls {
      text-align: center;
      z-index: 100;
  }

  .carousel-slide {
    height: 310px;
    position: absolute;
    width: 100%;
  }

  .carousel-slide.active {
    z-index: 1;
  }

  .carousel-slide.active.fade {
    z-index: 2;
  }

  .carousel-slide:not(.active) {
      display: none;
  }

  .carousel-slide>img {
      width: 100%;
      height: 200px;
  }

  /* Next & previous buttons */

  .prev,
  .next {
      cursor: pointer;
      position: absolute;
      top: 50%;
      width: auto;
      margin-top: -22px;
      padding: 16px;
      color: white;
      font-weight: bold;
      font-size: 18px;
      transition: 0.6s ease;
      border-radius: 0 3px 3px 0;
      user-select: none;
      z-index: 100;
  }

  /* Position the "next button" to the right */

  .next {
      right: 0;
      border-radius: 3px 0 0 3px;
  }

  /* On hover, add a black background color with a little bit see-through */

  .prev:hover,
  .next:hover {
      background-color: rgba(0, 0, 0, 0.8);
  }

  /* Caption text */

  .text {
      color: #f2f2f2;
      font-size: 15px;
      padding: 8px 12px;
      position: absolute;
      bottom: 8px;
      width: 100%;
      text-align: center;
  }

  /* Number text (1/3 etc) */

  .numbertext {
      color: #f2f2f2;
      font-size: 12px;
      padding: 8px 12px;
      position: absolute;
      top: 0;
  }

  /* The dots/bullets/indicators */
  .carousel-controls>.dot {
      cursor: pointer;
      height: 15px;
      width: 15px;
      margin: 0 2px;
      background-color: #bbb;
      border-radius: 50%;
      display: inline-block;
      transition: background-color 0.6s ease;
  }

  .active,
  .dot:hover,
  .dot.active {
      background-color: #717171;
  }

  /* Fading animation */

  .fade {
      -webkit-animation-name: fade;
      -webkit-animation-duration: 1.5s;
      animation-name: fade;
      animation-duration: 1.5s;
  }

  @-webkit-keyframes fade {
      from {
          opacity: 1
      }

      to {
          opacity: 0
      }
  }

  @keyframes fade {
      from {
          opacity: 1
      }

      to {
          opacity: 0
      }
  }
  </style>
  <div class="carousel-container">
    ${repeat(context.items, context.indexKeyFn, context.itemRenderFn)}

    <a class="prev" @click=${context.prevClickHandler}>&#10094;</a>
    <a class="next" @click=${context.nextClickHandler}>&#10095;</a>
  </div>
  <div class="carousel-controls" @click=${context.dotClickHandler}>
    ${repeat(context.items, context.indexKeyFn, context.dotRenderFn)}
  </div>`;
}

const ANIMATION_TIME = 1500;

class Carousel extends HTMLElement {

  set activeIndex(newValue) {
    this.prevActiveIndex = this.activeIndex;
    this._activeIndex = newValue;
    this._update();
  }

  get activeIndex() {
    return this._activeIndex || 0;
  }

  constructor() {
    super();
    this.updateItems();
    const root = this.attachShadow({ mode: 'closed' });

    this.itemRenderFn = (item, index) => {
      const willFade = this.prevActiveIndex === index && !this.hasFadedSuccessfully;
      const classes = {
        'active': index === this.activeIndex || willFade,
        'carousel-slide': true,
        'fade': willFade
      };

      return html`<article class=${classMap(classes)}>
        <p class="number-text">${index + 1} / ${this.items.length}</p>
        <img src=${item.src} alt=${item.alt} />
        <p class="caption-text">${item.caption}</p>
      </article>`;
    };

    this.dotRenderFn = (_, index) => {
      const classes = {
        'active': index === this.activeIndex,
        'dot': true
      };
      return html`<span data-index=${index} class=${classMap(classes)}></span>`;
    }

    this._update = function () {
      // if we have already scheduled an update don't schedule another one
      if (this._updateScheduled) { return; }
      this._updateScheduled = true;

      // wait until the current stack is empty (all the state updates are made)
      Promise.resolve().then(() => {

        // update and render the template with all the state changes
        const templateResult = getCarouselTemplate(this);
        render(templateResult, root, { eventContext: this });
        this._updateScheduled = false;

        // check if we have an element that is fading        
        const fadeEl = root.querySelector('.fade');
        if (!fadeEl) { return; }


        const transitionSuccessful = () => {
          this.hasFadedSuccessfully = true;
          this._update();
        }

        // if we do schedule an update after the element has faded so we can remove the
        // .active and .fade classes from the element
        // we don't want to directly access the element (fadeEl) and remove the class 
        // because this breaks the workflow which is (state change) -> (render changes)
        setTimeout(transitionSuccessful, ANIMATION_TIME);

      });
    }

    this.hasFadedSuccessfully = true;

    this._update();
  }

  updateItems() {
    this.items = Array.from(this.children).map(i => {
      return {
        src: i.getAttribute('src'),
        alt: i.getAttribute('alt'),
        caption: i.getAttribute('caption')
      }
    });
  }

  indexKeyFn(_, index) {
    return index;
  }

  // we use this function so we can buffer clicks until the animation is completed
  clickDelayWhileAnimationIsCompleted(fn, ...args) {
    if (this.uid) { clearTimeout(this.uid); }
    if (!this.hasFadedSuccessfully) {
      this.uid = setTimeout(fn.bind(this), ANIMATION_TIME / 3, ...args);
      return true;
    }
    return false;
  }

  prevClickHandler() {
    if (this.clickDelayWhileAnimationIsCompleted(this.prevClickHandler)) { return; }
    this.hasFadedSuccessfully = false;
    let nextIdx = this.activeIndex - 1;
    if (nextIdx < 0) { nextIdx = this.items.length - 1; }
    this.activeIndex = nextIdx;
  }

  nextClickHandler() {
    if (this.clickDelayWhileAnimationIsCompleted(this.nextClickHandler)) { return; }
    if (!this.hasFadedSuccessfully) { return; }
    this.hasFadedSuccessfully = false;
    let nextIdx = this.activeIndex + 1;
    if (nextIdx > this.items.length - 1) { nextIdx = 0; }
    this.activeIndex = nextIdx;
  }

  dotClickHandler({ target }) {
    if (!target.classList.contains('dot')) { return; }
    if (this.clickDelayWhileAnimationIsCompleted(this.dotClickHandler, { target })) { return; }
    const newIndex = +target.getAttribute('data-index');
    if (newIndex === this.activeIndex) { return; }
    this.hasFadedSuccessfully = false;
    this.activeIndex = newIndex;
  }

}

customElements.define('app-carousel', Carousel);
