const saito = require('../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');
const EscrowAppspace = require('./lib/email-appspace/escrow-appspace');
const ArcadeEscrowSidebar = require('./lib/arcade-sidebar/escrow-sidebar');

class Escrow extends ModTemplate {

  constructor(app) {
    super(app);

    this.app            = app;
    this.name           = "Escrow";
    this.publickey      = app.wallet.returnPublicKey();

    this.escrow         = {};
    this.escrow.address	= "";
    this.escrow.balance	= 0.0;
    this.escrow.create_pending = 0;

    return this;
  }


  initialize(app) {
    super.initialize(app);
    if (app.options.escrow != undefined) {
      this.escrow.address = app.options.escrow.address;
      this.escrow.balance = app.options.escrow.balance;
      this.escrow.create_pending = app.options.escrow.create_pending;
    }
  }



  registerAccount() {

    let newtx = this.app.wallet.createUnsignedTransactionWithDefaultFee(this.app.wallet.returnPublicKey());
    if (newtx == null) {
      console.log("NULL TX CREATED IN REGISTRY MODULE")
      return 0;
    }
    newtx.transaction.msg.module        = this.name;
    newtx.transaction.msg.request       = "register account";
    newtx = this.app.wallet.signTransaction(newtx);
    this.app.network.propagateTransaction(newtx);

    return 1;

  }



  respondTo(type) {
    if (type == 'email-appspace') {
      let obj = {};
	  obj.render = this.renderEmail;
	  obj.attachEvents = this.attachEventsEmail;
      return obj;
    }
    if (type == 'arcade-sidebar') {
      let obj = {};
	  obj.render = this.renderArcadeSidebar;
	  obj.attachEvents = this.attachEventsArcadeSidebar;
      return obj;
    }
    return null;
  }
  renderEmail(app, data) {
     data.escrow = app.modules.returnModule("Escrow");;
     EscrowAppspace.render(app, data);
  }
  attachEventsEmail(app, data) {
     data.escrow = app.modules.returnModule("Escrow");;
     EscrowAppspace.attachEvents(app, data);
  }
  renderArcadeSidebar(app, data) {
     data.escrow = app.modules.returnModule("Escrow");;
     ArcadeEscrowSidebar.render(app, data);
  }
  attachEventsArcadeSidebar(app, data) {
     data.escrow = app.modules.returnModule("Escrow");;
     ArcadeEscrowSidebar.attachEvents(app, data);
  }




  saveEscrow() {
    this.app.options.escrow = Object.assign({}, this.app.options.escrow);
    this.app.options.escrow = this.escrow;
    this.app.storage.saveOptions();
  }


  returnCryptoBalances(mycallback) {
    mycallback(['balances']);
  }

  returnAccountHistory(mycallback) {
    mycallback(['history']);
  }




  async onConfirmation(blk, tx, conf, app) {

    let escrow_self = app.modules.returnModule("Escrow");
    let txmsg = tx.returnMessage();

    if (conf == 0) {
      if (txmsg.module == escrow_self.name) {

	//if (tx.isFrom(escrow_self.publickey) && tx.isTo(app.wallet.returnPublicKey())) {
	if (tx.transaction.to[0].add == app.wallet.returnPublicKey()) {
	  if (txmsg.request === "account balance") {

	    escrow_self.escrow.address = txmsg.address;
	    escrow_self.escrow.balance = txmsg.balance;
	    escrow_self.escrow.create_pending = 0;
	    escrow_self.saveEscrow();

alert("SAVING ESCROW: " + txmsg.address);

	  }
	}


        //if (tx.isTo(escrow_self.publickey)) {
        if (1) {

	  if (txmsg.request === "register account") {

	    let sql = "";
	    let params = "";


	    //
	    // generate new crypto address
	    //
	    let new_crypto_privatekey = app.crypto.generateKeys();
	    let new_crypto_publickey  = app.crypto.returnPublicKey(new_crypto_privatekey);


	    //
	    // insert new users
	    //
	    sql = "INSERT INTO users (publickey) VALUES ($publickey)";
	    params = {
	        $publickey	:	tx.transaction.from[0].add
	    }
	    await escrow_self.app.storage.executeDatabase(sql, params, "escrow");


	    //
	    // get user-id
	    //
	    sql = "SELECT id FROM users WHERE publickey = $publickey";
	    params = {
	        $publickey	:	tx.transaction.from[0].add
	    }
	    let rows = await escrow_self.app.storage.queryDatabase(sql, params, "escrow");
console.log("ROWS: " + rows);
	    if (rows == null) { return; }
	    if (rows.length <= 0) { return; }
	    let user_id = rows[0].id;

console.log("INSERT KEYS INTO USERBASE: ");
	    //
	    // insert key into database
	    //
	    sql = "INSERT INTO keys (user_id, publickey, privatekey) VALUES ($user_id, $publickey, $privatekey)";
	    params = {
		$user_id	:	user_id ,
		$publickey	:	new_crypto_publickey ,
		$privatekey	:	new_crypto_privatekey
	    }
	    await escrow_self.app.storage.executeDatabase(sql, params, "escrow");

console.log("INSERT KEYS INTO USERBASE: ");


	    //
	    // inform user of tbeir deposit address and balance
	    //
	    escrow_self.sendAccountBalance(tx.transaction.from[0].add, new_crypto_publickey, 0.0);

	  }
	}


      }
    }
  }

  

  sendAccountBalance(recipient, address="", balance=0.0) {

    let newtx = this.app.wallet.createUnsignedTransactionWithDefaultFee(recipient);
    if (newtx == null) {
      console.log("NULL TX CREATED IN REGISTRY MODULE")
      return;
    }

    newtx.transaction.msg.module        = this.name;
    newtx.transaction.msg.request       = "account balance";
    newtx.transaction.msg.address	= address;
    newtx.transaction.msg.balance	= balance;

    newtx = this.app.wallet.signTransaction(newtx);
    this.app.network.propagateTransaction(newtx);

  }


}


module.exports = Escrow;

