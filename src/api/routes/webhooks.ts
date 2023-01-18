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
        liveStreamId: body.data.live_stream_id
      },
    });

    if (body.type === 'video.asset.created') {
      roomService.startNotifyRoomStatus(room.id);
    } else if (body.type === 'video.asset.ready') {
      roomService.updateRoomStatus(room.id, 'https://stream.mux.com/' + body.data.playback_ids[0].id + '.m3u8');
    } else if (body.type === 'video.asset.live_stream_completed') {
      roomService.endNotifyRoomStatus(room.id);
    }

    res.send(req.body);
  });
};
