var saito = require('../../lib/saito/saito');
var ModTemplate = require('../../lib/templates/modtemplate');



class Relay extends ModTemplate {

  constructor(app) {

    super(app);

    this.app            = app;
    this.name           = "Relay";

    return this;
  ***REMOVED***



  //
  // currently a 1-hop function, should abstract to take an array of
  // recipients and permit multi-hop transaction construction.
  //
  sendRelayMessage(recipients, message_request, message_data) {

    //
    // recipient can be an array
    //
    if (Array.isArray(recipients)) {
***REMOVED*** else {
      recipient = recipients;
      recipients = [];
      recipients.push(recipient);
***REMOVED***

    //
    // transaction to end-user, containing msg.request / msg.data is
    //
    let tx3 = new saito.transaction();
    tx3.transaction.from.push(new saito.slip(this.app.wallet.returnPublicKey()));
    for (let i = 0; i < recipients.length; i++) {
      tx3.transaction.to.push(new saito.slip(recipients[i]));
***REMOVED***
console.log("SENDING INNERMOST: " + JSON.stringify(tx3.transaction.to));
    tx3.transaction.ts   = new Date().getTime();
    tx3.transaction.msg.request 	= message_request;
    tx3.transaction.msg.data 	= message_data;
    tx3 = this.app.wallet.signTransaction(tx3);

    //
    // ... wrapped in transaction to end-user (routing from relay)
    //
    let tx2 = tx3;

    //
    // ... wrapped in transaction to relaying peer
    //
    for (let i = 0; i < this.app.network.peers.length; i++) {
      if (this.app.network.peers[i].peer.modules.includes(this.name)) {
        let peer = this.app.network.peers[i];

	if (!recipients.includes(peer.peer.publickey)) {

          let tx = new saito.transaction();
          tx.transaction.from.push(new saito.slip(this.app.wallet.returnPublicKey()));
          for (let i = 0; i < recipients.length; i++) {
            tx.transaction.to.push(new saito.slip(recipients[i]));
      ***REMOVED***
console.log("SENDING MIDDLE: " + JSON.stringify(tx.transaction.to));
          tx.transaction.ts   = new Date().getTime();
          tx.transaction.msg = tx3.transaction;
          tx = this.app.wallet.signTransaction(tx);

          tx2 = new saito.transaction();
          tx2.transaction.from.push(new saito.slip(this.app.wallet.returnPublicKey()));
          tx2.transaction.to.push(new saito.slip(peer.peer.publickey));
console.log("SENDING OUTER: " + JSON.stringify(tx2.transaction.to));
          tx2.transaction.ts   	= new Date().getTime();
          tx2.transaction.msg 	= tx.transaction;
          tx2 = this.app.wallet.signTransaction(tx2);

    ***REMOVED***

***REMOVED***
***REMOVED*** forward to peer
***REMOVED***
        peer.sendRequestWithCallback("relay peer message", tx2.transaction, function(res) {
console.log("CALLBACK SENT FROM RELAY sendRelayMessage" + JSON.stringify(res));
    ***REMOVED***);

  ***REMOVED***
***REMOVED***

    return;

  ***REMOVED***


  //
  // database queries inbound here
  //
  async handlePeerRequest(app, message, peer, mycallback=null) {

    try {

      let relay_self = app.modules.returnModule("Relay");

      if (message.request === "relay peer message") {

***REMOVED***
***REMOVED*** sanity check on tx
***REMOVED***
        let txobj = message.data;
        let tx = new saito.transaction(message.data);

console.log("RELAY 3: " + JSON.stringify(tx));

        if (tx.transaction.to.length <= 0) { return; ***REMOVED***
        if (tx.transaction.to[0].add == undefined) { return; ***REMOVED***

console.log("RELAY 4: " + tx.returnMessage());

***REMOVED***
***REMOVED*** get the inner-tx / tx-to-relay
***REMOVED***
***REMOVED***
        let tx2 = new saito.transaction(tx.returnMessage());

console.log("RELAY 5: " + JSON.stringify(tx2));
***REMOVED***
***REMOVED*** is original tx addressed to me
***REMOVED***
console.log("RELAY 6");

        if (tx.isTo(app.wallet.returnPublicKey()) && txmsg.request != undefined) {

console.log("EXECUTING RELAYED MSG!");

          app.modules.handlePeerRequest(txmsg, peer, mycallback);
          if (mycallback != null) { mycallback({ err : "" , success : 1 ***REMOVED***); ***REMOVED***

    ***REMOVED*** else {

console.log("RELAY 7");
          let peer_found = 0;
console.log("CHECK TX2 TO: " + JSON.stringify(tx2.transaction.to));

console.log("NUMBER OF PEERS: " + app.network.peers.length);

          for (let i = 0; i < app.network.peers.length; i++) {
console.log("PEER: " + app.network.peers[i].peer.publickey);
            if (tx2.isTo(app.network.peers[i].peer.publickey)) {
              peer_found = 1;
              app.network.peers[i].sendRequest("relay peer message", tx2.transaction.msg, function() {
	        if (mycallback != null) {
                  mycallback({ err : "" , success : 1 ***REMOVED***);
		***REMOVED***
          ***REMOVED***);
        ***REMOVED*** else {
console.log("TX2 is not for this peer!");
	***REMOVED***
      ***REMOVED***
          if (peer_found == 0) {
	    if (mycallback != null) {
              mycallback({ err : "ERROR 141423: peer not found in relay module" , success : 0 ***REMOVED***);
	***REMOVED***
      ***REMOVED***
    ***REMOVED***
  ***REMOVED***
***REMOVED*** catch (err) {
console.log("ERROR: " + err);
***REMOVED***
  ***REMOVED***
***REMOVED***

module.exports = Relay;

