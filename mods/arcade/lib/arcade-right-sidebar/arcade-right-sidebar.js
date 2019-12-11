const ArcadeRightSidebarTemplate 	= require('./arcade-right-sidebar.template.js');
const ObserverRow = require('./arcade-right-sidebar-observer-game-row.template.js');
const LeaderboardRow = require('./arcade-right-sidebar-leaderboard-row.template.js');

module.exports = ArcadeRightSidebar = {

    render(app, data) {
      let publickey = app.wallet.returnPublicKey();
      let id = app.keys.returnIdentifierByPublicKey(publickey);

      document.querySelector(".arcade-right-sidebar").innerHTML = ArcadeRightSidebarTemplate(publickey, id);

      for (let i = 0; i < data.arcade.observer.length; i++) {
        let players = [];
        let players_array = data.arcade.observer[i].players_array.split("_");

        for (let z = 0; z < players_array.length; z++) {
          players.push({ identicon : app.keys.returnIdenticon(app.crypto.hash(players_array[z])) , publickey : players_array[z] ***REMOVED***);
    ***REMOVED***

        document.querySelector(".arcade-sidebar-active-games-body").innerHTML
          += ObserverRow(data.arcade.observer[i], players, app.crypto.stringToBase64(JSON.stringify(data.arcade.observer[i])));
  ***REMOVED***

      data.arcade.leaderboard.forEach(async leader => {
        if (app.crypto.isPublicKey(leader.winner)) {
          leader.winner = await data.arcade.addrController.returnAddressHTMLPromise(leader.winner);
    ***REMOVED***

        document.querySelector(".arcade-sidebar-active-leaderboard-body")
                .innerHTML += LeaderboardRow(leader);
  ***REMOVED***);

      //
      // arcade sidebar
      //
      data.arcade.mods.forEach(mod => {
        let gameobj = mod.respondTo("arcade-sidebar");
        if (gameobj != null) {

          let modname = "arcade-sidebar-"+mod.slug;
          let x = document.querySelector(("."+modname));

          if (x == null || x == undefined) {
            document.querySelector(".arcade-right-sidebar").innerHTML += `<div class="${modname***REMOVED***"></div>`;
      ***REMOVED***

          gameobj.render(app, data);
          gameobj.attachEvents(app, data);
    ***REMOVED***
  ***REMOVED***);

***REMOVED***,

    attachEvents(app, data) {

      Array.from(document.getElementsByClassName('arcade-observer-game-btn')).forEach(game => {
        game.onclick = (e) => {
          data.arcade.observeGame(e.currentTarget.id);
    ***REMOVED***;
  ***REMOVED***);

      let reg_button = document.getElementById('register-button')
      if (reg_button)
        document.getElementById('register-button').onclick = (e) => {
          app.modules.returnModule("Registry").showModal();
    ***REMOVED***

      let faucetmod = app.modules.returnModule("Faucet");
      if (faucetmod != null) {
        document.querySelector('.arcade-announcement').onclick = (e) => {
          document.querySelector('.arcade-main').innerHTML = '<div class="email-main"><div class="email-appspace"></div></div>';
          data = {***REMOVED***;
          data.arcade = this;
          data.faucet = faucetmod;
          faucetmod.renderEmail(app, data);
          faucetmod.attachEvents(app, data);
    ***REMOVED***
  ***REMOVED***

***REMOVED***

***REMOVED***



