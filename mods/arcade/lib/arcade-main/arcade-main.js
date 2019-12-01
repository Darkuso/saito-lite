const ArcadeMainTemplate = require('./arcade-main.template');

// const ArcadeGameCarouselTemplate = require('./arcade-game-carousel/arcade-game-carousel.template');

const ArcadeGameTemplate = require('./arcade-game.template');
const ArcadeGameListRowTemplate = require('./arcade-gamelist-row.template');

const ArcadeLoader = require('./arcade-loader');
const ArcadeGameCreate = require('./arcade-game-create/arcade-game-create');


module.exports = ArcadeMain = {

  render(app, data) {

    let arcade_main = document.querySelector(".arcade-main");
    if (!arcade_main) { return; }
    arcade_main.innerHTML = ArcadeMainTemplate();

    //
    // click-to-Create Games
    //
    //let carousel = document.getElementById("arcade-carousel-slides");
    //data.arcade.mods.forEach(mod => {
    //  let gameobj = mod.respondTo("arcade-games");
    //  if (gameobj != null) {
    //    carousel.innerHTML += ArcadeGameTemplate(mod, gameobj);
    //  }
    //});

    //
    // click-to-join
    //
    data.arcade.games.forEach(tx => {

      let txmsg = tx.returnMessage();
      let { game_id } = txmsg;

      let button_text = {};
      button_text.main = "JOIN";

      if (app.options.games) {
        app.options.games.forEach(game => {
          if (game.initializing == 0 && game.game_id == game_id)
            button_text.main = "CONTINUE";
        });
      }

      //
      // some games don't have players attribute
      //
      if (txmsg.players) {
        txmsg.players.forEach(player => {
          if (app.wallet.returnPublicKey() == player)
            button_text.delete = "DELETE";
        });
      }

      document.querySelector('.arcade-gamelist').innerHTML += ArcadeGameListRowTemplate(app, tx, button_text);
      console.log(button_text);
    });

  },







  attachEvents(app, data) {

    //
    // Create Game
    //
    Array.from(document.getElementsByClassName('game')).forEach(game => {
      game.addEventListener('click', (e) => {

        data.active_game = e.currentTarget.id;
        ArcadeGameCreate.render(app, data);
        ArcadeGameCreate.attachEvents(app, data);

      });
    });

    document.querySelector('#play-now').addEventListener('click', function() {
      ArcadeStartGameList.render(app,data);
      ArcadeStartGameList.attachEvents(app,data);
    });

    //
    // join game
    //
    Array.from(document.getElementsByClassName('arcade-game-row-join')).forEach(game => {
      game.onclick = (e) => {

        let game_id = e.currentTarget.id;
        game_id = game_id.substring(17);

        //
        // find our accepted game
        //
        let { games } = data.arcade;
        let accepted_game = null;

        games.forEach((g) => {
          if (g.transaction.sig === game_id) accepted_game = g;
        });

        if (!accepted_game) return;

        //
        // check that we're not accepting our own game
        //
        if (accepted_game.transaction.from[0].add == app.wallet.returnPublicKey()) {
          if (accepted_game.players.length > 1) {
            salert(`
              This is your game! Not enough players have joined the game for us to start,
              but we'll take you to the loading page since at least one other player is waiting for this game to start....
            `);
            ArcadeLoader.render(app, data);
            ArcadeLoader.attachEvents(app, data);
          } else {
            salert("You cannot accept your own game!");
          }
        } else {
          //
          // check if we've already accepted game and have it locally
          //
          if (app.options.games) {
            let existing_game = app.options.games.find(game => game.id == game_id);

            if (existing_game) {
              if (existing_game.initializing == 1) {
                salert("This game is initializing!");

                ArcadeLoader.render(app, data);
                ArcadeLoader.attachEvents(app, data);
                return;
              } else {
                //
                // solid game already created
                //
                existing_game.ts = new Date().getTime();
                existing_game.initialize_game_run = 0;
                app.storage.saveOptions();
                window.location = '/' + existing_game.module.toLowerCase();
                return;
              }
            }
          }

          //
          // check with server to see if this game is taken yet
          //
          data.arcade.sendPeerDatabaseRequest(
            "arcade",
            "games",
            "is_game_already_accepted",
            accepted_game.id,
            null,
            (res) => {

console.log("CHECKING TO SEE IF THERE IS STILL SPACE IN THE GAME: " + JSON.stringify(res.rows));
              if (res.rows == undefined) {
                console.log("ERROR 458103: cannot fetch information on whether game already accepted!");
                return;
              }

              if (res.rows.length > 0) {
                if (res.rows[0].game_still_open == 1) {
                  //
                  // data re: game in form of tx
                  //
                  let { transaction } = accepted_game;
                  let game_tx = Object.assign({ msg: { players_array: null } }, transaction);

                  if (game_tx.msg.players_array) {
                    let players = transaction.msg.players_array.split("_");
                    if (players.length >= 2) {
                      data.arcade.sendMultiplayerAcceptRequest(app, data, accepted_game);
                      return;
                    }
                  }

                  //
                  // sanity check
                  //
  console.log("CHECKING OPTIONS WHEN INVITING: " + JSON.stringify(accepted_game));

                  data.arcade.sendInviteRequest(app, data, accepted_game);
                  ArcadeLoader.render(app, data);
                  ArcadeLoader.attachEvents(app, data);
                } else {
                  salert("Sorry... game already accepted. Your list of open games will update shortly on next block!");
                }
              }
            });
        }
      };
    });
    Array.from(document.getElementsByClassName('arcade-game-row-delete')).forEach(game => {
      game.addEventListener('click', (e) => {
        let game_id = e.currentTarget.id;
	    game_id = game_id.substring(17);
        salert("Delete game id: " + game_id);
      });
    });
  }

}
