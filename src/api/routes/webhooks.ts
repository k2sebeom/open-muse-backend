import { Router, Request, Response } from 'express';
import Mux from '@mux/mux-node';
import config from '../../config';
import Container from 'typedi';
import RoomService from '../../services/room';
import db from '../../utils/db';


const route = Router();

export default (app: Router) => {
  app.use('/webhooks', route);

  route.post('/mux', async (req: Request, res: Response) => {
    const body = req.body;

    const roomService = Container.get(RoomService);

    const room = await db.room.findUnique({
      where: {
        streamKey: body.data.stream_key
      }
    });

    if(body.type === 'video.live_stream.connected') {
      roomService.startNotifyRoomStatus(room.id);
    }
    else if(body.type === 'video.live_stream.active') {
      roomService.updateRoomStatus(room.id);
    }
    else if(body.type === 'video.live_stream.disconnected') {
      roomService.endNotifyRoomStatus(room.id);
    }

    res.send(req.body);
  })
};
