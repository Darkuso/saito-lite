const EmailInboxHeader = require('./email-inbox-header/email-inbox-header');
const EmailDetailHeader = require('./email-detail-header/email-detail-header');
const EmailFormHeader = require('./email-form-header/email-form-header');
const EmailAppspaceHeader = require('./email-appspace-header/email-appspace-header');

module.exports = EmailHeader = {

  render(app, data) {

    data.email.header = this;

    switch(data.email.active) {
      case "email_list":
        EmailInboxHeader.render(app, data);
        EmailInboxHeader.attachEvents(app, data);
        break;
      case "email_detail":
        EmailDetailHeader.render(app, data);
        EmailDetailHeader.attachEvents(app, data);
        break;
      case "email_form":
        EmailFormHeader.render(app, data);
        EmailFormHeader.attachEvents(app, data);
        break;
      case "email_appspace":
        EmailAppspaceHeader.render(app, data);
        EmailAppspaceHeader.attachEvents(app, data);
        break;
      default:
        break;
***REMOVED***

    data.email.updateBalance();

  ***REMOVED***,

  attachEvents(app, data) {***REMOVED***,

***REMOVED***
