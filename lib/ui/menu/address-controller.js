const elParser = require('../../helpers/el_parser');
const AddressMenuTemplate = require('./address-menu.template');

class AddressController {
  /**
   * What does our data look like?
   * Mods pass in a menu_map that defines both the string (html?)
   * to use to extend the menu, plus a function to bind to the click event
   *
   * menu_map = {
   *  'Send Email': function(app, data) {
   *     data.parentmod.active = 'email_compose';
   *     data.parentmod.main.render(app, data);
   *   ***REMOVED***
   * ***REMOVED***
   *
   */

  /**
   * Responsible functionality
   *
   * 1. Rendering menu
   * 2. Helper functions to Wrap publickeys or identifiers with events on click
   * 3. Passing functions from modules and binding them to menu
   *
   */

  constructor(app, uidata, menu_item_fn_map) {
    this.app = app;
    this.uidata = uidata;

    // default items that we include
    this.menu_item_fn_map = Object.assign(
      this.defaultFunctionMap(), menu_item_fn_map
    );
  ***REMOVED***

  /**
   * This is the function map structure for Address Menu
   *
   * Other modules can include their own items by passing them
   * as a param in the constructor
   */
  defaultFunctionMap() {
    return {
      'add-contact': {
        name: 'Add Contact',
        callback: this.addContact.bind(this)
  ***REMOVED***,
      'block-contact': {
        name: 'Block Contact',
        callback: this.blockContact.bind(this)
  ***REMOVED***
***REMOVED***
  ***REMOVED***

  addContact(address) {
    let encrypt_mod = this.app.modules.returnModule('Encrypt');
    encrypt_mod.initiate_key_exchange([address]);
    alert("Exchanging Keys with Address, please wait a moment");
  ***REMOVED***

  blockContact(address) {
    alert("BLOCKING CONTACT");
  ***REMOVED***

  // pass coords to know where to put menu
  renderMenu(coords) {
    document.querySelector('body').append(elParser(AddressMenuTemplate(this.menu_item_fn_map, coords)));
    this.attachMenuEvents();
  ***REMOVED***

  detachMenu() {
    let address_menu = document.getElementById('address-menu');
    if (address_menu) {
      document.querySelector('body').removeChild(address_menu);
***REMOVED***
    // this.attachMenuEvents();
  ***REMOVED***

  attachEvents() {
    Array.from(document.getElementsByClassName('saito-address')).forEach(address => {
      var delay;

      let startTimer = (fn) => delay = setTimeout(fn, 500);
      let stopTimer = () => clearTimeout(delay);

      // return the coordinates of the element on the page
      let showAddressMenu = () => {
        this.detachMenu();
        this.selected_address = address.textContent;
        this.renderMenu(address.getBoundingClientRect());
  ***REMOVED***;

      address.onclick = (e) => {
        e.stopPropagation();
        showAddressMenu()
  ***REMOVED***;

      address.onmouseover = () => startTimer(showAddressMenu);
      address.onmouseout = () => stopTimer();
***REMOVED***);
  ***REMOVED***

  attachMenuEvents() {
    let address_menu = document.getElementById('address-menu');
    if (address_menu) {
      address_menu.onmouseover = (e) => {***REMOVED***;
      address_menu.onmouseleave = (e) => this.detachMenu();
***REMOVED***

    Object.entries(this.menu_item_fn_map).forEach(([key, value]) =>{
      console.log("KEY: ", key);
      console.log("VALUE: ", value);
      document.getElementById(key).onclick = (e) => {
        value.callback(this.selected_address);
        this.detachMenu();
  ***REMOVED***;
***REMOVED***);
  ***REMOVED***

  /**
   * Can be kicked to helper function
   * */
  returnAddressHTML(key, id="") {
    if (id == "") { id = key ***REMOVED***;
    return `<span class="saito-address saito-address-${key***REMOVED***">${id***REMOVED***</span>`
  ***REMOVED***

  updateAddressHTML(key, id) {
    if (!id) { return; ***REMOVED***
    let addresses = document.getElementsByClassName(`saito-address-${key***REMOVED***`);
    addresses.forEach(add => add.value = id);
  ***REMOVED***
***REMOVED***

module.exports = AddressController;