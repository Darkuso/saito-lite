const HomeHeaderTemplate = require('./header.template.js');
const HeaderDropdownTemplate = require('./header-dropdown.template');
const HeaderSettingsDropdownTemplate = require('./header-settings-dropdown.template');

const elParser = require('../../helpers/el_parser');

module.exports = HomeHeader = {
    render(app) {
        let body = document.querySelector('body');
        let header = document.querySelector('.header');

        header.innerHTML = HomeHeaderTemplate();
        header.classList.add('header-home');

        body.append(
            elParser(HeaderDropdownTemplate())
        );
        body.append(
            elParser(HeaderSettingsDropdownTemplate())
        );

        document.querySelector('.profile-photo').src = app.keys.returnIdenticon(app.wallet.returnPublicKey());
        document.querySelector('.profile-public-key').innerHTML = app.wallet.returnPublicKey();
        var id = '<span class="profile-register-link button">Register Address</span>';
        if (app.keys.returnIdentifierByPublicKey(app.wallet.returnPublicKey()) != "") {
            id = app.keys.returnIdentifierByPublicKey(app.wallet.returnPublicKey())
    ***REMOVED*** else {
            document.querySelector('.profile-identifier').addEventListener('click', async function() {
              document.getElementById('settings-dropdown').classList.add('show-right-sidebar-hard');
              var requestedID = await sprompt("Pick a handle or nickname. <br /><sub>Alphanumeric characters only - Do not include an @</sub.>");
              app.modules.returnModule('Registry').register_identifier(requestedID);
              id = `"${requestedID***REMOVED***@saito" requested.`;
              document.getElementById('settings-dropdown').classList.remove('show-right-sidebar-hard');
              document.querySelector('.profile-identifier').innerHTML = id;
        ***REMOVED***);
    ***REMOVED***
        document.querySelector('.profile-identifier').innerHTML = id;

***REMOVED***,

    attachEvents(app) {
        document.getElementById('navigator')
                .addEventListener('click', (e) => {
                    let dropdown = document.getElementById('modules-dropdown');
                    dropdown.toggleClass('show-right-sidebar');
            ***REMOVED***);

        document.getElementById('settings')
                .addEventListener('click', (e) => {
                    let dropdown = document.getElementById('settings-dropdown');
                    dropdown.toggleClass('show-right-sidebar');
            ***REMOVED***);

***REMOVED***document.getElementById('header-dropdown-reset-wallet')
        ***REMOVED***.addEventListener('click', (e) => {
            ***REMOVED***app.storage.resetOptions();
           ***REMOVED*** window.location.reload();
       ***REMOVED*** ***REMOVED***);

***REMOVED***document.getElementById('header-dropdown-load-wallet')
       ***REMOVED***.addEventListener('click', (e) => {
          ***REMOVED***  console.log("LOAD WALLET");
        ***REMOVED******REMOVED***);

        window.addEventListener('click', (e) => {
            if (e.target.id !== "navigator") {
                document.getElementById('modules-dropdown').classList.remove('show-right-sidebar');
        ***REMOVED***

            if (e.target.id !== "settings") {
                document.getElementById('settings-dropdown').classList.remove('show-right-sidebar');
        ***REMOVED***
    ***REMOVED***);

***REMOVED***
***REMOVED***
