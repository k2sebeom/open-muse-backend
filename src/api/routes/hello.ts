import { Router, Request, Response } from 'express';

const route = Router();

export default (app: Router) => {
  app.use('/hello', route);

  route.get('/', async (req: Request, res: Response) => {
    res.send({ data: 'Hello World' });
  });
};
