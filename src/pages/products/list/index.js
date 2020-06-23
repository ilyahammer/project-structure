import DoubleSlider from '../../../components/double-slider/index.js';
import ProductTable from "../../../components/sortable-table/product-table";

import header from "../../products/list/products-header";

export default class Page {
  element;
  subElements = {};
  components = {};

  updateTableOnInput(value){
    const productTable = this.components.productTable;
    productTable.url.searchParams.set('title_like', value);

    this.addRowsToTable(productTable);
  }

  updateTableOnSelectChange(value){
    const productTable = this.components.productTable;
    productTable.url.searchParams.set('status', value);

    if(!value) {
      productTable.url.searchParams.delete('status');
    }

    this.addRowsToTable(productTable);
  }

  updateTableOnSliderChange(from, to){
    const productTable = this.components.productTable;
    productTable.url.searchParams.set('price_gte', from);
    productTable.url.searchParams.set('price_lte', to);

    this.addRowsToTable(productTable);
  }

  async addRowsToTable(productTable) {
    if(productTable.element.classList.contains('sortable-table_empty')) {
      productTable.element.classList.remove('sortable-table_empty');
    }
    productTable.loading = false;
    const data = await productTable.loadData(productTable.sorted.id, productTable.sorted.order, 1, 1 + productTable.step);
    if(!data || data.length === 0) {
      productTable.element.classList.add('sortable-table_empty');
    }
    productTable.addRows(data);
  }

  async initComponents () {
    const doubleSlider = new DoubleSlider({
      min: 0,
      max: 4000
    });

    this.components.productTable = new ProductTable(header, {
      url: `api/rest/products?_embed=subcategory.category`,
      sorted: {
        id: 'title',
        order: 'asc'
      },
      step: 30
    });
    this.components.doubleSlider = doubleSlider;
  }

  get template () {
    return `<div class="products-list">
      <div class="content__top-panel">
        <h1 class="page-title">Products</h1>
        <a href="/products/add" class="button-primary">Add product</a>
      </div>
      <div class="content-box content-box_small">
        <form class="form-inline">
          <div class="form-group">
            <label class="form-label">Sort by:</label>
            <input type="text" data-element="filterName" class="form-control" placeholder="Product name">
          </div>
          <div class="form-group" data-element="doubleSlider">
            <label class="form-label">Price:</label>
          </div>
          <div class="form-group">
            <label class="form-label">Status:</label>
            <select class="form-control" data-element="filterStatus">
              <option value="" selected="">Any</option>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>
        </form>
      </div>
      <div data-element="productTable" class="products-list__container">
        <!-- sortable-table component -->
      </div>
    </div>`;
  }

  async render () {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    await this.initComponents();

    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  renderComponents () {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const { element } = this.components[component];

      root.append(element);
    });
  }

  getSubElements ($element) {
    const elements = $element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  initEventListeners () {
    this.subElements.filterName.addEventListener('input', event => {
      const searchValue = event.target.value;
      this.updateTableOnInput(searchValue);
    });

    this.subElements.filterStatus.addEventListener('change', event => {
      const selectValue = event.target.value;
      this.updateTableOnSelectChange(selectValue);
    });

    this.components.doubleSlider.element.addEventListener('range-select', event => {
      const {from, to} = event.detail;
      this.updateTableOnSliderChange(from, to);
    });
  }

  destroy () {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
