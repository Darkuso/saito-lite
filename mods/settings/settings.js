const SettingsAppspace = require('./lib/email-appspace/settings-appspace');
var saito = require('../../lib/saito/saito');
var ModTemplate = require('../../lib/templates/modtemplate');


class Settings extends ModTemplate {

  constructor(app) {
    super(app);

    this.app            = app;
    this.name           = "Settings";
    this.link           = "/email?module=settings";

//    if (app.modules.returnModule("Email") != null) { this.link = "/email?module=settings"; ***REMOVED***

    return this;
  ***REMOVED***




  respondTo(type) {

    if (type == "header-dropdown") {
//      return {***REMOVED***;
***REMOVED***
    if (type == 'email-appspace') {
      let obj = {***REMOVED***;
	  obj.render = function (app, data) {
     	    SettingsAppspace.render(app, data);
      ***REMOVED***
	  obj.attachEvents = function (app, data) {
     	    SettingsAppspace.attachEvents(app, data);
	  ***REMOVED***
      return obj;
***REMOVED***

    return null;
  ***REMOVED***

***REMOVED***







module.exports = Settings;


