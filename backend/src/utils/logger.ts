import winston from 'winston';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const developmentFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.colorize(),
  winston.format.simple()
);

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: process.env.NODE_ENV === 'production' ? logFormat : developmentFormat,
  defaultMeta: { service: 'modern-note-app-backend' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      format: logFormat,
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      format: logFormat,
    }),
  ],
});

// Create a stream object for Morgan
logger.stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};