const EscrowGameWizardTemplate	 	= require('./escrow-game-wizard.template.js');


module.exports = EscrowGameWizardT = {

  render(app, data) {

    document.querySelector(".arcade-main").innerHTML = EscrowGameWizardTemplate();

  },


  attachEvents(app, data) {

    document.querySelector('#return_to_arcade')
    .onclick = (e) => {
      document.querySelector('.arcade-main').innerHTML = '';
      data.arcade.render(app, data);
    }

    document.querySelector('.background-shim-cover')
    .onclick = (e) => {
      document.querySelector('.arcade-main').innerHTML = '';
      data.arcade.render(app, data);
    }


    Array.from(document.getElementsByClassName('escrow-game-select')).forEach(game => {
      game.addEventListener('change', (e) => {

        let value = e.currentTarget.value;
        if (value === "select") { return; }
        let gamemod = app.modules.returnModule(value);

	if (gamemod == null) { 
	  alert("Error -- could not find game!");
	  return;
	}


        document.querySelector('.game-details').innerHTML = gamemod.returnGameOptionsHTML();


        document.getElementById('escrow-submit-btn')
          .addEventListener('click', (e) => {

            let options  = {};
	    let opponent = "";
	    let stake = "";

	    opponent = document.getElementById(".opponent_address").value;
	    stake    = document.getElementById(".escrow_stake").value;

            $('form input, form select').each(
              function(index) {
                var input = $(this);
                if (input.is(":checkbox")) {
                  if (input.prop("checked")) {
                    options[input.attr('name')] = 1;
                  }
                } else {
                  options[input.attr('name')] = input.val();
                }
              }
            );

	    //
	    // MANUALLY FORMAT REQUEST
	    //
	    alert("Manually Formatting Send Request!");

/***
            let gamedata = {};
                gamedata.name = gamemod.name;
                gamedata.options = gamemod.returnFormattedGameOptions(options);
                gamedata.options_html = gamemod.returnGameRowOptionsHTML(options);
                gamedata.stake = stake;

            data.arcade.sendOpenRequest(app, data, gamedata);
            document.querySelector('.arcade-main').innerHTML = '';
            data.arcade.render(app, data);
***/
	});
      });
    });
  }

}
