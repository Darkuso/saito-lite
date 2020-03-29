module.exports = UpdateProductTemplate = (app, data) => {

  let html = '';

  html = `
  <div class="supplier-information">

    <div class="loading">
      Loading Product Editing Page....
    </div>

    <div class="portal" style="display:none">

      <h3>Product Details:</h3>

      <select id="select-product-type" name="select-product-type">
        <option value=0>select product category</option>
      </select>

 
      <div id="product-grid" class="product-grid grid-4"></div>

<!--
      <h3>Certifications</h3>

      <div id="cert-grid" class="cert-grid"></div>
      <h3>Supplier Details</h3>

      <div id="supplier-grid" class="supplier-grid grid-4"></div>

-->

      <div id="${data.product_id}" class="update-product-btn button">Update Public Listing</div>

    </div>
  </div>


  `;

  return html;

}
