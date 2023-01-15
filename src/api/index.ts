import { Router } from 'express';

import room from './routes/room';
import webhooks from './routes/webhooks';

// guaranteed to get dependencies
export default () => {
  const router = Router();

  room(router);
  webhooks(router);

  return router;
};
