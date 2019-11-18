/*********************************************************************************
  
 ENCRYPT MODULE v.2

 This is a general encryption class that permits on-chain exchange of cryptographic
 secrets, enabling users to communicate with encrypted messages over the blockchain.

 For N > 2 channels, we avoid Diffie-Hellman exchanges *for now* in order to have
 something that is fast to setup, and simply default to having the initiating user
 provide the secret, but only communicating it to members with whom he/she already
 has a shared-secret.

 This module thus does two things:
 
   1. create Diffie-Hellman key exchanges (2 parties)
   2. distribute keys for Groups using DH-generated keys

 The keys as well as group members / shared keys are saved in the keychain class,
 where they are generally available for any Saito application to leverage.

*********************************************************************************/
var saito = require('../../lib/saito/saito');
var ModTemplate = require('../../lib/templates/modtemplate');
const Big = require('big.js');


class Encrypt extends ModTemplate {

  constructor(app) {
    super(app);

    this.app            = app;
    this.name           = "Encrypt";

    return this;
  }




  respondTo(type) {
    if (type == 'email-appspace') {
      let obj = {};
	  obj.render = this.renderEmail;
	  obj.attachEvents = this.attachEventsEmail;
      return obj;
    }
    return null;
  }
  renderEmail(app, data) {
     let EncryptAppspace = require('./lib/email-appspace/encrypt-appspace');
     EncryptAppspace.render(app, data);
  }
  attachEventsEmail(app, data) {
     EncryptAppspace.attachEvents(app, data);
  }



  //
  // recipients can be a string (single address) or an array (multiple addresses)
  //
  initiate_key_exchange(recipients) {

    let recipient = "";
    let parties_to_exchange = 2;

    if (Array.isArray(recipients)) {
      if (recipients.length > 0) {
        recipients.sort();
        recipient = recipients[0]; 
	parties_to_exchange = recipients.length;
      }
      else {
	recipient = recipients;
	parties_to_exchange = 2;
      }
    }


    if (recipient == "") { return; }

    let tx = this.app.wallet.createUnsignedTransactionWithDefaultFee(recipient, (parties_to_exchange * this.app.wallet.wallet.default_fee)); 
        tx.transaction.msg.module	   = this.name;
  	tx.transaction.msg.request 	   = "key exchange request";
	tx.transaction.msg.alice_publickey = this.app.keys.initializeKeyExchange(recipient);

    if (parties_to_exchange > 2) {
      for (let i = 1; i < parties_to_exchange; i++) {
        tx.transaction.to.push(new saito.slip(recipients[i], 0.0));
      }
    }

    tx = this.app.wallet.signTransaction(tx);
    this.app.network.propagateTransaction(tx);

  }

  accept_key_exchange(tx) {

    let txmsg = tx.returnMessage();

/****
    let recipients = [];
    for (let z = 0; z < tx.transaction.to.length; z++) {
      recipients.push(tx.transaction.to[z].add);
    }
    recipients.push(tx.transaction.from[0].add);

    //
    // make array unique
    //
    recipients = a.filter(function(item, pos) { return a.indexOf(item) == pos; })
****/
    let remote_address  = tx.transaction.from[0].add;
    let our_address    	= tx.transaction.to[0].add;
    let alice_publickey	= txmsg.alice_publickey;

    let fee = tx.transaction.to[0].amt;

console.log("ACCEPT KEY EXCHANGE 1");

    let bob              = this.app.crypto.createDiffieHellman();
    let bob_publickey    = bob.getPublicKey(null, "compressed").toString("hex");
    let bob_privatekey   = bob.getPrivateKey(null, "compressed").toString("hex");
    let bob_secret       = this.app.crypto.createDiffieHellmanSecret(bob, Buffer.from(alice_publickey, "hex"));

console.log("ACCEPT KEY EXCHANGE 2");

    var newtx = this.app.wallet.createUnsignedTransaction(remote_address, 0, fee);  
    if (newtx == null) { return; }
    newtx.transaction.msg.module   = "Encrypt";
    newtx.transaction.msg.request  = "key exchange confirm";
    newtx.transaction.msg.tx_id    = tx.transaction.id;		// reference id for parent tx
    newtx.transaction.msg.bob      = bob_publickey;
    newtx = this.app.wallet.signTransaction(newtx);

console.log("ACCEPT KEY EXCHANGE 3");

    this.app.network.propagateTransaction(newtx);

console.log("\n\nUPDATE CRYPTO BY PUBLICKEY: ");

    this.app.keys.updateCryptoByPublicKey(remote_address, bob_publickey.toString("hex"), bob_privatekey.toString("hex"), bob_secret.toString("hex"));
    this.sendEvent('encrypt-key-exchange-confirm', { members : [remote_address, our_address] });

console.log("ACCEPT KEY EXCHANGE 4");

  }




  onConfirmation(blk, tx, conf, app) {

    let encrypt_self = app.modules.returnModule("Encrypt");

    if (conf == 0) {

console.log("ENCRPYT TX: " + JSON.stringify(tx.transaction));

console.log("encrypt onConfirmation 1: " + tx.transaction.to[0].add + " --- " + app.wallet.returnPublicKey());


      if (tx.transaction.from[0].add == app.wallet.returnPublicKey()) {
console.log("encrypt onConfirmation 2!");
	encrypt_self.sendEvent('encrypt-key-exchange-confirm', { publickey : tx.transaction.to[0].add });
      }
      if (tx.transaction.to[0].add === app.wallet.returnPublicKey()) {

console.log("encrypt onConfirmation 2!");

        let sender           = tx.transaction.from[0].add;
        let receiver         = tx.transaction.to[0].add;
        let txmsg            = tx.returnMessage();
        let request          = txmsg.request;  // "request"
        if (app.keys.alreadyHaveSharedSecret(sender)) { return; }

        //
        // key exchange requests
        //
        if (txmsg.request == "key exchange request") {
          if (sender == app.wallet.returnPublicKey()) {
  	    console.log("\n\n\nYou have sent an encrypted channel request to " + receiver);
          }
          if (receiver == app.wallet.returnPublicKey()) {
	    console.log("\n\n\nYou have accepted an encrypted channel request from " + receiver);
            encrypt_self.accept_key_exchange(tx);
          }
        }

        //
        // key confirm requests
        //
        if (txmsg.request == "key exchange confirm") {

console.log("encrypt onConfirmation 3!");

          let bob_publickey = Buffer.from(txmsg.bob, "hex");;
          var senderkeydata = app.keys.findByPublicKey(sender);
          if (senderkeydata == null) { 
	    if (app.BROWSER == 1) {
	      alert("Cannot find original diffie-hellman keys for key-exchange");
	      return;
	    }
          }
          let alice_publickey  = Buffer.from(senderkeydata.aes_publickey, "hex");
          let alice_privatekey = Buffer.from(senderkeydata.aes_privatekey, "hex");
          let alice            = app.crypto.createDiffieHellman(alice_publickey, alice_privatekey);
          let alice_secret     = app.crypto.createDiffieHellmanSecret(alice, bob_publickey);
          app.keys.updateCryptoByPublicKey(sender, alice_publickey.toString("hex"), alice_privatekey.toString("hex"), alice_secret.toString("hex"));

	  //
	  //
	  //
	  encrypt_self.sendEvent('encrypt-key-exchange-confirm', { publickey : sender });

        }
      }
    }
  }
}




module.exports = Encrypt;

