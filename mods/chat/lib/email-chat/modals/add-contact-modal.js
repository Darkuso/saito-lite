const AddContactModalTemplate = require('./add-contact-modal.template');
const AddContactSuccessModalTemplate = require('./add-contact-modal-success.template');

module.exports = AddContactModal = {

  render(app, data) {
    let {el_parser} = data.helpers;
    document.querySelector(".email-chat").append(el_parser(AddContactModalTemplate()));
  },

  attachEvents(app, data) {
    var modal = document.getElementById('add-contact-modal');

    document.getElementById('email-chat-add-contact').onclick = () => {
      try {
        app.modules.returnModule("Tutorial").inviteFriendsModal();
      } catch (err) {
        modal.style.display = "block";
      }
    }

    document.getElementsByClassName("close")[0]
            .onclick = () => modal.style.display = "none";

    document.getElementById('add-contact-add-button')
            .onclick = () => {
              let publickey = document.getElementById('add-contact-input').value;
              let encrypt_mod = app.modules.returnModule('Encrypt');
              encrypt_mod.initiate_key_exchange(publickey);

              //
              // show success modal
              //


              // then hide it
              //
              modal.style.display = "none";

              // document.querySelector(".email-chat").append(elParser(AddContactSuccessModalTemplate()))

            };

      document.addEventListener('keydown', (e) => {
        if (e.keyCode == '27') { modal.style.display = "none"; }
      });
  },
}
