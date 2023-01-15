import { Router, Request, Response } from 'express';
import Container from 'typedi';
import RoomService from '../../services/room';
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

  route.post('/', async (req: Request, res: Response) => {
    // Create room
    const { title, description, mode } = req.body;
    const password = req.body.password;

    const roomService = Container.get(RoomService);

    const room = await roomService.createRoom(title, description, mode, password);
    res.send({
      data: room
    });
  });

  route.post('/:id/join', async (req: Request, res: Response) => {
    // Join the room (need password if required)
    // Gets stream key and stuff
  });

  route.post('/:id/perform', async (req: Request, res: Response) => {
    // Perform in the room
    // After active, returns the response
  });
};
