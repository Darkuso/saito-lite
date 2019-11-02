const AooStoreAppspaceTemplate 	= require('./appstore-appspace.template.js');

module.exports = AooStoreAppspace = {

    render(app, data) {
      document.querySelector(".email-appspace").innerHTML = AooStoreAppspaceTemplate();
    },

    attachEvents(app, data) {

      let fileUpload 	= document.querySelector('#module-file-upload-btn');
      let fileObj	= document.getElementById("module-file");

      fileUpload.onchange = function() {
        var reader = new FileReader();
        reader.onload = function() {
          fileObj.value = reader.result;
        };
        reader.readAsDataURL(this.files[0]);
      }


      document.querySelector('#appstore-submit')
        .addEventListener('click', (e) => {

	  if (fileObj.value == "") {
	    alert("Please attach a module zip file");
	    return;
	  }

	  let newtx = app.wallet.createUnsignedTransactionWithDefaultFee(app.wallet.returnPublicKey(), 0.0);
          if (newtx == null) { 
	    alert("Error sending transaction. Does your wallet have enough tokens?");
	    return; 
	  }
          newtx.transaction.msg.module   = "AppStore";
  	  newtx.transaction.msg.request  = "submit module";
  	  newtx.transaction.msg.module_module   = fileObj.value;
  	  newtx = app.wallet.signTransaction(newtx);
          app.network.propagateTransaction(newtx);

	  alert("Module Submitted!");

      });


    }

}
