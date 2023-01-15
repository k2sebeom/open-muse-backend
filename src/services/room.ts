import Mux from '@mux/mux-node';
import { Service } from 'typedi';
import config from '../config';
import db from '../utils/db';
import Agora from 'agora-access-token';


@Service()
export default class RoomService {
    public rooms: {[roomId: number]: {[sid: number]: string}}
    public muxClient: Mux;

    constructor() {
        this.rooms = {};
        this.muxClient = new Mux(config.muxTokenId, config.muxTokenSecret);
    }

    public async createRoom(title: string, description: string, mode: 'OPEN' | 'SHOW', password?: string) {
        const stream = await this.muxClient.Video.LiveStreams.create({
            playback_policy: 'public',
            new_asset_settings: {
                playback_policy: 'public'
            },
            latency_mode: 'low',
            audio_only: true
        });

        const room = await db.room.create({
            data: {
                title, description, mode, password,
                streamKey: stream.stream_key,
                liveUrl: `https://stream.mux.com/${stream.playback_ids[0].id}.m3u8`
            }
        });

        return room;
    }

    public getRtcToken = (channelName: string, account: string): string => {
        const expirationTimeInSeconds = 3600
        
        const currentTimestamp = Math.floor(Date.now() / 1000)
            
        const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds

        const tokenB = Agora.RtcTokenBuilder.buildTokenWithAccount(config.agoraId, config.agoraCert, channelName, account, Agora.RtcRole.PUBLISHER, privilegeExpiredTs);
        return tokenB;
    }
}