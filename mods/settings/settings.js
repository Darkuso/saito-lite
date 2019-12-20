const SettingsAppspace = require('./lib/email-appspace/settings-appspace');
var saito = require('../../lib/saito/saito');
var ModTemplate = require('../../lib/templates/modtemplate');


class Settings extends ModTemplate {

  constructor(app) {
    super(app);

    this.app            = app;
    this.name           = "Settings";
    this.link           = "/email?module=settings";

//    if (app.modules.returnModule("Email") != null) { this.link = "/email?module=settings"; }

    return this;
  }




  respondTo(type) {

    if (type == "header-dropdown") {
      return {};
    }
    if (type == 'email-appspace') {
      let obj = {};
	  obj.render = function (app, data) {
     	    SettingsAppspace.render(app, data);
          }
	  obj.attachEvents = function (app, data) {
     	    SettingsAppspace.attachEvents(app, data);
	  }
      return obj;
    }

    return null;
  }

}







module.exports = Settings;


