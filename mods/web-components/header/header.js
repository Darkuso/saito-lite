const HomeHeaderTemplate = require('./header.template.js');

module.exports = HomeHeader = {
    render(app) {
        let header = document.querySelector('.header');
        header.innerHTML = HomeHeaderTemplate();
        header.classList.add('header-home');

        this.attachEvents(app);
    },

    attachEvents(app) {
        // document.querySelector('#notifications.header-icon')
        //         .addEventListener('click', () => {
        //             app.email.render();
        //         });

        // document.querySelector('#settings.header-icon')
        //         .addEventListener('click', () => {
        //             app.settings.render();
        //         });
    }
}
