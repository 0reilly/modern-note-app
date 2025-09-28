"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateSocket = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = require("../utils/logger");
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({
            success: false,
            message: 'Access token required',
        });
        return;
    }
    try {
        const jwtSecret = process.env['JWT_SECRET'];
        if (!jwtSecret) {
            throw new Error('JWT_SECRET environment variable is not defined');
        }
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        req.user = decoded;
        next();
    }
    catch (error) {
        logger_1.logger.warn('Invalid token provided:', error);
        res.status(403).json({
            success: false,
            message: 'Invalid or expired token',
        });
    }
};
exports.authenticateToken = authenticateToken;
const authenticateSocket = (socket, next) => {
    try {
        const token = socket.handshake.auth['token'] || socket.handshake.headers.authorization?.split(' ')[1];
        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }
        const jwtSecret = process.env['JWT_SECRET'];
        if (!jwtSecret) {
            throw new Error('JWT_SECRET environment variable is not defined');
        }
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        socket.data.userId = decoded.userId;
        next();
    }
    catch (error) {
        logger_1.logger.warn('Socket authentication failed:', error);
        next(new Error('Authentication error: Invalid token'));
    }
};
exports.authenticateSocket = authenticateSocket;
