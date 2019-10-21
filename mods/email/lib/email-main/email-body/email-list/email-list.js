const EmailDetail       = require('../email-detail/email-detail');
const EmailHeader       = require('../../email-header/email-header');
const EmailListTemplate = require('./email-list.template.js');
const EmailListRowTemplate = require('./email-list-row.template.js');

module.exports = EmailList = {

    render(app, data) {

      data.parentmod.emails[data.parentmod.emails.active].forEach(tx => {
        document.querySelector('.email-list').innerHTML += EmailListRowTemplate(tx);
      });

    },

    attachEvents(app, data) {

        Array.from(document.getElementsByClassName('email-message')).forEach(message => {
            message.addEventListener('click', (e) => {
                if (e.srcElement.nodeName == "INPUT") { return; }

                let sig = e.currentTarget.id;
                let selected_email = data.parentmod.emails[data.parentmod.emails.active].filter(tx => {
                    return tx.transaction.sig === sig
                });

                data.parentmod.selected_email = selected_email[0];
                data.parentmod.header = 0;
		data.parentmod.header_title = data.parentmod.selected_email.transaction.msg.title;
                data.emailList = this;

                EmailHeader.render(app, data);
                EmailHeader.attachEvents(app, data);

                EmailDetail.render(app, data);

            });
        });

    }
}

