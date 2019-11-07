const GameHudTemplate 	= require('./game-hud.template.js');

module.exports = GameHud = {

    render(app, data) {
console.log("RENDERING GAME HUD!");
      document.querySelector(".game-hud").innerHTML += GameHudTemplate();
    },

    attachEvents(app, data) {
    }

}
