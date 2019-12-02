***REMOVED***
const ModTemplate = require('../../lib/templates/modtemplate');
const AppStoreAppspace = require('./lib/email-appspace/appstore-appspace');
const AppStoreSearch = require('./lib/email-appspace/appstore-search');



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

      let sql = "SELECT * FROM modules";
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

***REMOVED***
***REMOVED*** recursively go through and find all files in dir
***REMOVED***
        function getFiles(dir) {
          const dirents = fs.readdirSync(dir, { withFileTypes: true ***REMOVED***);
          const files = dirents.map((dirent) => {
            const res = path.resolve(dir, dirent.name);
            return dirent.isDirectory() ? getFiles(res) : res;
      ***REMOVED***);
          return Array.prototype.concat(...files);
    ***REMOVED***

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
    // let appstore = app.modules.returnModule('AppStore');
    let txmsg = tx.returnMessage();
    if (conf == 0) {
      switch(txmsg.request) {
        case 'submit module':
          this.submitModule(blk, tx);
          break;
        case 'request bundle':
          this.requestBundle(blk, tx);
          break;
        default:
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

    return { name, description ***REMOVED***;
  ***REMOVED***


  async submitModule(blk, tx) {
    // const path = require('path');

    let sql = `INSERT INTO modules (name, description, version, publickey, unixtime, bid, bsh, tx)
    VALUES ($name, $description, $version, $publickey, $unixtime, $bid, $bsh, $tx)`;

    let { from, sig, ts ***REMOVED*** = tx.transaction;
    // const fs = this.app.storage.returnFileSystem();

    // should happen locally from ZIP
    let { zip ***REMOVED*** = tx.returnMessage();

    let { name, description ***REMOVED*** = await this.getNameAndDescriptionFromZip(zip, `mods/module-${sig***REMOVED***-${ts***REMOVED***.zip`);

    let params = {
      $name:		name,
      $description:	'',
      $version:		`${ts***REMOVED***-${sig***REMOVED***`,
      $publickey:	from[0].add,
      $unixtime:	ts,
      $bid:		blk.block.id,
      $bsh:		blk.returnHash(),
      $tx:		JSON.stringify(tx.transaction),
***REMOVED***;

    this.app.storage.executeDatabase(sql, params, "appstore");
  ***REMOVED***


  async requestBundle(blk, tx) {

    let sql = '';
    let params = '';
    let txmsg = tx.returnMessage();
    let module_list = txmsg.list;

console.log("request bundle: " + JSON.stringify(module_list));

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

console.log("MOD SEL: " + JSON.stringify(modules_selected));

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

    let bundle_filename = await bundler(modules_selected);


    //
    // insert resulting JS into our bundles database
    //
    sql = `INSERT INTO bundles (version, publickey, unixtime, bid, bsh, script) VALUES ($version, $publickey, $unixtime, $bid, $bsh, $script)`;
    let { from, sig, ts, msg ***REMOVED*** = tx.transaction;
    params = {
      $version	:	`${ts***REMOVED***-${sig***REMOVED***`,
      $publickey	:	from[0].add ,
      $unixtime	:	ts ,
      $bid		:	blk.block.id ,
      $bsh		:	blk.returnHash() ,
      $script : msg.bundle,
***REMOVED***
    this.app.storage.executeDatabase(sql, params, "appstore");
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
    const path = require('path');

    let ts = new Date().getTime();
    let hash = this.app.crypto.hash(versions.join(''));

    //
    // first
    //
    let modules_config_filename = `modules.config-${ts***REMOVED***-${hash***REMOVED***.json`;

    let module_paths = modules.map(mod => {
      let mod_path = `modules/${mod.name.toLowercase()***REMOVED***-${ts***REMOVED***-${hash***REMOVED***.zip`;
      fs.writeFileSync(path.resolve(__dirname, mod_path), mod.zip, { encoding: 'binary' ***REMOVED***);
      fs.createReadStream(mod_path)
        .pipe(unzipper.Extract({ path: `bundler/mods/${mod.name.toLowercase()***REMOVED***-${ts***REMOVED***-${hash***REMOVED***` ***REMOVED***));

        return `${mod.name.toLowercase()***REMOVED***-${ts***REMOVED***-${hash***REMOVED***/${mod.name.toLowercase()***REMOVED***`;
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

    // //
    // // delete bundle
    // //
    // fs.unlink(path.resolve(__dirname, `bundler/dist/${bundle_filename***REMOVED***`));

    return bundle_filename;
  ***REMOVED***




  //
  // override webserver to permit module-hosting
  //
  webServer(app, expressapp, express) {

    let fs = app.storage.returnFileSystem();
    if (fs != null) {
      expressapp.use('/'+encodeURI(this.name), express.static(__dirname + "/web"));

      expressapp.post('/bundle', async (req, res) => {
        const path = require('path');
***REMOVED***
***REMOVED*** require inclusion of  module versions and paths for loading into the system
***REMOVED***
        let { versions, paths ***REMOVED*** = req.body;

        let ts = new Date().getTime();
        let hash = this.app.crypto.hash(versions.join(''));

        let bundle_filename = `saito-${ts***REMOVED***-${hash***REMOVED***.js`;
        let index_filename  = `index-${ts***REMOVED***-${hash***REMOVED***.js`;
        let modules_config_filename = `modules.config-${ts***REMOVED***-${hash***REMOVED***.json`;

***REMOVED***
***REMOVED*** write our modules config file
***REMOVED***
        await fs.writeFile(path.resolve(__dirname, `bundler/${modules_config_filename***REMOVED***`),
          JSON.stringify({paths***REMOVED***)
        );

***REMOVED***
***REMOVED*** write our index file for bundling
***REMOVED***
        let IndexTemplate = require('./bundler/templates/index.template.js');
        await fs.writeFile(path.resolve(__dirname, `bundler/${index_filename***REMOVED***`),
          IndexTemplate(modules_config_filename)
        );

***REMOVED***
***REMOVED*** TODO: unzip existing modules and stage them
***REMOVED***

***REMOVED***
***REMOVED*** execute bundling process
***REMOVED***
        let entry = path.resolve(__dirname, `bundler/${index_filename***REMOVED***`);
        let output_path = path.resolve(__dirname, 'bundler/dist');

        const util = require('util');
        const exec = util.promisify(require('child_process').exec);

***REMOVED***
          const { stdout, stderr ***REMOVED*** = await exec(
            `node webpack.js ${entry***REMOVED*** ${output_path***REMOVED*** ${bundle_filename***REMOVED***`
          );
    ***REMOVED*** catch (err) {
          console.log(err);
    ***REMOVED***

***REMOVED*** Done processing

***REMOVED***
***REMOVED*** file cleanup
***REMOVED***
        fs.unlink(path.resolve(__dirname, `bundler/${index_filename***REMOVED***`));
        fs.unlink(path.resolve(__dirname, `bundler/${modules_config_filename***REMOVED***`));


***REMOVED***
***REMOVED*** if there are no errors, send response back
***REMOVED***
        res.send({
          payload: {
            filename: bundle_filename
      ***REMOVED***
    ***REMOVED***);

***REMOVED***
***REMOVED*** create tx
***REMOVED***
        let newtx = this.createBundleTX(bundle_filename);

***REMOVED***
***REMOVED*** publish our bundle
***REMOVED***
        this.app.network.propagateTransaction(newtx);

***REMOVED***
***REMOVED*** delete bundle
***REMOVED***
        fs.unlink(path.resolve(__dirname, `bundler/dist/${bundle_filename***REMOVED***`));
  ***REMOVED***);
***REMOVED***
  ***REMOVED***

***REMOVED***




module.exports = AppStore;
