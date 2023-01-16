import { Server } from 'socket.io';
import Container from 'typedi';
import RoomService from '../services/room';

type JoinSocketReq = {
  id: string;
  username: string;
};

export default async (io: Server) => {
  const roomService = Container.get(RoomService);
  roomService.io = io;
  io.on('connection', (socket) => {
    socket.on('join', async ({ id, username }: JoinSocketReq) => {
      socket.join(`${id}`);

      socket.emit('id', socket.id);

      const roomService = Container.get(RoomService);
      await roomService.addMember(id, socket.id, username);
      socket.emit('members', {
        members: roomService.getMembers(id),
      });

      socket.broadcast
        .to(`${id}`)
        .emit('join', { members: roomService.getMembers(id) });

      // socket.on('msg', (data) => {
      //   socket.broadcast.to(id).emit('msg', data);
      // });

      socket.on('perform', (data) => {
        socket.broadcast.to(`${id}`).emit('perform', {
          performer: username,
        });
        roomService.setPerformer(`${id}`, username);
      });

      socket.on('disconnect', async (reason) => {
        const member = await roomService.removeMember(id, socket.id);
        if (member) {
          io.to(`${id}`).emit('leave', {
            members: roomService.getMembers(id),
          });
        }
      });
    });
  });

  io.of('/studio').on('connection', (socket) => {
    socket.on('reqJoinDeviceCh', (data) => {
      const email = data.email;
      socket.join(email);

      socket.broadcast.to(email).emit('recJoinDeviceCh', data);

      socket.on('reqConnect', (data) => {
        socket.broadcast.to(email).emit('recConnect', data);
      });

      socket.on('reqDisconnect', (data) => {
        socket.broadcast.to(email).emit('recDisconnect', data);
      });

      socket.on('reqStream', (data) => {
        socket.broadcast.to(email).emit('recStream', data);
      });

      socket.on('reqStreamEnded', (data) => {
        socket.broadcast.to(email).emit('recStreamEnded', data);
      });

      socket.on('reqHealthCheck', (data) => {
        socket.broadcast.to(email).emit('recHealthCheck', data);
      });

      socket.on('disconnect', (data) => {
        socket.broadcast.to(email).emit('recLeaveDeviceCh', data);
      });
    });
  });
};
