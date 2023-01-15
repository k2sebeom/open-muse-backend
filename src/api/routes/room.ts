import { Router, Request, Response } from 'express';
import db from '../../utils/db';

const route = Router();

export default (app: Router) => {
  app.use('/room', route);

  route.get('/list', async (req: Request, res: Response) => {
    const page = parseInt(!req.query.page ? '1' : req.query.page as string);
    const take = 10;

    const rooms = await db.room.findMany({
      orderBy: {
        createdAt: 'asc'
      },
      skip: (page - 1) * take,
      take
    })

    res.send(
      {
        data: rooms
      }
    )
  });
};
