import { Server as SocketIOServer } from 'socket.io';

let ioInstance: SocketIOServer | null = null;

export function initSocketIO(io: SocketIOServer) {
  ioInstance = io;

  io.on('connection', (socket) => {
    // Client can join a user-specific room for targeted notifications
    socket.on('join', (room: string) => {
      socket.join(room);
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });
}

export function emitEvent(eventName: string, payload: any, room?: string) {
  if (!ioInstance) return;
  if (room) {
    ioInstance.to(room).emit(eventName, payload);
  } else {
    ioInstance.emit(eventName, payload);
  }
}
