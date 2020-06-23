import SortableTable from "./index";

class ProductTable extends SortableTable{
  getTableRows(data) {
    return data.map(item => `
      <a href="/products/${item.id}" class="sortable-table__row">
        ${this.getTableRow(item, data)}
      </a>`
    ).join('');
  }
}

export default ProductTable;

