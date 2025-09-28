import { Server as SocketIOServer } from 'socket.io';
import { authenticateSocket } from '../middleware/auth';
import { logger } from '../utils/logger';

interface UserSocket {
  userId: string;
  noteId?: string;
}

const connectedUsers = new Map<string, UserSocket>();

export const setupSocketIO = (io: SocketIOServer): void => {
  // Authentication middleware for Socket.IO
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    
    logger.info(`User ${userId} connected via Socket.IO`);
    
    // Store user connection
    connectedUsers.set(socket.id, { userId });

    // Join user to their personal room
    socket.join(`user:${userId}`);

    // Note collaboration events
    socket.on('note:join', (data: { noteId: string }) => {
      const { noteId } = data;
      
      // Leave previous note room if any
      const userSocket = connectedUsers.get(socket.id);
      if (userSocket?.noteId) {
        socket.leave(`note:${userSocket.noteId}`);
      }

      // Join new note room
      socket.join(`note:${noteId}`);
      connectedUsers.set(socket.id, { userId, noteId });
      
      // Notify others in the note room
      socket.to(`note:${noteId}`).emit('note:user-joined', {
        userId,
        noteId,
        timestamp: new Date().toISOString(),
      });

      logger.info(`User ${userId} joined note ${noteId}`);
    });

    socket.on('note:leave', (data: { noteId: string }) => {
      const { noteId } = data;
      
      socket.leave(`note:${noteId}`);
      connectedUsers.set(socket.id, { userId });
      
      // Notify others in the note room
      socket.to(`note:${noteId}`).emit('note:user-left', {
        userId,
        noteId,
        timestamp: new Date().toISOString(),
      });

      logger.info(`User ${userId} left note ${noteId}`);
    });

    socket.on('note:update', (data: { noteId: string; content: string }) => {
      const { noteId, content } = data;
      
      // Broadcast update to all other users in the note room
      socket.to(`note:${noteId}`).emit('note:updated', {
        noteId,
        content,
        userId,
        timestamp: new Date().toISOString(),
      });

      logger.debug(`User ${userId} updated note ${noteId}`);
    });

    socket.on('note:cursor', (data: { noteId: string; position: number }) => {
      const { noteId, position } = data;
      
      // Broadcast cursor position to all other users in the note room
      socket.to(`note:${noteId}`).emit('note:cursor-updated', {
        noteId,
        position,
        userId,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('disconnect', () => {
      const userSocket = connectedUsers.get(socket.id);
      
      if (userSocket?.noteId) {
        // Notify others that user left the note
        socket.to(`note:${userSocket.noteId}`).emit('note:user-left', {
          userId,
          noteId: userSocket.noteId,
          timestamp: new Date().toISOString(),
        });
      }

      connectedUsers.delete(socket.id);
      logger.info(`User ${userId} disconnected from Socket.IO`);
    });

    socket.on('error', (error) => {
      logger.error('Socket.IO error:', error);
    });
  });

  logger.info('Socket.IO server configured');
};