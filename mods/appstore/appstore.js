***REMOVED***
const ModTemplate = require('../../lib/templates/modtemplate');
const AppStoreAppspace = require('./lib/email-appspace/appstore-appspace');
const AppStoreSearch = require('./lib/email-appspace/appstore-search');

const fs = require('fs');
const path = require('path');

//
// recursively go through and find all files in dir
//
function getFiles(dir) {
  const dirents = fs.readdirSync(dir, { withFileTypes: true ***REMOVED***);
  const files = dirents.map((dirent) => {
    const res = path.resolve(dir, dirent.name);
    return dirent.isDirectory() ? getFiles(res) : res;
  ***REMOVED***);
  return Array.prototype.concat(...files);
***REMOVED***

class AppStore extends ModTemplate {

  constructor(app) {
    super(app);

    this.app = app;
    this.name = "AppStore";
  ***REMOVED***




  respondTo(type) {
    if (type == 'email-appspace') {
      let obj = {***REMOVED***;
          obj.render = this.renderEmail;
          obj.attachEvents = this.attachEventsEmail;
      return obj;
***REMOVED***
    return null;
  ***REMOVED***
  renderEmail(app, data) {
     data.appstore = app.modules.returnModule("AppStore");
     AppStoreAppspace.render(app, data);
     AppStoreSearch.render(app, data);
  ***REMOVED***
  attachEventsEmail(app, data) {
     data.appstore = app.modules.returnModule("AppStore");
     AppStoreAppspace.attachEvents(app, data);
     AppStoreSearch.attachEvents(app, data);
  ***REMOVED***



  //
  // database queries inbound here
  //
  async handlePeerRequest(app, message, peer, mycallback=null) {

    if (message.request === "appstore load modules") {

      let sql = "SELECT name, description, version, publickey, unixtime, bid, bsh FROM modules";
      let params = {***REMOVED***;
      let rows = await this.app.storage.queryDatabase(sql, params, message.data.dbname);

      let res = {***REMOVED***;
          res.err = "";
          res.rows = rows;

      mycallback(res);

***REMOVED***
  ***REMOVED***

  installModule(app) {
    if (this.app.BROWSER == 1) { return; ***REMOVED***

    super.installModule(app);

    let fs = app.storage.returnFileSystem();

    if (fs != null) {

      const archiver = require('archiver');
      const path = require('path');

      //
      // get a list of module directories
      //
      const getDirectories = source =>
        fs.readdirSync(source, { withFileTypes: true ***REMOVED***)
          .filter(dirent => dirent.isDirectory())
          .map(dirent => dirent.name)

      let mods_dir_path = path.resolve(__dirname, '../');
      let dirs = getDirectories(mods_dir_path);

      if (!fs.existsSync(path.resolve(__dirname, `mods`))){
        fs.mkdirSync(path.resolve(__dirname, `mods`));
  ***REMOVED***

      //
      // zip each module and output it to modules subdir
      //
      dirs.forEach(dir => {

        let mod_path = path.resolve(__dirname, `mods/${dir***REMOVED***.zip`);
        let output = fs.createWriteStream(mod_path);

        var archive = archiver('zip', {
          zlib: { level: 9 ***REMOVED*** // Sets the compression level.
    ***REMOVED***);

        archive.on('error', function(err) {
          throw err;
    ***REMOVED***);

        archive.pipe(output);

        let file_array = getFiles(`${mods_dir_path***REMOVED***/${dir***REMOVED***/`);

***REMOVED***
***REMOVED*** append them to the archiver
***REMOVED***
        file_array.forEach(file => {
          let fileReadStream = fs.createReadStream(file);
          let pathBasename = path.basename(file);
          archive.append(fileReadStream, { name: pathBasename***REMOVED***);
    ***REMOVED***);

***REMOVED*** listen for all archive data to be written
***REMOVED*** 'close' event is fired only when a file descriptor is involved
        output.on('close', function() {
          console.log(archive.pointer() + ' total bytes');

          let mod_zip_filename = path.basename(this.path);
          let mod_path = path.resolve(__dirname, `mods/${mod_zip_filename***REMOVED***`);
  ***REMOVED*** let zip_text = fs.readFileSync(mod_path, 'utf-8');
  ***REMOVED*** let name, description = this.getNameAndDescriptionFromZip(zip_text);
  ***REMOVED***
  ***REMOVED*** read in the zip file as base64 and propagate it to the network
  ***REMOVED***
          let newtx = app.wallet.createUnsignedTransactionWithDefaultFee();
          let zip = fs.readFileSync(mod_path, { encoding: 'binary' ***REMOVED***);

          newtx.transaction.msg = {
            module: "AppStore",
            request: "submit module",
            zip,
            name: dir,
      ***REMOVED***;

          newtx = app.wallet.signTransaction(newtx);
          app.network.propagateTransaction(newtx);
    ***REMOVED***);

        archive.finalize();
  ***REMOVED***);

***REMOVED***
  ***REMOVED***

  initialize(app) {
    super.initialize(app);
  ***REMOVED***


  onConfirmation(blk, tx, conf, app) {
    let txmsg = tx.returnMessage();
    if (conf == 0) {
      switch(txmsg.request) {
        case 'submit module':
          this.submitModule(blk, tx);
          break;
        case 'request bundle':
          this.requestBundle(blk, tx);
          break;
        case 'receive bundle':
          if ( tx.isTo(app.wallet.returnPublicKey()) )
            this.receiveBundle(blk, tx);
          break;
  ***REMOVED***
***REMOVED***
  ***REMOVED***

  async getNameAndDescriptionFromZip(zip_bin, zip_path) {
    const fs = this.app.storage.returnFileSystem();
    const path = require('path');
    const unzipper = require('unzipper');

    fs.writeFileSync(path.resolve(__dirname, zip_path), zip_bin, { encoding: 'binary' ***REMOVED***);

    let name = 'Unknown Module';
    let description = 'unknown';

    try {
      const directory = await unzipper.Open.file(path.resolve(__dirname, zip_path));
      // const file =
      let promises = directory.files.map(async file => {
        let content = await file.buffer();
        let zip_text = content.toString('utf-8')

***REMOVED***
***REMOVED*** get name and description
        let getNameRegex = RegExp('[\n\r]*this.name\s*([^\n\r]*)');
        let getDescriptionRegex = RegExp('[\n\r]*this.description\s*([^\n\r]*)');
        let cleanupRegex = RegExp('=(.*)');

        let nameMatch = zip_text.match(getNameRegex);
        let descriptionMatch = zip_text.match(getDescriptionRegex);

        if (!nameMatch) { return; ***REMOVED***
        if (nameMatch[1].length > 30) { return; ***REMOVED***
        if (nameMatch[1] == "this.name\s*([^\n\r]*)');") { return; ***REMOVED***

        function cleanString(str) {
          str = str.substring(1, str.length - 1);
          return [...str].map(char => {
            if (char == "\'" || char == "\"" || char == ";") return ''
            return char
      ***REMOVED***).join('');
    ***REMOVED***

        let nameCleanup = nameMatch[1].match(cleanupRegex);
        if (!nameCleanup) { return; ***REMOVED***
        name = cleanString(nameCleanup[1]);

        if (!descriptionMatch) { return; ***REMOVED***
        let descriptionCleanup = descriptionMatch[1].match(cleanupRegex);
        if (!descriptionCleanup) { return; ***REMOVED***
        description = cleanString(descriptionCleanup[1]);

  ***REMOVED***);

      await Promise.all(promises);
***REMOVED*** catch(err) {
      console.log(err);
***REMOVED***

    //
    // delete unziped module
    //
    fs.unlink(path.resolve(__dirname, zip_path));

    return { name, description ***REMOVED***;
  ***REMOVED***


  async submitModule(blk, tx) {

    if (this.app.BROWSER == 1) { return; ***REMOVED***

    let sql = `INSERT INTO modules (name, description, version, publickey, unixtime, bid, bsh, tx)
    VALUES ($name, $description, $version, $publickey, $unixtime, $bid, $bsh, $tx)`;

    let { from, sig, ts ***REMOVED*** = tx.transaction;
    // const fs = this.app.storage.returnFileSystem();

    // should happen locally from ZIP
    let { zip ***REMOVED*** = tx.returnMessage();

    let { name, description ***REMOVED*** = await this.getNameAndDescriptionFromZip(zip, `mods/module-${sig***REMOVED***-${ts***REMOVED***.zip`);


    let params = {
      $name: name,
      $description:	description || '',
      $version:	`${ts***REMOVED***-${sig***REMOVED***`,
      $publickey:	from[0].add,
      $unixtime: ts,
      $bid:	blk.block.id,
      $bsh:	blk.returnHash(),
      $tx: JSON.stringify(tx.transaction),
***REMOVED***;

    this.app.storage.executeDatabase(sql, params, "appstore");
  ***REMOVED***


  async requestBundle(blk, tx) {

    if (this.app.BROWSER == 1) { return; ***REMOVED***

    let sql = '';
    let params = '';
    let txmsg = tx.returnMessage();
    let module_list = txmsg.list;

    //
    // module list = [
    //   { name : "Email" , version : "" ***REMOVED*** ,
    //   { name : "", version : "1830591927-AE752CDF7529E0419C2E13ABCCD6ABCA252313" ***REMOVED***
    // ]
    //
    let module_names = [];
    let module_versions = [];
    let modules_selected = [];

    for (let i = 0; i < module_list.length; i++) {
      if (module_list[i].version != "") {
        module_versions.push(module_list[i].version);
  ***REMOVED*** else {
        if (module_list[i].name != "") {
          module_names.push(module_list[i].name);
    ***REMOVED***
  ***REMOVED***
***REMOVED***

    //
    // TO-DO single query, not loop
    //
    for (let i = 0; i < module_versions.length; i++) {
      sql = `SELECT * FROM modules WHERE version = $version`;
      params = { $version : module_versions[i] ***REMOVED***;
      let rows = await this.app.storage.queryDatabase(sql, params, "appstore");

      for (let i = 0; i < rows.length; i++) {
        let tx = JSON.parse(rows[i].tx);
        modules_selected.push(
          {
            name : rows[i].name ,
            description : rows[i].description ,
            zip : tx.msg.zip
      ***REMOVED***
        );
  ***REMOVED***
***REMOVED***

    //
    // supplement with preferred versions of unversioned apps
    //
    //
    for (let i = 0; i < module_names.length; i++) {
      sql = `SELECT * FROM modules WHERE name = $name`;
      params = { $name : module_names[i] ***REMOVED***;
      let rows = await this.app.storage.queryDatabase(sql, params, "appstore");

      for (let i = 0; i < rows.length; i++) {
        let tx = JSON.parse(rows[i].tx);
        modules_selected.push(
          {
            name : rows[i].name ,
            description : rows[i].description ,
            zip : tx.msg.zip
      ***REMOVED***
        );
  ***REMOVED***
***REMOVED***

// console.log("MOD SEL: " + JSON.stringify(modules_selected));

    //
    // modules_selected contains our modules
    //
    // WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK
    // WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK
    // WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK
    // WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK
    // WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK
    // WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK
    // WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK
    // WEBPACK WEBPACK WEBPACK WEBPACK CANT GET ENOUGH OF THIS WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK
    // WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK
    // WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK
    // WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK
    // WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK
    // WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK
    // WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK
    // WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK WEBPACK
    //
    //

    let bundle_filename = await this.bundler(modules_selected);


    //
    // insert resulting JS into our bundles database
    //
    let bundle_binary = fs.readFileSync(path.resolve(__dirname, `bundler/dist/${bundle_filename***REMOVED***`), { encoding: 'binary' ***REMOVED***);

    //
    // show link to bundle or save in it? Should save it as a file
    //
    sql = `INSERT INTO bundles (version, publickey, unixtime, bid, bsh, name, script) VALUES ($version, $publickey, $unixtime, $bid, $bsh, name, script)`;
    let { from, sig, ts ***REMOVED*** = tx.transaction;
    params = {
      $version	:	`${ts***REMOVED***-${sig***REMOVED***`,
      $publickey	:	from[0].add,
      $unixtime	:	ts,
      $bid		:	blk.block.id ,
      $bsh		:	blk.returnHash(),
      $name: bundle_filename,
      $script : bundle_binary,
***REMOVED***

    this.app.storage.executeDatabase(sql, params, "appstore");

    //
    // send our filename back at our person of interest
    //
    let newtx = this.app.wallet.createUnsignedTransactionWithDefaultFee(from[0].add);
    let msg = {
      module: "AppStore",
      request: "receive bundle",
      bundle_filename
***REMOVED***;

    newtx.transaction.msg = msg;
    newtx = this.app.wallet.signTransaction(newtx);

    this.app.network.propagateTransaction(newtx);
  ***REMOVED***

  createBundleTX(filename) {
    const path = require('path');
    let fs = this.app.storage.returnFileSystem();
    if (fs) {
      let bundle_bin = fs.readFileSync(path.resolve(__dirname, `bundler/dist/${filename***REMOVED***`), { encoding: 'binary' ***REMOVED***);
      let newtx = this.app.wallet.createUnsignedTransactionWithDefaultFee();
      newtx.transaction.msg = { module: "AppStore", request: "add bundle", bundle: bundle_bin ***REMOVED***;
      return this.app.wallet.signTransaction(newtx);
***REMOVED***
    return null;
  ***REMOVED***

  async bundler(modules) {
    //
    // modules has name, description, zip (helpful)
    //
    // require inclusion of  module versions and paths for loading into the system
    //

    const fs = this.app.storage.returnFileSystem();
    const path = require('path');
    const unzipper = require('unzipper');

    let ts = new Date().getTime();
    let hash = this.app.crypto.hash(modules.map(mod => mod.version).join(''));

    //
    // first
    //
    let modules_config_filename = `modules.config-${ts***REMOVED***-${hash***REMOVED***.json`;

    let module_paths = modules.map(mod => {
      let mod_path = `mods/${mod.name.toLowerCase()***REMOVED***-${ts***REMOVED***-${hash***REMOVED***.zip`;
      fs.writeFileSync(path.resolve(__dirname, mod_path), mod.zip, { encoding: 'binary' ***REMOVED***);
      fs.createReadStream(path.resolve(__dirname, mod_path))
        .pipe(unzipper.Extract({
          path: path.resolve(__dirname, `bundler/mods/${mod.name.toLowerCase()***REMOVED***-${ts***REMOVED***-${hash***REMOVED***`)
    ***REMOVED***));

      //
      // delete the other files
      //
      fs.unlink(path.resolve(__dirname, mod_path));

      // return the path
      return `${mod.name.toLowerCase()***REMOVED***-${ts***REMOVED***-${hash***REMOVED***/${mod.name.toLowerCase()***REMOVED***`;
***REMOVED***);

    //
    // write our modules config file
    //
    await fs.writeFile(path.resolve(__dirname, `bundler/${modules_config_filename***REMOVED***`),
      JSON.stringify({module_paths***REMOVED***)
    );

    //
    // other filenames
    //
    let bundle_filename = `saito-${ts***REMOVED***-${hash***REMOVED***.js`;
    let index_filename  = `index-${ts***REMOVED***-${hash***REMOVED***.js`;

    //
    // write our index file for bundling
    //
    let IndexTemplate = require('./bundler/templates/index.template.js');
    await fs.writeFile(path.resolve(__dirname, `bundler/${index_filename***REMOVED***`),
      IndexTemplate(modules_config_filename)
    );

    //
    // TODO: unzip existing modules and stage them
    //

    //
    // execute bundling process
    //
    let entry = path.resolve(__dirname, `bundler/${index_filename***REMOVED***`);
    let output_path = path.resolve(__dirname, 'bundler/dist');

    const util = require('util');
    const exec = util.promisify(require('child_process').exec);

    try {
      const { stdout, stderr ***REMOVED*** = await exec(
        `node webpack.js ${entry***REMOVED*** ${output_path***REMOVED*** ${bundle_filename***REMOVED***`
      );
***REMOVED*** catch (err) {
      console.log(err);
***REMOVED***

    // Done processing

    //
    // file cleanup
    //
    fs.unlink(path.resolve(__dirname, `bundler/${index_filename***REMOVED***`));
    fs.unlink(path.resolve(__dirname, `bundler/${modules_config_filename***REMOVED***`));

    //
    // create tx
    //
    let newtx = this.createBundleTX(bundle_filename);

    //
    // publish our bundle
    //
    this.app.network.propagateTransaction(newtx);

    module_paths.forEach(modpath => {
      let mod_dir = modpath.split('/')[0];
      let files = getFiles(path.resolve(__dirname, `bundler/mods/${mod_dir***REMOVED***`));
      files.forEach(file_path => fs.unlink(file_path));
      fs.rmdir(path.resolve(__dirname, `bundler/mods/${mod_dir***REMOVED***`));
***REMOVED***);

    return bundle_filename;
  ***REMOVED***

  receiveBundle(blk, tx) {
    let txmsg = tx.returnMessage();
    let { bundle_filename ***REMOVED*** = txmsg;

    this.app.options.bundle = bundle_filename;
    this.app.storage.saveOptions();

    salert(`Bundle filename received!: ${bundle_filename***REMOVED***`);
  ***REMOVED***




  //
  // override webserver to permit module-hosting
  //
  webServer(app, expressapp, express) {

    let fs = app.storage.returnFileSystem();
    if (fs != null) {
      expressapp.use('/'+encodeURI(this.name), express.static(__dirname + "/web"));
      expressapp.get('/appstore/bundle/:filename', async (req, res) => {
  ***REMOVED***);
***REMOVED***
  ***REMOVED***

***REMOVED***




module.exports = AppStore;
