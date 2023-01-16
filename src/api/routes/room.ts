import { Router, Request, Response } from 'express';
import Container from 'typedi';
import RoomService from '../../services/room';
import db from '../../utils/db';
import Agora from 'agora-access-token';

const route = Router();

export default (app: Router) => {
  app.use('/room', route);

  route.get('/list', async (req: Request, res: Response) => {
    const page = parseInt(!req.query.page ? '1' : (req.query.page as string));
    const take = 10;

    const rooms = await db.room.findMany({
      orderBy: {
        createdAt: 'asc',
      },
      skip: (page - 1) * take,
      take,
    });

    res.send({
      data: rooms,
    });
  });

  route.get('/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if(!id) {
      res.status(400).send({
        msg: "Room id should be a number"
      })
      return;
    }

    const room = await db.room.findFirst({
      where: {id}
    });
    if(!room) {
      res.sendStatus(404);
      return;
    };
    res.send({
      data: room,
    });
  });

  route.post('/', async (req: Request, res: Response) => {
    // Create room
    const { title, description, mode } = req.body;
    const password = req.body.password;

    const roomService = Container.get(RoomService);

    const room = await roomService.createRoom(
      title,
      description,
      mode,
      password
    );
    res.send({
      data: room,
    });
  });

  route.post('/:id/join', async (req: Request, res: Response) => {
    // Join the room (need password if required)
    // Gets stream key and stuff
    const id = parseInt(req.params.id);
    const { username } = req.body;

    // Fetch room info first
    const room = await db.room.findUnique({
      where: {
        id,
      },
    });
    if (!room) {
      res.status(404).send({
        data: `Room with id ${id} not found`,
      });
      return;
    }

    if (room.password != null) {
      const password = req.body.password;
      if (!password) {
        res.status(401).send({
          data: 'This room is locked by password',
        });
        return;
      }
      if (password !== room.password) {
        res.status(401).send({
          data: 'Password is incorrect',
        });
        return;
      }
    }
    const roomService = Container.get(RoomService);
    const rtcToken = roomService.getRtcToken(`channel-${room.id}`, username);

    res.send({
      data: {
        ...room,
        rtcToken,
      },
    });
  });

  route.post('/:id/perform', async (req: Request, res: Response) => {
    // Perform in the room
    // After active, returns the response
  });
};
