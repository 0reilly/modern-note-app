"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json());
const developmentFormat = winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.colorize(), winston_1.default.format.simple());
exports.logger = winston_1.default.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: process.env.NODE_ENV === 'production' ? logFormat : developmentFormat,
    defaultMeta: { service: 'modern-note-app-backend' },
    transports: [
        new winston_1.default.transports.Console(),
        new winston_1.default.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: logFormat,
        }),
        new winston_1.default.transports.File({
            filename: 'logs/combined.log',
            format: logFormat,
        }),
    ],
});
