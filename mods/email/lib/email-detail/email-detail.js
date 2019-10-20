const EmailDetailHeader   = require('../email-header/email-detail-header/email-detail-header');
const EmailDetailTemplate = require('./email-detail.template');

module.exports = EmailDetail = {
  render(app, data) {
    let email_body = document.querySelector('.email-body')
    email_body.innerHTML = EmailDetailTemplate(data.selected_email);
    console.log(email_body);

    EmailDetailHeader.render(app, data);

    // this.attachEvents(app, data);
  },

  // attachEvents(app, data) {}
}