import { Saito ***REMOVED*** from '../../index'
import mods_config from '../../../config/modules.config';

async function init() {
  let saito = new Saito({ mod_paths: mods_config.lite ***REMOVED***);
  await saito.init();
***REMOVED***

init();
