import SortableList from "../../components/sortable-list";
import fetchJSON from "../../utils/fetch-json";
import NotificationMessage from "../../components/notification";

export default class Page {
  element;
  subElements = {};
  components = {};

  initEventListeners() {
    this.element.addEventListener('sortable-list-reorder', async event => {
      const parentElement = event.target.parentElement;

      let weight = 1
      const elementsOrder = [...parentElement.querySelectorAll('[data-id]')].map(item => {
        return {
          id: item.dataset.id,
          weight: weight++
        }
      });

      await fetchJSON(`${process.env.BACKEND_URL}api/rest/subcategories`, {
        method: 'PATCH',
        headers: {
         'Content-Type': 'application/json'
        },
        body: JSON.stringify(elementsOrder)
      });

      const notification = new NotificationMessage('Product order saved!')
      notification.show();
    });

    this.subElements.categoriesContainer.addEventListener('click', event => {
      const target = event.target;
      if(target.classList.contains('category__header')){
        target.parentElement.classList.toggle('category_open');
      }
    })
  }

  async fetchCategories() {
    return await fetchJSON(`${process.env.BACKEND_URL}api/rest/categories?_sort=weight&_refs=subcategory`);
  }

  initComponents (data) {
    this.components.sortableList = new SortableList({
      items: data.map(item => {
        const element = document.createElement('li');
        element.dataset.id = item.id;
        element.dataset.grabHandle = "";
        element.classList.add('categories__sortable-list-item');
        element.innerHTML = `<strong>${item.title}</strong>
                             <span><b>${item.count}</b> products</span>`;
        return element;
      })
    });

    return this.components.sortableList;
  }

  renderCategories(data) {
    const element = document.createElement('div');

    for (const category of data) {
      const sortableList = this.initComponents(category.subcategories);
      element.append(this.getCategoryTemplate(sortableList, category));
    }
    this.subElements.categoriesContainer.append(...element.childNodes);
  }

  getCategoryTemplate(sortableList, category) {
    const element = document.createElement('div');
    element.innerHTML = `<div class="category category_open" data-id="${category.id}">
          <header class="category__header">${category.title}</header>
          <div class="category__body">
            <div class="subcategory-list"></div>
          </div>
        </div>`;
    element.querySelector('.subcategory-list').append(sortableList.element);

    return element.firstElementChild;
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    const data = await this.fetchCategories();

    this.renderCategories(data);
    this.initEventListeners();

    return this.element;
  }

  get template() {
    return `
    <div class="categories">
      <div class="content__top-panel">
        <h1 class="page-title">Product categories</h1>
      </div>
      <div data-elem="categoriesContainer"></div>
    </div>
    `;
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
