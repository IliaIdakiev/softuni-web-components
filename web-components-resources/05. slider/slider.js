import { html, render } from '../node_modules/lit-html/lit-html.js';

const sliderHTMLTemplate = (ctx) => {
    return html`
<style>
    .slider-container {
        font-family: 'Montserrat', sans-serif;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        height: 100px;
    }

    .slider-percentage-value {
        font-weight: bold;
        text-align: center;
        margin: 1em 0;
    }

    .slider {
        -webkit-appearance: none;
        width: 100%;
        height: 15px;
        border-radius: 5px;
        background: #d3d3d3;
        outline: none;
        opacity: 0.7;
        -webkit-transition: .2s;
        transition: opacity .2s;
        margin: 0 1em;
    }

    .slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 25px;
        height: 25px;
        border-radius: 50%;
        background: #4CAF50;
        cursor: pointer;
    }

    .slider::-moz-range-thumb {
        width: 25px;
        height: 25px;
        border-radius: 50%;
        background: #4CAF50;
        cursor: pointer;
    }
</style>
<div class="slider-container">
    <input class="slider" type="range"
        @input=${ctx.sliderInputHandler}
        value="${ctx.value}" 
        step="${ctx.step}" />
    <div class="slider-end">
        Percentage: <span class="slider-percentage-value">${ctx.percentage}</span>
    </div>
</div>
`;
}
class Slider extends HTMLElement {

    static get observedAttributes() {
        return ['step', 'slider-value', 'is-inverted'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'slider-value') { name = 'value'; }
        if (name === 'is-inverted') { name = 'isInverted'; }
        this.state[name] = newValue;
        if (
            (name === 'isInverted' && newValue === 'true') ||
            (name === 'value' && this.state.isInverted === 'true')
        ) {
            const value = 100 - Number(this.state.value || '0')
            this.state.value = value;
        }

        this._update();
    }

    constructor() {
        super();
        const self = this;
        this.state = {
            step: '0.1',
            value: '0',
            get percentage() {
                return self.percentage;
            },
            sliderInputHandler: this.sliderInputHandler
        };

        this.root = this.attachShadow({ mode: 'closed' });

        this._update();
    }

    get percentage() {
        let calcPercentage = Number(this.state.value) / 100 * 100;

        if (this.state.isInverted) {
            calcPercentage = (100 - Number(this.state.value)) / 100 * 100
        }

        return `${calcPercentage.toFixed(2)} %`
    }

    sliderInputHandler(e) {
        this.state.value = e.target.value;
        let percentage = Number(this.state.value) / 100 * 100;

        if (this.isInverted) {
            percentage = (100 - Number(this.state.value)) / 100 * 100
        }

        this.state.percentage = `${percentage.toFixed(2)} %`

        this._update();
    }

    // this update method is not optimal please check 07.carousel to see the proper way
    // for creating the update method (there the method is called render)
    _update() {
        render(sliderHTMLTemplate(this.state), this.root, { eventContext: this });
    }
}

customElements.define('app-slider', Slider);