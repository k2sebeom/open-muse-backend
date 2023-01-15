import 'reflect-metadata';
import * as express from 'express';
import config from './config';

import loaders from './loaders';

async function runServer() {
  const app = express();

  await loaders({ expressApp: app });

  app.listen(config.port, () => {
    console.log(`
            ####################################
            🛡️  Server listening on port: ${config.port} 🛡️
            ####################################
        `);
  });
}

runServer();
