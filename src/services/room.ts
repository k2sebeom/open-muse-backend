import Mux from '@mux/mux-node';
import { Service } from 'typedi';
import config from '../config';
import db from '../utils/db';
import Agora from 'agora-access-token';
import { Server } from 'socket.io';

@Service()
export default class RoomService {
  public rooms: { [roomId: number]: { [sid: number]: string } };
  public performers: { [roomId: number]: string | null } = {};

  public io: Server = null;

  public workers: { [roomId: number]: NodeJS.Timer } = {};
  public muxClient: Mux;

  constructor() {
    this.rooms = {};
    this.muxClient = new Mux(config.muxTokenId, config.muxTokenSecret);
  }

  public async createRoom(
    title: string,
    description: string,
    mode: 'OPEN' | 'SHOW',
    password?: string
  ) {
    const stream = await this.muxClient.Video.LiveStreams.create({
      playback_policy: 'public',
      new_asset_settings: {
        playback_policy: 'public',
        mp4_support: "standard"
      },
      latency_mode: 'standard',
      reconnect_window: 0,
      audio_only: true,
    });

    const room = await db.room.create({
      data: {
        title,
        description,
        mode,
        password,
        streamKey: stream.stream_key,
        liveUrl: `https://stream.mux.com/${stream.playback_ids[0].id}.m3u8`,
        liveStreamId: stream.id
      },
    });

    return room;
  }

  public async addMember(roomId: string, sid: string, username: string) {
    if (this.rooms[roomId]) {
      this.rooms[roomId][sid] = username;
    } else {
      this.rooms[roomId] = { [sid]: username };
    }
    try {
      await db.room.update({
        where: {
          id: parseInt(roomId),
        },
        data: {
          members: this.getMembers(roomId).length,
        },
      });
    }
    catch {
      console.error("Room does not exist");
    }
  }

  public async setPerformer(roomId: string, performer: string | null) {
    this.performers[roomId] = performer;
  }

  public startNotifyRoomStatus(roomId: number) {
    if (!this.workers[roomId]) {
      this.workers[roomId] = setInterval(() => {
        this.io.to(`${roomId}`).emit('status', {
          status: 'READY',
          performer: this.performers[`${roomId}`],
        });
      }, 1000);
    }
  }

  public updateRoomStatus(roomId: number, url: string) {
    if (this.workers[roomId]) {
      clearInterval(this.workers[roomId]);
    }

    this.workers[roomId] = setInterval(() => {
      this.io.to(`${roomId}`).emit('status', {
        status: 'PERFORMING',
        performer: this.performers[`${roomId}`],
        playUrl: url
      });
    }, 1000);
  }

  public endNotifyRoomStatus(roomId: number) {
    if (this.workers[roomId]) {
      clearInterval(this.workers[roomId]);
      delete this.workers[roomId];
    }
    this.performers[`${roomId}`] = null;
    this.io.to(`${roomId}`).emit('status', {
      status: 'CHATTING',
    });
  }

  public async removeMember(roomId: string, sid: string): Promise<string> {
    if (this.rooms[roomId]) {
      const username = this.rooms[roomId][sid];
      delete this.rooms[roomId][sid];
      await db.room.update({
        where: {
          id: parseInt(roomId),
        },
        data: {
          members: this.getMembers(roomId).length,
        },
      });
      return username;
    }
  }

  public getMembers(roomId: string): string[] {
    return Object.values(this.rooms[roomId]);
  }

  public getRtcToken = (channelName: string, account: string): string => {
    const expirationTimeInSeconds = 3600;

    const currentTimestamp = Math.floor(Date.now() / 1000);

    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
    const tokenB = Agora.RtcTokenBuilder.buildTokenWithAccount(
      config.agoraId,
      config.agoraCert,
      channelName,
      account,
      Agora.RtcRole.PUBLISHER,
      privilegeExpiredTs
    );
    return tokenB;
  };
}
