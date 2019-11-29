const HomeHeaderTemplate = require('./header.template.js');
const HeaderDropdownTemplate = require('./header-dropdown.template');
const HeaderSettingsDropdownTemplate = require('./header-settings-dropdown.template');

const elParser = require('../../helpers/el_parser');

module.exports = HomeHeader = {
    render(app) {
        let header = document.querySelector('.header');

        header.innerHTML = HomeHeaderTemplate();
        header.classList.add('header-home');

        header.append(
            elParser(HeaderDropdownTemplate())
        );
        header.append(
            elParser(HeaderSettingsDropdownTemplate())
        );

        document.querySelector('.profile-photo').src = app.keys.returnIdenticon(app.wallet.returnPublicKey());
        document.querySelector('.profile-public-key').innerHTML = app.wallet.returnPublicKey();
        var id = '<span class="profile-register-link button">Register Address</span>';
        if (app.keys.returnIdentifierByPublicKey(app.wallet.returnPublicKey()) != "") {
            id = app.keys.returnIdentifierByPublicKey(app.wallet.returnPublicKey())
        } else {
            document.querySelector('.profile-identifier').addEventListener('click', async function() {
              document.getElementById('settings-dropdown').classList.add('show-right-sidebar-hard');
              var requestedID = await sprompt("Pick a handle or nickname. <br /><sub>Alphanumeric characters only - Do not include an @</sub.>");
              app.modules.returnModule('Registry').register_identifier(requestedID);
              id = `"${requestedID}@saito" requested.`;
              document.getElementById('settings-dropdown').classList.remove('show-right-sidebar-hard');
              document.querySelector('.profile-identifier').innerHTML = id;
            });
        }
        document.querySelector('.profile-identifier').innerHTML = id;

    },

    attachEvents(app) {
        document.getElementById('navigator')
                .onclick = () => {
                    let dropdown = document.getElementById('modules-dropdown');
                    dropdown.toggleClass('show-right-sidebar');
                };

        document.getElementById('settings')
                .onclick = () => {
                    let dropdown = document.getElementById('settings-dropdown');
                    dropdown.toggleClass('show-right-sidebar');
                };

        document.getElementById('header-dropdown-reset-wallet')
                .onclick = () => {
                    app.storage.resetOptions();
                    window.location.reload();
                };

        //document.getElementById('header-dropdown-load-wallet')
               //.addEventListener('click', (e) => {
                  //  console.log("LOAD WALLET");
                //});

        window.addEventListener('click', (e) => {
            if (e.target.id !== "navigator") {
                document.getElementById('modules-dropdown').classList.remove('show-right-sidebar');
            }

            if (e.target.id !== "settings") {
                document.getElementById('settings-dropdown').classList.remove('show-right-sidebar');
            }
        });

    }
}
