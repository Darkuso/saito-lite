const SettingsAppspaceTemplate = require('./settings-appspace.template.js');

module.exports = SettingsAppspace = {

    render(app, data) {

      document.querySelector(".email-appspace").innerHTML = SettingsAppspaceTemplate(app);

      let settings_appspace = document.querySelector(".settings-appspace");
      if (settings_appspace) {
        for (let i = 0; i < app.modules.mods.length; i++) {
          if (app.modules.mods[i].respondTo("settings-appspace") != null) {
            let mod_settings_obj = app.modules.mods[i].respondTo("settings-appspace");
            mod_settings_obj.render(app, data);
          }
        }
      }

    },

    attachEvents(app, data) {

      let settings_appspace = document.querySelector(".settings-appspace");
      if (settings_appspace) {
        for (let i = 0; i < app.modules.mods.length; i++) {
          if (app.modules.mods[i].respondTo("settings-appspace") != null) {
            let mod_settings_obj = app.modules.mods[i].respondTo("settings-appspace");
            mod_settings_obj.attachEvents(app, data);
          }
        }
      }






      document.getElementById('restore-account-btn')
        .addEventListener('click', (e) => {
          document.getElementById("settings-restore-account").click();
      });


      document.getElementById('settings-restore-account')
        .onchange = async function(e) {

          let password_prompt = sprompt("Please provide the password you used to encrypt this backup:");
          if (password_prompt) {

            let selectedFile = this.files[0];
            var wallet_reader = new FileReader();
            wallet_reader.onloadend = function() {
alert("RESULT: " + wallet_reader.result);
console.log(wallet_reader.result);

              let decryption_secret = app.crypto.hash(password_prompt + "SAITO-PASSWORD-HASHING-SALT");
	      let decrypted_wallet = app.crypt.aesDecrypt(wallet_reader.result, decryption_secret);
console.log(decrypted_wallet);
	      try {
  	        let wobj = JSON.parse(decrypted_wallet);
console.log(JSON.stringify(wobj));
		app.options = wobj;
		app.storage.saveOptions();
		//
		// and reload
		//
alert("Restoration Complete ... click to reload Saito");
		window.location = window.location;
	      } catch (err) {
alert("Error decrypting wallet file. Password incorrect");
alert(JSON.stringify(err));
	      }

            }
            wallet_reader.readAsBinaryString(selectedFile);

          } else {
alert("Cancelling Wallet Restoration...");
          }
      };





      document.getElementById('restore-account-btn')
        .addEventListener('click', (e) => {

	  let pass = sprompt("Please provide your password to decrypt this wallet: ");

	  alert("Provided: " + pass);

      });


      document.getElementById('reset-account-btn')
        .addEventListener('click', (e) => {

          app.wallet.resetWallet();
          salert("Wallet reset!");

	  data.email.emails.inbox = [];
	  data.email.emails.sent = [];
	  data.email.emails.trash = [];

	  data.email.body.render(app, data);
	  data.email.body.attachEvents(app, data);

      });
    },

}
