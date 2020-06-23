import ProductForm from "../../../components/product-form";
import NotificationMessage from "../../../components/notification";

export default class Page {
  element;
  subElements = {};
  components = {};

  constructor(match) {
    this.productId = match[1];
  }

  async initComponents () {
    this.components.productForm = new ProductForm(this.productId);
  }

  get template() {
    return `
    <section class="content" id="content">
      <div class="products-edit">
        <div class="content__top-panel">
          <h1 class="page-title">
            <a href="/products" class="link">Products</a> / ${this.productId ? 'Edit' : 'Add'}
          </h1>
        </div>
        <div class="content-box" data-elem="productForm"></div>
      </div>
    </section>
    `;
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    await this.initComponents();
    await this.renderForm();
    this.initEventListeners();

    return this.element;
  }

  initEventListeners() {
    this.components.productForm.element.addEventListener('product-saved', event => {
      const notification = new NotificationMessage('Product created!')
      notification.show();
    });

    this.components.productForm.element.addEventListener('product-updated', event => {
      const notification = new NotificationMessage('Product saved!')
      notification.show();
    })
  }

  async renderForm() {
    await this.components.productForm.render()
    const root = this.subElements.productForm;

    root.append(this.components.productForm.element);
  }

  getSubElements ($element) {
    const elements = $element.querySelectorAll('[data-elem]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.elem] = subElement;

      return accum;
    }, {});
  }

  destroy () {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
 }
