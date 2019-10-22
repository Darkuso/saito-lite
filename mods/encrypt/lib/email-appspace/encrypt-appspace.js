const EncryptAppspaceTemplate 	= require('./encrypt-appspace.template.js');


module.exports = EncryptAppspace = {

    render(app, data) {
      document.querySelector(".email-appspace").innerHTML = EncryptAppspaceTemplate();
    },

    attachEvents(app, data) {

      document.querySelector('.email-submit')
        .addEventListener('click', (e) => {
	  let recipient = document.getElementById('email-to-address').value;
	  data.parentmod.appspace_mod.initiate_key_exchange(recipient);
alert("HERE WE ARE DONE!");
        });

    }

}
