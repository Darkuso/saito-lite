***REMOVED***
const ModTemplate = require('../../lib/templates/modtemplate');
const AppStoreAppspace = require('./lib/email-appspace/appstore-appspace');
const AppStoreSearch = require('./lib/email-appspace/appstore-search');



class AppStore extends ModTemplate {

  constructor(app) {
    super(app);

    this.app            = app;
    this.name           = "AppStore";

    return this;
  ***REMOVED***




  respondTo(type) {
    if (type == 'email-appspace') {
      let obj = {***REMOVED***;
	  obj.render = this.renderEmail;
	  obj.attachEvents = this.attachEventsEmail;
      return obj;
***REMOVED***
    return null;
  ***REMOVED***
  renderEmail(app, data) {
     data.appstore = app.modules.returnModule("AppStore");
     AppStoreAppspace.render(app, data);
     AppStoreSearch.render(app, data);
  ***REMOVED***
  attachEventsEmail(app, data) {
     data.appstore = app.modules.returnModule("AppStore");
     AppStoreAppspace.attachEvents(app, data);
     AppStoreSearch.attachEvents(app, data);
  ***REMOVED***



  //
  // database queries inbound here
  //
  async handlePeerRequest(app, message, peer, mycallback=null) {

    if (message.request === "appstore load modules") {

      let sql = "SELECT * FROM modules";
      let params = {***REMOVED***;
      let rows = await this.app.storage.queryDatabase(sql, params, message.data.dbname);

      let res = {***REMOVED***;
          res.err = "";
          res.rows = rows;

      mycallback(res);

***REMOVED***
  ***REMOVED***



  initialize(app) {
    super.initialize(app);

    let sql = "INSERT INTO modules (name, description, version, publickey, unixtime, bid, bsh, tx) VALUES ($name, $description, $version, $publickey, $unixtime, $bid, $bsh, $tx)";
    let params = {
	  $name		:	"Application Name" ,
	  $description	:	"Application Description" ,
	  $version	:	1234 ,
	  $publickey	:	"1241231" ,
	  $unixtime	:	1234 ,
	  $bid		:	413 ,
	  $bsh		:	"513123" ,
	  $tx		:	"this is the transaction"
***REMOVED***
    app.storage.executeDatabase(sql, params, "appstore");

  ***REMOVED***


  onConfirmation(blk, tx, conf, app) {

    let appstore_self = app.modules.returnModule("AppStore");
    let txmsg = tx.returnMessage();

    if (conf == 0) {

      if (txmsg.request == "submit module") {

	let sql = "INSERT INTO modules (name, description, version, publickey, unixtime, bid, bsh, tx) VALUES ($name, $description, $version, $publickey, $unixtime, $bid, $bsh, $ts)";
	let params = {
	  $name		:	"Application " + tx.transaction.ts ,
	  $description	:	"Application " + tx.transaction.ts ,
	  $version	:	tx.transaction.ts ,
	  $publickey	:	tx.transaction.from[0].add ,
	  $unixtime	:	tx.transaction.ts ,
	  $bid		:	blk.block.id ,
	  $bsh		:	blk.returnHash() ,
	  $tx		:	JSON.stringify(tx.transaction)
	***REMOVED***
	this.executeDatabase(sql, params, "appstore");

console.log(sql);
console.log(params);

  ***REMOVED***

***REMOVED***

  ***REMOVED***
***REMOVED***




module.exports = AppStore;


