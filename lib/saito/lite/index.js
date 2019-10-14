import App from './src/app';

import { Saito } from '../../index'
import mods_config from '../../../config/modules.config';

async function init() {
  let config = {
    mod_paths: mods_config.lite,
    peers:[{"host": "localhost", "port": 12101, "protocol": "http", "publickey": "", "synctype": "lite"}]
  };

  let app = new App();
  let saito = new Saito(config);

  await saito.init();
  app.init(saito);
}

init();
