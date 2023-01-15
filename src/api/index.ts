import { Router } from 'express';

import room from './routes/room';

// guaranteed to get dependencies
export default () => {
  const router = Router();

  room(router);

  return router;
};
