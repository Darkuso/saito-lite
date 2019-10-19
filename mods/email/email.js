const saito = require('../../lib/saito/saito.js');
const ModTemplate = require('../../lib/templates/modtemplate');
const EmailContainer = require('./lib/email-container/email-container');

// external dependency
const numeral = require('numeral');

class Email extends ModTemplate {

  constructor(app) {
    super(app);

    this.name 		= "Email";
    this.chat 		= null;

    this.emails 	= {};
    this.emails.inbox 	= [];
    this.emails.outbox 	= [];
    this.emails.trash 	= [];

    this.mods   	= [];

    this.emails.inbox.push({
      title: "New Email",
      message: "This is a new email, just for you!",
      timestamp: new Date().getTime(),
    });

  }


  initialize(app) {

    //
    // what does this do? function names do not adequately indicate purpose 
    //
    this.mods = this.app.modules.implementsKeys([
      'afterRender',
      'returnHTML',
      'returnButtonHTML',
    ]);

  }


  initializeHTML(app) {

    //
    // add all HTML elements to DOM
    //
    EmailContainer.render(this);

    //
    // update apps in sidebar
    //
    EmailControls.render(this.app, this.mods);


    //
    // update chat module
    //
    let chatManager = app.modules.returnModule("Chat");
    this.chat = chatManager.respondTo("email");

  }



  //
  // load transactions into interface when the network is up
  //
  onPeerHandshakeComplete(app, peer) {

    //
    // leaving this here for the short term,
    // token manager can be a separate module
    // in the long-term, as the email client
    // should just handle emails
    //
    this.getTokens();

    this.app.storage.loadTransactions("Email", 50, (txs) => {

      //for (let i = 0; i < txs.length; i++) {

	let msg = {};
	    msg.title = "Loaded from remote server";
	    msg.message = "This email is not actually loaded from a remote server, but once the archives are saving transactions and returning them instead of just dummy text, we can easily correct this.";
	    msg.timestamp = new Date().getTime();

	this.emails.unshift(msg);
	EmailList.render(this);

        //this.addEmail(msg);

      //}

    });

    if (this.app.BROWSER) { EmailList.render(this); }
  }



  onConfirmation(blk, tx, conf, app) {

    let txmsg = tx.returnMessage();
    let email = app.modules.returnModule("Email");

    if (conf == 0) {

      //
      // if transaction is for me
      //
      if (tx.isTo(app.wallet.returnPublicKey())) {

        //
        // great lets save this
        //
        app.storage.saveTransaction(tx);

        //
        // and update our email client
        //
        email.addEmail(tx);
      }
    }
  }


  addEmail(tx) {
    let {title, message} = tx.returnMessage();
    this.emails.unshift({title, message, timestamp: tx.transaction.ts});
    if (this.app.BROWSER) { EmailList.render(this); }
  }


  getTokens() {
    let msg = {};
    msg.data = {address: this.app.wallet.returnPublicKey()};
    msg.request = 'get tokens';
    setTimeout(() => {
        this.app.network.sendRequest(msg.request, msg.data);
    }, 1000);
  }

  updateBalance() {
    if (this.app.BROWSER) {
      document.querySelector('.email-balance').innerHTML
        = numeral(this.app.wallet.returnBalance()).format('0,0.0000');
    }
  }

}

module.exports = Email;
