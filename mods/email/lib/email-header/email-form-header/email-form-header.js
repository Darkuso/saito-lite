const EmailList = require('../../email-list/email-list');
const EmailFormHeaderTemplate = require('./email-form-header.template');

module.exports = EmailFormHeader = {
  render(app, data) {
    document.querySelector('.email-header').innerHTML = EmailFormHeaderTemplate();
    this.attachEvents(app, data);
  },

  attachEvents(app, data) {
    document.getElementById('email-form-back-button')
            .addEventListener('click', (e) => {
              // data.emailList.render(app, data)
              // data.emailList.attachEvents(app, data)
              EmailList.render(app, data);
              EmailList.attachEvents(app, data);
            });
            // EmailList.render(app, data);
  }
}