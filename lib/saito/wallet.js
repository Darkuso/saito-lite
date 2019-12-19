'use strict';

const saito = require('./saito');
const Big      = require('big.js');

/**
 * Mempool Constructor
 * @param {****REMOVED*** app
 */
class Wallet {

  constructor(app) {

    if (!(this instanceof Wallet)) {
      return new Wallet(app);
***REMOVED***

    this.app     			= app || {***REMOVED***;

    this.wallet			= {***REMOVED***;
    this.wallet.balance 	= "0";
    this.wallet.publickey 	= "";
    this.wallet.privatekey 	= "";

    this.wallet.inputs                = [];
    this.wallet.outputs               = [];
    this.wallet.spends                = [];	// spent but still around
    this.wallet.default_fee           = 2;
    this.wallet.version               = 2.17;
    this.wallet.pending               = [];       // sent but not seen

    this.inputs_hmap 		      = [];
    this.inputs_hmap_counter		= 0;
    this.inputs_hmap_counter_limit	= 10000;
    this.outputs_hmap 		      = [];
    this.outputs_hmap_counter		= 0;
    this.outputs_hmap_counter_limit	= 10000;

    this.recreate_pending_transactions = 0;

    return this;
  ***REMOVED***


  addInput(x) {

    //////////////
    // add slip //
    //////////////
    //
    // we keep our slip array sorted according to block_id
    // so that we can (1) spend the earliest slips first,
    // and (2) simplify deleting expired slips
    //
    let pos = this.wallet.inputs.length;
    while (pos > 0 && this.wallet.inputs[pos-1].bid > x.bid) { pos--; ***REMOVED***
    if (pos == -1) { pos = 0; ***REMOVED***

    this.wallet.inputs.splice(pos, 0, x);
    this.wallet.spends.splice(pos, 0, 0);

    let hmi = x.returnSignatureSource(x);
    this.inputs_hmap[hmi] = 1;
    this.inputs_hmap_counter++;


    ////////////////////////
    // regenerate hashmap //
    ////////////////////////
    //
    // we want to periodically re-generate our hashmaps
    // that help us check if inputs and outputs are already
    // in our wallet for memory-management reasons and
    // to maintain reasonable accuracy.
    //
    if (this.inputs_hmap_counter > this.inputs_hmap_counter_limit) {

      this.inputs_hmap = [];
      this.outputs_hmap = [];
      this.inputs_hmap_counter = 0;
      this.outputs_hmap_counter = 0;

      for (let i = 0; i < this.wallet.inputs.length; i++) {
        let hmi = this.wallet.inputs[i].returnSignatureSource();
        this.inputs_hmap[hmi] = 1;
  ***REMOVED***

      for (let i = 0; i < this.wallet.outputs.length; i++) {
        let hmi = this.wallet.outputs[i].returnSignatureSource();
        this.outputs_hmap[hmi] = 1;
  ***REMOVED***
***REMOVED***
    return;
  ***REMOVED***



  addOutput(x) {

    //////////////
    // add slip //
    //////////////
    this.wallet.outputs.push(x);
    let hmi = x.returnSignatureSource();
    this.outputs_hmap[hmi] = 1;
    this.outputs_hmap_counter++;

    ///////////////////////
    // purge old outputs //
    ///////////////////////
    if (this.output_hmap_counter >= this.output_hmap_counter_limit) {
      console.log("Deleting Excessive outputs from heavy-spend wallet...");
      this.wallet.output.splice(0, this.wallet.output.length-this.output_storage_limit);
      this.output_storage_counter = 0;
***REMOVED***
    return;

  ***REMOVED***


  containsInput(s) {
    let hmi = s.returnSignatureSource();
    if (this.inputs_hmap[hmi] == 1) { return true; ***REMOVED***
    return false;
  ***REMOVED***


  containsOutput(s) {
    let hmi = s.returnSignatureSource();
    if (this.outputs_hmap[hmi] == 1) { return true; ***REMOVED***
    return false;
  ***REMOVED***


  addTransactionToPending(tx) {
    let txjson = JSON.stringify(tx.transaction);
    if (! this.wallet.pending.includes(txjson)) {
      this.wallet.pending.push(txjson);
      this.saveWallet();
***REMOVED*** else {
      //alert("DOUBLEADD to PENDING: " + JSON.stringify(tx.transaction.msg));
***REMOVED***
  ***REMOVED***


  doesSlipInPendingTransactionsSpendBlockHash(bsh="") {
    if (bsh == "") { return false; ***REMOVED***
    for (let i = 0; i < this.wallet.pending.length; i++) {
      let ptx = new saito.transaction(JSON.parse(this.wallet.pending[i]));
      for (let k = 0; k < ptx.transaction.from.length; k++) {
        if (ptx.transaction.from[k].bsh == bsh) {
          return true;
    ***REMOVED***
  ***REMOVED***
***REMOVED***
    return false;
  ***REMOVED***


  initialize(app) {

    if (this.wallet.privatekey == "") {
      if (this.app.options.wallet != null) {

***REMOVED***///////////
***REMOVED*** upgrade //
***REMOVED***///////////
        if (this.app.options.wallet.version < this.wallet.version) {

          if (this.app.BROWSER == 1) {

            this.app.options.wallet.version = this.wallet.version;

            let tmpprivkey = this.app.options.wallet.privatekey;
            let tmppubkey = this.app.options.wallet.publickey;

    ***REMOVED*** specify before reset to avoid archives reset problem
            this.wallet.publickey = tmppubkey;
            this.wallet.privatekey = tmpprivkey;

    ***REMOVED*** reset and save
            this.app.storage.resetOptions();
            this.app.storage.saveOptions();

    ***REMOVED*** re-specify after reset
            this.wallet.publickey = tmppubkey;
            this.wallet.privatekey = tmpprivkey;

            this.app.options.wallet = this.wallet;
            this.saveWallet();

    ***REMOVED*** reset blockchain
            this.app.options.blockchain.last_bid = "";
            this.app.options.blockchain.last_hash = "";
            this.app.options.blockchain.last_ts = "";

            salert("Saito Upgrade: Wallet Reset");

      ***REMOVED***
    ***REMOVED***
        this.wallet = Object.assign(this.wallet, this.app.options.wallet);
  ***REMOVED***

      ////////////////
      // new wallet //
      ////////////////
      if (this.wallet.privatekey == "") {
	this.resetWallet();
  ***REMOVED***
***REMOVED***


    //////////////////
    // import slips //
    //////////////////
    this.wallet.spends = []
    if (this.app.options.wallet != null) {

      if (this.app.options.wallet.inputs != null) {
        for (let i = 0; i < this.app.options.wallet.inputs.length; i++) {
          this.wallet.inputs[i] = new saito.slip(
            this.app.options.wallet.inputs[i].add,
            this.app.options.wallet.inputs[i].amt,
            this.app.options.wallet.inputs[i].type,
            this.app.options.wallet.inputs[i].bid,
            this.app.options.wallet.inputs[i].tid,
            this.app.options.wallet.inputs[i].sid,
            this.app.options.wallet.inputs[i].bsh,
            this.app.options.wallet.inputs[i].lc,
            this.app.options.wallet.inputs[i].rn
          );
          this.wallet.spends.push(0);

  ***REMOVED***//////////////////
  ***REMOVED*** update hashmap //
  ***REMOVED***//////////////////
          let hmi = this.wallet.inputs[i].returnSignatureSource();
          this.inputs_hmap[hmi] = 1;
          this.inputs_hmap_counter++;

    ***REMOVED***
  ***REMOVED***
      if (this.app.options.wallet.outputs != null) {
        for (let i = 0; i < this.app.options.wallet.outputs.length; i++) {
          this.wallet.outputs[i] = new saito.slip(
            this.app.options.wallet.outputs[i].add,
            this.app.options.wallet.outputs[i].amt,
            this.app.options.wallet.outputs[i].type,
            this.app.options.wallet.outputs[i].bid,
            this.app.options.wallet.outputs[i].tid,
            this.app.options.wallet.outputs[i].sid,
            this.app.options.wallet.outputs[i].bsh,
            this.app.options.wallet.outputs[i].lc,
            this.app.options.wallet.outputs[i].rn
          );


  ***REMOVED***//////////////////
  ***REMOVED*** update hashmap //
  ***REMOVED***//////////////////
          let hmi = this.wallet.outputs[i].returnSignatureSource();
          this.outputs_hmap[hmi] = 1;
          this.outputs_hmap_counter++;

    ***REMOVED***
  ***REMOVED***
***REMOVED***


    //
    // check pending transactions and update spent slips
    //
    for (let z = 0; z < this.wallet.pending.length; z++) {
      let ptx = new saito.transaction(JSON.parse(this.wallet.pending[z]));

      for (let y = 0; y < ptx.transaction.from.length; y++) {

        let spent_slip = ptx.transaction.from[y];

        let ptx_bsh = spent_slip.bsh;
        let ptx_bid = spent_slip.bid;
        let ptx_tid = spent_slip.tid;
        let ptx_sid = spent_slip.sid;

        for (let x = 0; x < this.wallet.inputs.length; x++) {
          if (this.wallet.inputs[x].bid == ptx_bid) {
            if (this.wallet.inputs[x].tid == ptx_tid) {
              if (this.wallet.inputs[x].sid == ptx_sid) {
                if (this.wallet.inputs[x].bsh == ptx_bsh) {
                  this.wallet.spends[x] = 1;
                  x = this.wallet.inputs.length;
            ***REMOVED***
          ***REMOVED***
        ***REMOVED***
      ***REMOVED***
    ***REMOVED***
  ***REMOVED***
***REMOVED***

    //
    // listen to network conditions
    //
    this.app.connection.on('connection_up', (peer) => {
      this.rebroadcastPendingTransactions(peer);
***REMOVED***);

    //
    // re-implement
    //
    this.purgeExpiredSlips();
    this.updateBalance();
    this.saveWallet();

  ***REMOVED***


  //
  // if peer is not null, rebroadcast to that peer, else everyone
  //
  rebroadcastPendingTransactions(peer=null) {
  
    for (let i = 0; i < this.wallet.pending.length; i++) {
      let tx = new saito.transaction(JSON.parse(this.wallet.pending[i]));
      if (tx.transaction.type == 0) {
	if (peer == null) {
          this.app.network.propagateTransaction(tx);
	***REMOVED*** else {
          this.app.network.propagateTransaction(tx);
	***REMOVED***
  ***REMOVED*** else {
***REMOVED***
***REMOVED*** remove golden tickets and other unnecessary slips from pending
***REMOVED***
        this.app.wallet.wallet.pending.splice(i, 1);
        this.app.wallet.unspendInputSlips(tx);
        this.app.wallet.saveWallet();
        i--;
  ***REMOVED***
***REMOVED***
  ***REMOVED***



  unspendInputSlips(tmptx=null) {

    if (tmptx == null) { return; ***REMOVED***

    for (let i = 0; i < tmptx.transaction.from.length; i++) {

      let fsidx = tmptx.transaction.from[i].returnSignatureSource();

      for (let z = 0; z < this.wallet.inputs.length; z++) {
        if (fsidx == this.wallet.inputs[z].returnSignatureSource()) {
          this.wallet.spends[z] = 0;
    ***REMOVED***
  ***REMOVED***
***REMOVED***
  ***REMOVED***








  onChainReorganization(bid, bsh, lc) {

    if (lc == 1) {

      this.purgeExpiredSlips();
      this.resetSpentInputs();

      //
      // recreate pending slips
      //
      if (this.recreate_pending_transactions == 1) {
        for (let i = 0; i < this.wallet.pending.length; i++) {
          let ptx = new saito.transaction(JSON.parse(this.wallet.pending[i]));
          let newtx = this.createReplacementTransaction(ptx);
          if (newtx != null) {
            newtx = this.signTransaction(newtx);
            if (newtx != null) {
              this.wallet.pending[i] = JSON.stringify(newtx);
        ***REMOVED***
      ***REMOVED***
    ***REMOVED***
        this.recreate_pending_transactions = 0;
  ***REMOVED***

***REMOVED*** else {
      if (this.doesSlipInPendingTransactionsSpendBlockHash(bsh)) {
        this.recreate_pending_transactions = 1;
  ***REMOVED***
***REMOVED***

    this.resetExistingSlips(bid, bsh, lc);

  ***REMOVED***




  processPayments(blk, lc=0) {

    for (let i = 0; i < blk.transactions.length; i++) {

      let tx		  = blk.transactions[i];
      let slips           = tx.returnSlipsToAndFrom(this.returnPublicKey());
      let to_slips        = slips.to;
      let from_slips      = slips.from;

      //
      // update slips prior to insert
      //
      for (let ii = 0; ii < to_slips.length; ii++) {
	to_slips[ii].bid = blk.block.id;
	to_slips[ii].bsh = blk.returnHash();
	to_slips[ii].tid = tx.transaction.id;
	to_slips[ii].lc  = lc;
  ***REMOVED***

      //
      // any txs in pending should be checked to see if
      // we can remove them now that we have received
      // a transaction that might be it....
      //
      let removed_pending_slips = 0;
      if (this.wallet.pending.length > 0) {

        for (let i = 0; i < this.wallet.pending.length; i++) {

          let ptx = new saito.transaction(JSON.parse(this.wallet.pending[i]));

          if (this.wallet.pending[i].indexOf(tx.transaction.sig) > 0) {
            this.wallet.pending.splice(i, 1);
            i--;
            removed_pending_slips = 1;
      ***REMOVED*** else {

            if (ptx.transaction.type == 1) {

              this.wallet.pending.splice(i, 1);
	      this.unspendInputSlips(ptx);	      
              i--;
              removed_pending_slips = 1;

        ***REMOVED*** else {

      ***REMOVED***
      ***REMOVED*** 10% chance of deletion
      ***REMOVED***
              if (Math.random() <= 0.1) {

                let ptx_ts = ptx.transaction.ts;
                let blk_ts = blk.block.ts;

                if ((ptx_ts + 12000000) < blk_ts) {
                  this.wallet.pending.splice(i, 1);
		  this.unspendInputSlips(ptx);
                  removed_pending_slips = 1;
                  i--;
            ***REMOVED***
          ***REMOVED***
        ***REMOVED***
      ***REMOVED***
    ***REMOVED***
  ***REMOVED***
      if (removed_pending_slips == 1) {
        this.saveWallet(); 
  ***REMOVED***


      //
      // inbound payments
      //
      if (to_slips.length > 0) {
        for (let m = 0; m < to_slips.length; m++) {
          if (to_slips[m].amt > 0) {
            if (this.containsInput(to_slips[m]) == 0) {
              if (this.containsOutput(to_slips[m]) == 0) {
                this.addInput(to_slips[m]);
          ***REMOVED***
        ***REMOVED*** else {
	      if (lc == 1) {
              	let our_index = to_slips[m].returnSignatureSource();
              	for (let n = this.wallet.inputs.length-1; n >= 0; n--) {
                  if (this.wallet.inputs[n].returnSignatureSource() === our_index) {
                    this.wallet.inputs[n].lc = lc;
              ***REMOVED***
		***REMOVED***
          ***REMOVED***
        ***REMOVED***
      ***REMOVED***
    ***REMOVED***
  ***REMOVED***


      //
      // outbound payments
      //
      if (from_slips.length > 0) {
        for (var m = 0; m < from_slips.length; m++) {
          var s = from_slips[m];

          for (var c = 0; c < this.wallet.inputs.length; c++) {
            var qs = this.wallet.inputs[c];
            if (
              s.bid   == qs.bid &&
              s.tid   == qs.tid &&
              s.sid   == qs.sid &&
              s.bhash == qs.bhash &&
              s.amt   == qs.amt &&
              s.add   == qs.add
            ) {
              if (this.containsOutput(s) == 0) {
                this.addOutput(this.wallet.inputs[c]);
          ***REMOVED***
              this.wallet.inputs.splice(c, 1);
              this.wallet.spends.splice(c, 1);
              c = this.wallet.inputs.length+2;
        ***REMOVED***
      ***REMOVED***
    ***REMOVED***
  ***REMOVED***
***REMOVED***


    //
    // save wallet
    //
    this.updateBalance();
    this.app.options.wallet = this.wallet;
    this.app.storage.saveOptions();

  ***REMOVED***



  purgeExpiredSlips() {

    let gid = this.app.blockchain.genesis_bid;
    for (let m = this.wallet.inputs.length-1; m >= 0; m--) {
      if (this.wallet.inputs[m].bid < gid) {
        this.wallet.inputs.splice(m, 1);
        this.wallet.spends.splice(m, 1);
  ***REMOVED***
***REMOVED***
    for (let m = this.wallet.outputs.length-1; m >= 0; m--) {
      if (this.wallet.outputs[m].bid < gid) {
        this.wallet.outputs.splice(m, 1);
  ***REMOVED***
***REMOVED***
  ***REMOVED***





  resetExistingSlips(bid, bsh, lc) {
    for (let m = this.wallet.inputs.length-1; m >= 0; m--) {
      if (this.wallet.inputs[m].bid == bid && this.wallet.inputs[m].bsh == bsh) {
        this.wallet.inputs[m].lc = lc;
  ***REMOVED***
      else {
        if (this.wallet.inputs[m].bid < bid) {
          return;
    ***REMOVED***
  ***REMOVED***
***REMOVED***
  ***REMOVED***

  resetSpentInputs(bid=0) {
    if (bid == 0) {
      for (let i = 0; i < this.wallet.inputs.length; i++) {
        if (this.isSlipInPendingTransactions(this.wallet.inputs[i]) == false) {
          this.wallet.spends[i] = 0;
    ***REMOVED***
  ***REMOVED***
***REMOVED*** else {
      let target_bid = this.app.blockchain.returnLatestBlockId() - bid;
      for (let i = 0; i < this.wallet.inputs.length; i++) {
        if (this.wallet.inputs[i].bid <= target_bid) {
          if (this.isSlipInPendingTransactions(this.wallet.inputs[i]) == false) {
            this.wallet.spends[i] = 0;
      ***REMOVED***
    ***REMOVED***
  ***REMOVED***
***REMOVED***
  ***REMOVED***



  returnAdequateInputs(amt) {

    var utxiset = [];
    var value   = Big(0.0);
    var bigamt  = Big(amt);

    this.purgeExpiredSlips();

    //
    // this adds a 1 block buffer so that inputs are valid in the future block included
    //
    var lowest_block = this.app.blockchain.last_bid - this.app.blockchain.genesis_period + 2;

    //
    // check pending txs to avoid slip reuse if necessary
    //
    if (this.wallet.pending.length > 0) {
      for (let i = 0; i < this.wallet.pending.length; i++) {
        let ptx = new saito.transaction(JSON.parse(this.wallet.pending[i]));
        for (let k = 0; k < ptx.transaction.from.length; k++) {
          let slipIndex = ptx.transaction.from[k].returnSignatureSource();
          for (let m = 0; m < this.wallet.inputs; m++) {
            let thisSlipIndex = this.wallet.inputs[m].returnSignatureSource();
            if (thisSlipIndex === slipIndex) {
              while (this.wallet.spends.length < m) {
                this.wallet.spends.push(0);
          ***REMOVED***
              this.wallet.spends[m] = 1;
        ***REMOVED***
      ***REMOVED***
    ***REMOVED***
  ***REMOVED***
***REMOVED***


    for (let i = 0; i < this.wallet.inputs.length; i++) {
      if (this.wallet.spends[i] == 0 || i >= this.wallet.spends.length) {
        var slip = this.wallet.inputs[i];
        if (slip.lc == 1 && slip.bid >= lowest_block) {
          if (this.app.mempool.transactions_inputs_hmap[slip.returnSignatureSource()] != 1) {
            this.wallet.spends[i] = 1;
            utxiset.push(slip);
            value = value.plus(Big(slip.amt));
            if (value.gt(bigamt) || value.eq(bigamt)) {
              return utxiset;
        ***REMOVED***
      ***REMOVED***
    ***REMOVED***
  ***REMOVED***
***REMOVED***

    return null;
  ***REMOVED***



  returnBalance() {
    return this.wallet.balance.replace(/0+$/,'').replace(/\.$/,'\.0');
  ***REMOVED***

  returnPrivateKey() {
    return this.wallet.privatekey;
  ***REMOVED***
  returnPublicKey() {
    return this.wallet.publickey;
  ***REMOVED***

  async resetWallet() {

    // reset and save
    await this.app.storage.resetOptions();
    this.app.storage.saveOptions();

    this.wallet.privatekey            = this.app.crypto.generateKeys();
    this.wallet.publickey             = this.app.crypto.returnPublicKey(this.wallet.privatekey);

    // blockchain
    if (this.app.options.blockchain != undefined) {
      this.app.blockchain.resetBlockchainOptions();
***REMOVED***

    // keychain
    if (this.app.options.keys != undefined) {
      this.app.options.keys = [];
***REMOVED***

    this.wallet.inputs                = [];
    this.wallet.outputs               = [];
    this.wallet.spends                = [];
    this.wallet.pending               = [];

    this.saveWallet();

    if (this.app.browser.browser_active == 1) {
      window.location.reload();
***REMOVED***

  ***REMOVED***


  saveWallet() {
    this.app.options.wallet = this.wallet;
    this.app.storage.saveOptions();
  ***REMOVED***


  signMessage(msg) {
    return this.app.crypto.signMessage(msg, this.returnPrivateKey());
  ***REMOVED***

  signTransaction(tx) {
    if (tx == null) { return null; ***REMOVED***
    for (var i = 0; i < tx.transaction.to.length; i++) { tx.transaction.to[i].sid = i; ***REMOVED***
    tx.transaction.sig = tx.returnSignature(this.app);
    return tx;
  ***REMOVED***


  updateBalance() {

    let b = Big(0.0);
    let minid = this.app.blockchain.last_bid - this.app.blockchain.genesis_period + 1;
    for (let x = 0; x < this.wallet.inputs.length; x++) {
      let s = this.wallet.inputs[x];
      if (s.lc == 1 && s.bid >= minid) {
        b = b.plus(Big(s.amt));
  ***REMOVED***
***REMOVED***

    this.wallet.balance = b.toFixed(8); 
    this.app.modules.updateBalance();

  ***REMOVED***



  createUnsignedTransactionWithDefaultFee(publickey="", amt=0.0) {
    if (publickey === "") { publickey = this.app.wallet.returnPublicKey(); ***REMOVED***
    return this.createUnsignedTransaction(publickey, amt, this.wallet.default_fee);
  ***REMOVED***

  createUnsignedTransaction(publickey=this.returnPublicKey(), amt=0.0, fee=0.0) {

    var tx           = new saito.transaction();
    var total_fees   = Big(amt).plus(Big(fee));
    var wallet_avail = Big(this.returnBalance());

    //
    // check to-address is ok -- this just keeps a server
    // that receives an invalid address from forking off
    // the main chain because it creates its own invalid
    // transaction.
    //
    // this is not strictly necessary, but useful for the demo
    // server during testnet, which produces a majority of
    // blocks.
    //
    if (!this.app.crypto.isPublicKey(publickey)) {
      console.log("trying to send message to invalid address");
      return null;
***REMOVED***


    if (total_fees.gt(wallet_avail)) {
      amt = 0.0;
      fee = 0.0;
      //return null;
***REMOVED***


    //
    // zero-fee transactions have fake inputs
    //
    if (total_fees.eq(0.0)) {
      tx.transaction.from = [];
      tx.transaction.from.push(new saito.slip(this.returnPublicKey()));
***REMOVED*** else {
      tx.transaction.from = this.returnAdequateInputs(total_fees);
***REMOVED***
    tx.transaction.ts   = new Date().getTime();
    tx.transaction.to.push(new saito.slip(publickey, amt));

    // specify that this is a normal transaction
    tx.transaction.to[tx.transaction.to.length-1].type = 0;
    if (tx.transaction.from == null) {

      //
      // take a hail-mary pass and try to send this as a free transaction
      //
      tx.transaction.from = [];
      tx.transaction.from.push(new saito.slip(this.returnPublicKey(), 0.0));
      //return null;

***REMOVED***
    if (tx.transaction.to == null) {

      //
      // take a hail-mary pass and try to send this as a free transaction
      //
      tx.transaction.to = [];
      tx.transaction.to.push(new saito.slip(publickey, 0.0));
      //return null;

***REMOVED***

    // add change input
    var total_inputs = Big(0.0);
    for (let ii = 0; ii < tx.transaction.from.length; ii++) {
      total_inputs = total_inputs.plus(Big(tx.transaction.from[ii].amt));
***REMOVED***

    //
    // generate change address(es)
    //
    var change_amount = total_inputs.minus(total_fees);

    if (Big(change_amount).gt(0)) {

      //
      // if we do not have many slips left, generate a few extra inputs
      //
      if (this.wallet.inputs.length < 8) {

        let change1 = change_amount.div(2).toFixed(8);
	let change2 = change_amount.minus(Big(change1)).toFixed(8);

***REMOVED***
***REMOVED*** split change address
***REMOVED***
***REMOVED*** this prevents some usability issues with APPS
***REMOVED*** by making sure there are usually at least 3
***REMOVED*** utxo available for spending.
***REMOVED***
        tx.transaction.to.push(new saito.slip(this.returnPublicKey(), change1));
        tx.transaction.to[tx.transaction.to.length-1].type = 0;
        tx.transaction.to.push(new saito.slip(this.returnPublicKey(), change2));
        tx.transaction.to[tx.transaction.to.length-1].type = 0;

  ***REMOVED*** else {

***REMOVED***
***REMOVED*** single change address
***REMOVED***
        tx.transaction.to.push(new saito.slip(this.returnPublicKey(), change_amount.toFixed(8)));
        tx.transaction.to[tx.transaction.to.length-1].type = 0;
  ***REMOVED***
***REMOVED***


    //
    // we save here so that we don't create another transaction
    // with the same inputs after broadcasting on reload
    //
    this.saveWallet();

    return tx;

  ***REMOVED***
***REMOVED***

module.exports = Wallet;
