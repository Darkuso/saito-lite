const UpdateProductTemplate = require('./update-product.template');


module.exports = UpdateProduct = {

  render(app, data) {
    document.querySelector(".main").innerHTML = UpdateProductTemplate();

    let fields = "";
    data.covid19.sendPeerDatabaseRequest("covid19", "products JOIN suppliers", "*", "products.supplier_id = suppliers.id AND products.id = " + data.id, null, function (res) {

      if (res.rows.length > 0) {
        data.covid19.renderProductForm(res.rows[0]);
      }

    });
    //document.querySelector(".loading").style.display = "none";
    document.querySelector(".portal").style.display = "block";

  },

  attachEvents(app, data) {

    document.querySelector('.update-product-btn').addEventListener('click', (e) => {
      
    });


  }

}

