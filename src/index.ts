import 'reflect-metadata';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import config from './config';

import loaders from './loaders';

async function runServer() {
  const app = express();

  const server = createServer(app);

  const io = new Server(server, {
    cors: {
      origin: '*'      
    }
  });

  await loaders({ expressApp: app, io });

  server.listen(config.port, () => {
    console.log(`
            ####################################
            🛡️  Server listening on port: ${config.port} 🛡️
            ####################################
        `);
  });
}

runServer();
