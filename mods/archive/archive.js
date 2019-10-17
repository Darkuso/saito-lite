const saito = require('../../lib/saito/saito.js');
const ModTemplate = require('../../lib/templates/modtemplate');


class Archive extends ModTemplate {

  constructor(app) {

    super(app);
    this.name = "Archive";
    this.events = [];

  ***REMOVED***


  async installModule(app) {

    await super.installModule(app);

    let sql = 'INSERT INTO records (sig, publickey, tx, ts, type) VALUES ("sig", "publickey", "transaction", 1332, "email")';
    await app.storage.executeDatabase(sql, {***REMOVED***, "archive");

  ***REMOVED***


  async handlePeerRequest(app, req, peer, mycallback) {

    if (req.request == null) { return; ***REMOVED***
    if (req.data == null) { return; ***REMOVED***

    //
    // only handle archive request
    //
    if (req.request == "archive") {

      if (req.data.request == "save") {
	this.saveTransaction(req.data.tx);
  ***REMOVED***


      if (req.data.request == "load") {

console.log("WE RECEIVED A REQUEST TO LOAD A TRANSACTION");
	

	let type = "";
	let num  = 50;

	if (req.data.num != "")  { num = req.data.num; ***REMOVED***
	if (req.data.type != "") { num = req.data.type; ***REMOVED***

	let txs = await this.loadTransactions(type, num);

console.log("AND WE FOUND THESE TRANSACTIONS: " + JSON.stringify(txs));

	let response = {***REMOVED***;
	    response.err = "";
	    response.txs = txs;

	mycallback(response);

  ***REMOVED***
***REMOVED***
  ***REMOVED***



  saveTransaction(tx=null) {

console.log("\n\n\n SAVING A TRANSACTION IN THE SERVER MODULE \n\n\n");

  ***REMOVED***


  async loadTransactions(type, num) {

    let sql = "SELECT * FROM records";
    let params = {***REMOVED***;

    let rows = this.app.storage.queryDatabase(sql, params, "records");

    console.log("\n WE HAVE LOADED THE FOLLOWING ROWS FROM DB FOR RETURN TO CLIENT: " + JSON.stringify(rows));

    let txs = [];
    for (let i = 0; i < rows.length; i++) {
      txs.push(rows[i].tx);
***REMOVED***

    return txs;

  ***REMOVED***


***REMOVED***


module.exports = Archive;

