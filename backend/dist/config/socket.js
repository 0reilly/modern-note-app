"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocketIO = void 0;
const auth_1 = require("../middleware/auth");
const logger_1 = require("../utils/logger");
const connectedUsers = new Map();
const setupSocketIO = (io) => {
    io.use(auth_1.authenticateSocket);
    io.on('connection', (socket) => {
        const userId = socket.data.userId;
        logger_1.logger.info(`User ${userId} connected via Socket.IO`);
        connectedUsers.set(socket.id, { userId });
        socket.join(`user:${userId}`);
        socket.on('note:join', (data) => {
            const { noteId } = data;
            const userSocket = connectedUsers.get(socket.id);
            if (userSocket?.noteId) {
                socket.leave(`note:${userSocket.noteId}`);
            }
            socket.join(`note:${noteId}`);
            connectedUsers.set(socket.id, { userId, noteId });
            socket.to(`note:${noteId}`).emit('note:user-joined', {
                userId,
                noteId,
                timestamp: new Date().toISOString(),
            });
            logger_1.logger.info(`User ${userId} joined note ${noteId}`);
        });
        socket.on('note:leave', (data) => {
            const { noteId } = data;
            socket.leave(`note:${noteId}`);
            connectedUsers.set(socket.id, { userId });
            socket.to(`note:${noteId}`).emit('note:user-left', {
                userId,
                noteId,
                timestamp: new Date().toISOString(),
            });
            logger_1.logger.info(`User ${userId} left note ${noteId}`);
        });
        socket.on('note:update', (data) => {
            const { noteId, content } = data;
            socket.to(`note:${noteId}`).emit('note:updated', {
                noteId,
                content,
                userId,
                timestamp: new Date().toISOString(),
            });
            logger_1.logger.debug(`User ${userId} updated note ${noteId}`);
        });
        socket.on('note:cursor', (data) => {
            const { noteId, position } = data;
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
                socket.to(`note:${userSocket.noteId}`).emit('note:user-left', {
                    userId,
                    noteId: userSocket.noteId,
                    timestamp: new Date().toISOString(),
                });
            }
            connectedUsers.delete(socket.id);
            logger_1.logger.info(`User ${userId} disconnected from Socket.IO`);
        });
        socket.on('error', (error) => {
            logger_1.logger.error('Socket.IO error:', error);
        });
    });
    logger_1.logger.info('Socket.IO server configured');
};
exports.setupSocketIO = setupSocketIO;
