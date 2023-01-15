import { Router, Request, Response } from 'express';
import Mux from '@mux/mux-node';
import config from '../../config';


const route = Router();

export default (app: Router) => {
  app.use('/webhooks', route);

  route.post('/mux', async (req: Request, res: Response) => {
    console.log(req.body);
    res.send(req.body);
  })
};
