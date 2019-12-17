const GameCardfanTemplate = require('./game-cardfan.template');
const dragElement = require('../../../helpers/drag_element');
const elParser = require('../../../helpers/el_parser');

class GameCardfan {

    constructor(app, dimensions) {
      this.app = app;
      this.dimensions = dimensions;
***REMOVED***

    render(app, data) {

      try {
***REMOVED*** let card_html = data.cards.map(card => {
***REMOVED***   return `<img class="card" src="/poker/img/cards/${card.name***REMOVED***.png />`
***REMOVED*** ***REMOVED***).join('');

***REMOVED*** for (let i = 0; i < this.game.deck[0].hand.length; i++) {
***REMOVED***   let card = this.game.deck[0].cards[this.game.deck[0].hand[i]];
***REMOVED***   let card_img = card.name + ".png";
***REMOVED***   let html = '<img class="card" src="/poker/img/cards/'+card_img+'" />';
***REMOVED***   $('#hand').append(html);
***REMOVED*** ***REMOVED***

        if (!document.getElementById('cardfan')) {
          document.body.innerHTML += GameCardfanTemplate();
    ***REMOVED***

        let { cards, hand ***REMOVED*** = data.game.deck[0];
        let cards_in_hand = hand.map(key => cards[key]);

        let cards_html = cards_in_hand
          .map(card => `<img class="card" src="${data.card_img_dir***REMOVED***/${card.name***REMOVED***">`)
          .join('');

        document.getElementById('cardfan').innerHTML = cards_html;
  ***REMOVED*** catch (err) {

  ***REMOVED***

***REMOVED***

    attachEvents(app, data) {
 
      try {
        let cardfan = document.getElementById('cardfan');
        dragElement(cardfan);
        cardfan.addEventListener('mousedown', () => cardfan.style.width = '100vw');
  ***REMOVED*** catch (err) {
  ***REMOVED***
***REMOVED***
***REMOVED***

module.exports = GameCardfan


