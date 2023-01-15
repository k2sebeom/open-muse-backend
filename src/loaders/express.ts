import * as express from 'express';

import router from '../api';
import config from '../config';
import * as cors from 'cors';

export default async (app) => {
  app.get('/health', (req: express.Request, res: express.Response) => {
    res.status(200).send({
      status: true,
    });
  });

  // Use CORS
  app.use(cors());

  app.use(express.json());

  // Load API routes
  app.use(config.api.prefix, router());
};
