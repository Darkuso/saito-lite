var saito = require('../../lib/saito/saito');
var ModTemplate = require('../../lib/templates/modtemplate');


class Roles extends ModTemplate {

  constructor(app) {
    super(app);

    this.app            = app;
    this.name           = "Roles";

    return this;
  }




  respondTo(type) {
    return null;
  }



}







module.exports = Roles;


