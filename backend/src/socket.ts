import { Server } from "socket.io";
import http from "http";

let io: Server | null = null;

export function initSocket(server: http.Server) {
  io = new Server(server, {
    cors: { origin: '*' }
  });

  io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    socket.on('join-file', (fileId) => {
      socket.join(`file-${fileId}`);
    });

    socket.on('leave-file', (fileId) => {
      socket.leave(`file-${fileId}`);
    });
  });
}

export function emitAnnotationCreated(annotation: any) {
  if (!io) return;
  io.to(`file-${annotation.fileId}`).emit('annotation:created', annotation);
}
