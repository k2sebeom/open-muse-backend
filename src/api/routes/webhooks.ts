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

    const room = await db.room.findFirst({
      where: {
        liveStreamId: body.data.id
      },
    });

    if (body.type === 'video.live_stream.connected') {
      roomService.startNotifyRoomStatus(room.id);
    } else if (body.type === 'video.live_stream.active') {
      roomService.updateRoomStatus(room.id, room.playbackId);
    } else if (body.type === 'video.live_stream.disconnected') {
      roomService.endNotifyRoomStatus(room.id);
    }

    res.send(req.body);
  });
};
