class ExpandingList extends HTMLUListElement {
  constructor() {
    super();
    this.addEventListener('click', this.clickHandler);
    Array.from(this.querySelectorAll('li')).forEach(liEl => {
      if (liEl.children.length > 0) {
        liEl.classList.add('closed');
      }
    });
  }

  clickHandler(event) {
    const target = event.target;
    if (target.tagName !== 'LI' || target.children.length === 0) { return; }
    if (target.classList.contains('closed')) {
      target.classList.remove('closed');
      target.classList.add('open');
    } else {
      target.classList.add('closed');
      target.classList.remove('open');
    }
  }
}

customElements.define('expanding-list', ExpandingList, { extends: 'ul' });