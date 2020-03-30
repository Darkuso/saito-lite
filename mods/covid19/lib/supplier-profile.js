const SupplierProfileTemplate = require('./supplier-profile.template.js');
const SupplierPortal = require('./supplier-portal.js');
const UpdateSupplier = require('./update-supplier.js');
const Navigation = require('./navigation.js');
const SplashPage2 = require('./splash-page.js');

module.exports = SupplierProfile = {

  render(app, data) {

    document.querySelector(".main").innerHTML = SupplierProfileTemplate();
    document.querySelector(".navigation").innerHTML = '<div class="button navlink covid_back"><i class="fas fa-back"></i> Back</div>';

    //
    // load products
    //
    let whereclause = "publickey = '"+app.wallet.returnPublicKey() + "'";
    data.covid19.sendPeerDatabaseRequest("covid19", "suppliers", "*", whereclause, null, function(res) {

      if (res.rows.length == 0) {

        //
        // new supplier
        //
	document.querySelector('.profile-information').innerHTML = `You are using a different browser than normal or have not yet created an account. <p></p>Please either create a new account, or click on the gear icon at the top-right of this page to restore your wallet and regain secure control over your account.`;
	document.querySelector('.new-supplier-btn').style.display = 'block';
	document.querySelector('.profile').style.display = 'block';
	document.querySelector('.loading').style.display = 'none';

      } else {

	//
	// existing suppler
	//
	document.querySelector('.profile-information').innerHTML = `

Welcome Back!

<p></p>

  <inpur type="hidden" name="supplier_id" class="supplier_id" value="${res.rows[0].id}" />

  <div class="grid-2">

    <div>Company Name:</div>
    <div>${res.rows[0].name}</div>

    <div>Company Phone:</div>
    <div>${res.rows[0].phone}</div>

    <div>Company Email:</div>
    <div>${res.rows[0].email}</div>

    <div>Company Wechat:</div>
    <div>${res.rows[0].wechat}</div>

  </div>

	`;

	document.querySelector('.profile').style.display = 'block';
	document.querySelector('.loading').style.display = 'none';
        document.querySelector('.new-supplier-btn').style.display = 'none';
        document.querySelector('.confirm-supplier-btn').style.display = 'block';
        document.querySelector('.edit-supplier-btn').style.display = 'block';

      }
    });

  },

  attachEvents(app, data) {

      document.querySelector('.covid_back').addEventListener('click', (e) => {
	data.covid19.renderPage("home", app, data);
      });


  }

}