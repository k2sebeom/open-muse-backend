import { Router } from 'express';

import hello from './routes/hello';

// guaranteed to get dependencies
export default () => {
  const router = Router();

  hello(router);

  return router;
};
