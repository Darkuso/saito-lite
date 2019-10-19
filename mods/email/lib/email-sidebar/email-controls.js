const EmailControlsTemplate = require('./email-controls.template');
const EmailChatTemplate = require('./email-chat.template');

module.exports = EmailControls = {

    render(app, data) {

      document.querySelector(".email-sidebar").innerHTML += EmailControlsTemplate();

      let email_apps = document.querySelector(".email-apps");
      for (let i = 0; i < data.mods.length; i++) {
	email_apps.innerHTML += `<li class="email-navigator-item">${data.mods[i].name}</li>`;
      }
      this.attachEvents(app);
    },


    attachEvents(app) {
alert("EVENT ATTACHED");
try {


        Array.from(document.getElementsByClassName('email-navigator-item'))
             .forEach(row => row.addEventListener('click', (e) => {
alert("CLICKED");
             })
        );



alert("successfully attached event listeners!");

} catch (err) {
  alert("ERROR ATTACHING EVENT: " + err);
}
    }

}
