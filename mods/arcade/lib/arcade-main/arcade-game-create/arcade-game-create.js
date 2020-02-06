let ArcadeGameCreateTemplate = require('./arcade-game-create.template.js');
let ArcadeMain2 = require('./../arcade-main.js');


module.exports = ArcadeGameDreate = {

  render(app, data) {

    document.querySelector('.arcade-main').innerHTML = ArcadeGameCreateTemplate();
    let game_id = data.active_game;

    for (let i = 0; i < data.arcade.mods.length; i++) {
      if (data.arcade.mods[i].name === game_id) {

        let gamemod = data.arcade.mods[i];
        let gamemod_url = "/" + gamemod.slug + "/img/arcade.jpg";

        document.querySelector('.game-image').src = gamemod_url;
        document.querySelector('.background-shim').style.backgroundImage = 'url(' + gamemod_url + ')';
        document.querySelector('.game-title').innerHTML = gamemod.name;
        document.querySelector('.game-description').innerHTML = gamemod.description;
        document.querySelector('.game-publisher-message').innerHTML = gamemod.publisher_message;
        document.querySelector('.game-details').innerHTML = gamemod.returnGameOptionsHTML();


        setTimeout(() => {

          let current_sel = document.querySelector('.game-players-select').value;

          for (let p = gamemod.minPlayers; p <= gamemod.maxPlayers; p++) {
            var option = document.createElement("option");
            option.text = p + " player";
            option.value = p;
            document.querySelector('.game-players-select').add(option);
          }

        }, 100);


        document.getElementById('game-create-btn')
          .addEventListener('click', (e) => {

            let options = {};

            document.querySelectorAll('form input, form select').forEach(element => {
              if (element.type == "checkbox") {
                if (element.prop("checked")) {
                  options[element.name] = 1;
                }
              } else {
                options[element.name] = element.value;
              }
            });

            let gamedata = {};
            gamedata.name = gamemod.name;
            gamedata.slug = gamemod.returnSlug();
            gamedata.options = gamemod.returnFormattedGameOptions(options);
            gamedata.options_html = gamemod.returnGameRowOptionsHTML(options);
            gamedata.players_needed = document.querySelector('.game-players-select').value;

            if (gamedata.players_needed == 1) {
              // 1 player games just launch
              data.arcade.launchSinglePlayerGame(app, data, gamedata);
              return;
            }

            let newtx = data.arcade.createOpenTransaction(gamedata);
            data.arcade.app.network.propagateTransaction(newtx);
            document.querySelector('.arcade-main').innerHTML = '';
            data.arcade.render(app, data);

          });

        document.getElementById('friend-invite-btn')
          .addEventListener('click', (e) => {

            var players_needed = document.querySelector('.game-players-select').value;
            var players_invited = document.querySelector('#game-invitees').value.split(/[ ,]+/);

            if (players_needed == 1) {
              // 1 player games just launch
              data.arcade.launchSinglePlayerGame(app, data, gamedata);
              return;
            }

            if (players_invited.length >= players_needed - 1) {

              let options = {};

              document.querySelectorAll('form input, form select').forEach(element => {
                if (element.type == "checkbox") {
                  if (element.prop("checked")) {
                    options[element.name] = 1;
                  }
                } else {
                  options[element.name] = element.value;
                }
              });
              options['players_invited'] = players_invited;

              let gamedata = {};
              gamedata.name = gamemod.name;
              gamedata.slug = gamemod.returnSlug();
              gamedata.options = gamemod.returnFormattedGameOptions(options);
              gamedata.options_html = gamemod.returnGameRowOptionsHTML(options);
              gamedata.players_needed = players_needed;


              let newtx = data.arcade.createOpenTransaction(gamedata);
              data.arcade.app.network.propagateTransaction(newtx);
              document.querySelector('.arcade-main').innerHTML = '';
              data.arcade.render(app, data);
            } else {

              salert('More players needed. Add a comma separated list of their names or addresses.');
              document.querySelector('#game-invitees').focus();

            }

          });

        document.querySelector('.game-players-select').addEventListener('change', (e) => {
          let players = parseInt(e.currentTarget.value);

          for (let i = 0; i < 10; i++) {
            let classhit = ".game-players-options-" + (i + 1) + "p";
            let classhit2 = "#game-players-select-" + (i + 1) + "p";
            if (i < players) {
              $(classhit).css('display', "flex");
              $(classhit2).parent('.saito-select').css('display', 'flex');
            } else {
              $(classhit).css('display', "none");
              $(classhit2).parent('.saito-select').css('display', 'none');
            }
          }
        })




        return;
      }
    }
  },


  attachEvents(app, data) {


    document.querySelector('#return-to-arcade')
      .onclick = (e) => {
        document.querySelector('.arcade-main').innerHTML = '';
        data.arcade.render(app, data);
      }

    document.querySelector('.background-shim-cover')
      .onclick = (e) => {
        document.querySelector('.arcade-main').innerHTML = '';
        data.arcade.render(app, data);
      }

  }

}
