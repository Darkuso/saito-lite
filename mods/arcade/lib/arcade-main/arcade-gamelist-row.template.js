module.exports = ArcadeGameListRowTemplate = (app, tx, button_map) => {

  let { sig, from, to, msg ***REMOVED*** = tx.transaction;
  let { players_array, options_html, game ***REMOVED*** = msg;

  if (players_array == undefined) {
    players_array = to.map(t => t.add).join('_');
  ***REMOVED***

  let players_needed = 2;
  let players = players_array.split("_");

  if (options_html == undefined) { options_html = ""; ***REMOVED***
  if (msg.players_needed > 2) { players_needed = msg.players_needed; ***REMOVED***

  let publickeys = [];
  if (from.length > 0) {
    publickeys.push(from[0].add);
    players.forEach(player => {
      if (!publickeys.includes(player))
        publickeys.push(player);
***REMOVED***);
  ***REMOVED***

  let identicons = publickeys.map(publickey => `<img class="identicon" src="${app.keys.returnIdenticon(publickey)***REMOVED***">`).join("");

  var button_html = Object.entries(button_map).map(([key, value]) => {
    return `<button class="arcade-game-row-${key***REMOVED***" id="arcade-game-${key***REMOVED***-row-${sig***REMOVED***">${value***REMOVED***</button>`
  ***REMOVED***).join('');

  return `
    <div class="arcade-game-invitation" id="arcade-game-${sig***REMOVED***">
      <div class="arcade-game-row-name" id="arcade-game-name-${sig***REMOVED***">

        <div class="arcade-game-row-avi">
          ${identicons***REMOVED***
        </div>
      </div>

      <div class="arcade-game-row-name" id="arcade-game-name-${sig***REMOVED***">${game***REMOVED***</div>
      <div class="arcade-game-row-options" id="arcade-game-options-${sig***REMOVED***">
      <div class="game-options-html">${options_html***REMOVED***</div>
      </div>

      ${button_html***REMOVED***
    </div>
  `;

***REMOVED***
