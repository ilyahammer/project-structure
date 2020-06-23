export default class DoubleSlider {
  element;

  onMouseDown = event => {
    this.target = event.target;
    event.preventDefault();

    if (this.target.dataset.element === 'thumbLeft'){
      this.shiftX = this.target.getBoundingClientRect().right - event.clientX;
    } else {
      this.shiftX = this.target.getBoundingClientRect().left - event.clientX;
    }

    document.addEventListener('pointermove', this.onMouseMove);
  };

  onMouseMove = event => {
    document.addEventListener('pointerup', this.onMouseUp);
    let inner = this.target.closest('.range-slider__inner');

    if(this.target.dataset.element === 'thumbLeft'){
      let shiftLeft = (event.clientX - inner.getBoundingClientRect().left + this.shiftX) / inner.offsetWidth * 100;
      let rightEdge = 100 - parseFloat(document.querySelector('.range-slider__thumb-right').style.right);

      if (shiftLeft < 0){
        this.target.style.left = 0 + '%';
      } else if (shiftLeft > rightEdge){
        this.target.style.left = rightEdge + '%';
      } else {
        this.target.style.left = shiftLeft + '%';
      }

      document.querySelector('.range-slider__progress').style.left = this.target.style.left;
      this.updatedRange.from = Math.round(this.min + parseFloat(this.target.style.left) * 0.01 * (this.max - this.min));
      this.element.firstElementChild.textContent = this.formatValue(this.updatedRange.from);
    } else {
      let shiftRight = (inner.getBoundingClientRect().right - event.clientX - this.shiftX) / inner.offsetWidth * 100;
      let leftEdge = 100 - parseFloat(document.querySelector('.range-slider__thumb-left').style.left);

      if (shiftRight < 0){
        this.target.style.right = 0 + '%';
      } else if (shiftRight > leftEdge){
        this.target.style.right = leftEdge + '%';
      } else {
        this.target.style.right = shiftRight + '%';
      }

      document.querySelector('.range-slider__progress').style.right = this.target.style.right;
      this.updatedRange.to = Math.round(this.max - parseFloat(this.target.style.right) * 0.01 * (this.max - this.min));
      this.element.lastElementChild.textContent = this.formatValue(this.updatedRange.to);
    }
  }

  onMouseUp = () => {
    document.removeEventListener('pointermove', this.onMouseMove);
    document.removeEventListener('pointerup', this.onMouseUp);

    this.element.dispatchEvent(new CustomEvent('range-select', {
      detail: this.updatedRange,
      bubbles: true
    }));
  }

  constructor({
    min = 100,
    max = 200,
    selected = {},
    formatValue = value => '$' + value
              } = {}) {
    this.min = min;
    this.max = max;
    this.formatValue = formatValue;
    this.from = selected.from || min;
    this.to = selected.to || max;
    this.updatedRange = {
      from: this.from,
      to: this.to
    };

    this.render();
    this.initEventListeners();
  }

  initEventListeners() {
    const thumbLeft = this.element.querySelector(".range-slider__thumb-left");
    const thumbRight = this.element.querySelector(".range-slider__thumb-right");

    thumbLeft.addEventListener('pointerdown', this.onMouseDown);
    thumbRight.addEventListener('pointerdown', this.onMouseDown);
  }

  get sliderTemplate(){
    const formatFrom = this.formatValue(this.from);
    const formatTo = this.formatValue(this.to);
    const thumbLeft = (this.from - this.min) / (this.max - this.min) * 100;
    const thumbRight = 100 - (this.to - this.min) / (this.max - this.min) * 100;

    return `
      <div class="range-slider">
        <span data-element="from">${formatFrom}</span>
        <div data-element="inner" class="range-slider__inner">
          <span data-element="progress" class="range-slider__progress" style="left: ${thumbLeft}%; right: ${thumbRight}%;"></span>
          <span data-element="thumbLeft" class="range-slider__thumb-left" style="left: ${thumbLeft}%;"></span>
          <span data-element="thumbRight" class="range-slider__thumb-right" style="right: ${thumbRight}%;"></span>
        </div>
        <span data-element="to">${formatTo}</span>
      </div>`;
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.sliderTemplate;
    this.element = element.firstElementChild;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
