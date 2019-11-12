const ArcadeMainTemplate = require('./arcade-main.template');
const ArcadeGameTemplate = require('./arcade-game.template');
const ArcadeGameListRowTemplate = require('./arcade-gamelist-row.template');
const ArcadeLoader = require('./arcade-loader');
const ArcadeGameCreate = require('./arcade-game-create/arcade-game-create');


module.exports = ArcadeMain = {

  render(app, data) {

    let arcade_main = document.querySelector(".arcade-main");
    if (!arcade_main) { return; ***REMOVED***
    arcade_main.innerHTML = ArcadeMainTemplate();

    //
    // click-to-create games
    //
    let gamesbox = document.getElementById("arcade-games");
    data.arcade.mods.forEach(mod => {
      let gameobj = mod.respondTo("arcade-games");
      if (gameobj != null) {
	gamesbox.innerHTML += ArcadeGameTemplate(mod, gameobj);
  ***REMOVED***
***REMOVED***);

    //
    // click-to-join
    //
    data.arcade.games.forEach(tx => {
      document.querySelector('.arcade-gamelist').innerHTML += ArcadeGameListRowTemplate(tx);
***REMOVED***);

  ***REMOVED***,


  attachEvents(app, data) {

    //
    // create game
    //
    Array.from(document.getElementsByClassName('game')).forEach(game => {
      game.addEventListener('click', (e) => {

        data.active_game = e.currentTarget.id;
	ArcadeGameCreate.render(app, data);
        ArcadeGameCreate.attachEvents(app, data);

  ***REMOVED***);
***REMOVED***);


    //
    // join game
    //
    Array.from(document.getElementsByClassName('arcade-game-row-join')).forEach(game => {
      game.addEventListener('click', (e) => {

        let game_id = e.currentTarget.id;

	for (let i = 0; i < data.arcade.games.length; i++) {
	  if (data.arcade.games[i].transaction.sig == game_id) {

	    //
	    //
	    //
	    if (data.arcade.app.options.games != undefined) {
	      if (data.arcade.app.options.games.length > 0) {
	        for (let z = 0; z < data.arcade.app.options.games.length; z++) {
	          if (data.arcade.app.options.games[z].id == game_id) {
                    app.options.games[z].ts = new Date().getTime();
                    app.options.games[z].initialize_game_run = 0;
                    app.storage.saveOptions();
                    window.location = '/' + app.options.games[i].module.toLowerCase();
	            return;
	      ***REMOVED***
	    ***REMOVED***
	  ***REMOVED***
	***REMOVED***

	    data.arcade.sendInviteRequest(app, data, data.arcade.games[i]);
	    ArcadeLoader.render(app, data);
	    ArcadeLoader.attachEvents(app, data);

	    return;
	  ***REMOVED***
    ***REMOVED***
  ***REMOVED***);
***REMOVED***);
  ***REMOVED***

***REMOVED***
