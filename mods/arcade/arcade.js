const saito = require('../../lib/saito/saito.js');
const ModTemplate = require('../../lib/templates/modtemplate');

const ArcadeMain = require('./lib/arcade-main/arcade-main');
const ArcadeLoader = require('./lib/arcade-main/arcade-loader');
const ArcadeLeftSidebar = require('./lib/arcade-left-sidebar/arcade-left-sidebar');
const ArcadeRightSidebar = require('./lib/arcade-right-sidebar/arcade-right-sidebar');


class Arcade extends ModTemplate {

  constructor(app) {

    super(app);

    this.name 			= "Arcade";
    this.mods			= [];
    this.affix_callbacks_to 	= [];
    this.games			= [];

  }

  render(app, data) {

    ArcadeMain.render(app, data);
    ArcadeMain.attachEvents(app, data);

//    ArcadeLeftSidebar.render(app, data);
//    ArcadeLeftSidebar.attachEvents(app, data);

//    ArcadeRightSidebar.render(app, data);
//    ArcadeRightSidebar.attachEvents(app, data);

  }


  initialize(app) {

    //
    // main-panel games
    //
    let x = [];
    x = this.app.modules.respondTo("arcade-games");
    for (let i = 0; i < x.length; i++) {
      this.mods.push(x[i]);
      this.affix_callbacks_to.push(x[i].name);
    }

    //
    // left-panel chat
    //
    x = this.app.modules.respondTo("email-chat");
    for (let i = 0; i < x.length; i++) {
      this.mods.push(x[i]);
    }

    //
    // add my own games (as fake txs)
    //
    if (this.app.options.games != undefined) {
      for (let i = 0; i < this.app.options.games.length; i++) {
	let z = new saito.transaction();
	z.transaction.msg.game_id  = this.app.options.games[i].id;
	z.transaction.msg.request  = "loaded";
        z.transaction.msg.game     = this.app.options.games[i].module;
        z.transaction.msg.options  = this.app.options.games[i].options;;
	this.games.push[z];
      }
    }


  }


  initializeHTML(app) {

    let data = {};
    data.arcade = this;

/*
    let tx = this.createOpenTransaction({ name : "Wordblocks" , options : {} , players_needed : 2 });
    this.games.push(tx);
*/

    this.render(app, data);

  }



  async onConfirmation(blk, tx, conf, app) {

    let txmsg = tx.returnMessage();
    let arcade_self = app.modules.returnModule("Arcade");

    if (conf == 0) {

      // save state
      if (txmsg.saveGameState != undefined && txmsg.game_id != "") {
	arcade_self.saveGameState(blk, tx, conf, app);
      }

      // open
      if (txmsg.module == "Arcade" && txmsg.request == "open") {

	arcade_self.games.push(tx);

	let data = {};
	data.arcade = arcade_self;

        ArcadeMain.render(arcade_self.app, data);
        ArcadeMain.attachEvents(arcade_self.app, data);
	
	arcade_self.receiveOpenRequest(blk, tx, conf, app);
      }

      // invites
      if (txmsg.request == "invite") {
	arcade_self.receiveInviteRequest(blk, tx, conf, app);
      }

      // acceptances
      if (txmsg.request == "accept") {
        arcade_self.receiveAcceptRequest(blk, tx, conf, app);
	arcade_self.launchGame(txmsg.game_id);
      }

      // game over
      if (txmsg.request == "gameover") {
	arcade_self.receiveGameoverRequest(blk, tx, conf, app);
      }
    }
  }



  launchGame(game_id) {

    if (this.browser_active == 0) { return; }

    let arcade_self = this;

    arcade_self.is_initializing = true;
    arcade_self.initialization_timer = setInterval(() => {

      let game_idx = -1;
      if (arcade_self.app.options.games != undefined) {
        for (let i = 0; i < arcade_self.app.options.games.length; i++) {
          if (arcade_self.app.options.games[i].id == game_id) {
              game_idx = i;
          }
        }
      }

      if (game_idx == -1) { return; }

      if (arcade_self.app.options.games[game_idx].initializing == 0) {

        clearInterval(arcade_self.initialization_timer);

	let data = {};
	    data.arcade   = arcade_self;
	    data.game_id  = game_id;

	ArcadeLoader.render(arcade_self.app, data);
	ArcadeLoader.attachEvents(arcade_self.app, data);

      }
    }, 1000);

  }



/********
  async saveGameState(blk, tx, conf, app) {

        let sql = `INSERT INTO gamestate (
		game_id, 
		player,
		module,
		bid,
		tid,
		lc,
		last_move
	      ) VALUES (
		$game_id,
		$player,
		$module,
		$bid,
		$tid,
		$lc,
		$last_move
	      )`;
        let params = {
                $game_id   : txmsg.game_id ,
                $player    : tx.transaction.from[0].add ,
                $module    : txmsg.module ,
                $bid       : blk.block.id ,
                $tid       : tx.transaction.id ,
                $lc        : 1 ,
                $last_move : (new Date().getTime())
              };
	await app.storage.executeDatabase(sql, params, "arcade");

  }
******/





  async receiveOpenRequest(blk, tx, conf, app) {

    let txmsg = tx.returnMessage();

    let module 			= txmsg.game;
    let player			= tx.transaction.from[0].add;
    let game_id			= tx.transaction.sig;
    let options			= {};
    let start_bid		= blk.block.id;
    let valid_for_minutes	= 60;
    let created_at		= parseInt(tx.transaction.ts);
    let expires_at 		= created_at + (60000 * parseInt(valid_for_minutes));

    let sql = `INSERT INTO games (
  		player ,
		module ,
		game_id ,
		status ,
		options ,
		start_bid ,  
		created_at ,
		expires_at
	      ) VALUES (
		$player ,
		$module ,
		$game_id ,
		$status ,
		$options ,
		$start_bid ,
		$created_at ,
		$expires_at
	      )`;
    let params = {
                $player     : player ,
                $module     : module ,
                $game_id    : game_id ,
	 	$status	    : "open" ,
		$options    : options ,
		$start_bid  : blk.block.id ,
		$created_at : created_at ,
		$expires_at : expires_at
              };
    await app.storage.executeDatabase(sql, params, "arcade");
    return;
  }
  sendOpenRequest(app, data, gamedata) {
    let tx = this.createOpenTransaction(gamedata);
    this.app.network.propagateTransaction(tx);
  }
  createOpenTransaction(gamedata) {

    let ts = new Date().getTime();
    let accept_sig = this.app.crypto.signMessage(("create_game_"+ts), this.app.wallet.returnPrivateKey());
console.log("msg created for verify: " + ("create_game_"+ts));

    let tx = this.app.wallet.createUnsignedTransactionWithDefaultFee();
        tx.transaction.to.push(new saito.slip(this.app.wallet.returnPublicKey(), 0.0));
        tx.transaction.msg.ts       		= ts;
        tx.transaction.msg.module   		= "Arcade";
        tx.transaction.msg.request  		= "open";
        tx.transaction.msg.game     		= gamedata.name;
        tx.transaction.msg.options  		= gamedata.options;
        tx.transaction.msg.players_needed 	= gamedata.players_needed;
        tx.transaction.msg.accept_sig 		= accept_sig;
        tx.transaction.msg.players  		= [];
        tx.transaction.msg.players.push(this.app.wallet.returnPublicKey());
    tx = this.app.wallet.signTransaction(tx);

    return tx;

  }




  async receiveInviteRequest(blk, tx, conf, app) {

    //
    // servers
    //
    let txmsg = tx.returnMessage();
    let sql = "UPDATE games SET state = 'active', id = $gid WHERE sig = $sig";
    let params = {
      $gid : txmsg.game_id ,
      $sig : txmsg.sig
    }
    await this.app.storage.executeDatabase(sql, params, "arcade");
    if (this.browser_active == 0) { return; }

    //
    // browsers
    //
    let opponent = tx.transaction.from[0].add;
    let invitee  = tx.transaction.to[0].add;

    data = {};
    data.arcade = this;

  }
  sendInviteRequest(app, data, opentx) {
    let tx = this.createInviteTransaction(app, data, opentx);
    this.app.network.propagateTransaction(tx);
  }
  createInviteTransaction(app, data, gametx) {

    let txmsg = gametx.returnMessage();

    let tx = app.wallet.createUnsignedTransactionWithDefaultFee();
        tx.transaction.to.push(new saito.slip(gametx.transaction.from[0].add, 0.0));
        tx.transaction.to.push(new saito.slip(app.wallet.returnPublicKey(), 0.0));
        tx.transaction.msg.ts   	= "";
        tx.transaction.msg.module   	= txmsg.game;
        tx.transaction.msg.request  	= "invite";
	tx.transaction.msg.game_id	= gametx.transaction.sig;
        tx.transaction.msg.options  	= txmsg.options;
        tx.transaction.msg.accept_sig   = "";
	if (gametx.transaction.msg.accept_sig != "") { 
          tx.transaction.msg.accept_sig   = gametx.transaction.msg.accept_sig;
        }
	if (gametx.transaction.msg.ts != "") { 
          tx.transaction.msg.ts   = gametx.transaction.msg.ts;
        }
        console.log("\n\n\nCREATE INVITE SIG: " + ("invite_game_"+tx.transaction.msg.ts) + " ------ " + app.wallet.returnPrivateKey());
        tx.transaction.msg.invite_sig   = app.crypto.signMessage(("invite_game_"+tx.transaction.msg.ts), app.wallet.returnPrivateKey());
    tx = this.app.wallet.signTransaction(tx);

    return tx;

  }







  async receiveAcceptRequest(blk, tx, conf, app) {

    if (this.browser_active == 1) {
      ArcadeLoader.render(app, data);
      ArcadeLoader.attachEvents(app, data);
    }

    let publickeys = tx.transaction.to.map(slip => slip.add);
    let removeDuplicates = (names) => names.filter((v,i) => names.indexOf(v) === i)
    let unique_keys = removeDuplicates(publickeys);
 
    let sql = "UPDATE games SET state = 'expired' WHERE state = $state AND player IN ($player1, $player2, $player3, $player4)";
    let params = {
      $state : 'open',
      $player1 : unique_keys[0] || '',
      $player2 : unique_keys[1] || '',
      $player3 : unique_keys[2] || '',
      $player4 : unique_keys[3] || '',
    }
    await this.app.storage.executeDatabase(sql, params, "arcade");

  }
  sendAcceptRequest(app, data) {

    let game_module 	= "Wordblocks";
    let game_id		= "7123598714987123512";
    let opponents 	= [app.wallet.returnPublicKey()];

    let tx = app.wallet.createUnsignedTransactionWithDefaultFee();
        for (let i = 1; i < opponents.length; i++) { tx.transaction.to.push(new saito.slip(opponents[i], 0.0)); }
        tx.transaction.to.push(new saito.slip(this.app.wallet.returnPublicKey(), 0.0));
        tx.transaction.msg.module   = game_module;
        tx.transaction.msg.request  = "accept";
        tx.transaction.msg.game_id  = game_id;
    tx = this.app.wallet.signTransaction(tx);
    this.app.network.propagateTransaction(tx);

  }






  async receiveGameoverRequest(blk, tx, conf, app) {

    let sql = "UPDATE games SET state = $state, winner = $winner WHERE game_id = $game_id";
    let params = {
      $state: 'over',
      $game_id : txmsg.game_id,
      $winner  : txmsg.winner
    }
    await arcade_self.app.storage.executeDatabase(sql, params, "arcade");

  }
  sendGameoverRequest(app, data) {

    let game_module 	= "Wordblocks";
    let options		= "";
    let sig		= "";
    let created_at      = "";
    let player		= app.wallet.returnPublicKey();

    let tx = app.wallet.createUnsignedTransactionWithDefaultFee();
        tx.transaction.to.push(new saito.slip(player, 0.0));
        tx.transaction.msg.module   	= game_module;
        tx.transaction.msg.request  	= "invite";
        tx.transaction.msg.options  	= {};
        tx.transaction.msg.ts 		= created_at;
        tx.transaction.msg.sig  	= sig;
    tx = this.app.wallet.signTransaction(tx);
    this.app.network.propagateTransaction(tx);

  }


  




  shouldAffixCallbackToModule(modname) {
    if (modname == "Arcade") { return 1; }
    for (let i = 0; i < this.affix_callbacks_to.length; i++) {
      if (this.affix_callbacks_to[i] == modname) { return 1; }
    }
    return 0;
  }

}

module.exports = Arcade;

