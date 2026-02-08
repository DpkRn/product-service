const { createLogger, format, transports } = require('winston');

const customFormat = format.printf(({ timestamp, level, message, code, msg, status, ...meta }) => {
  const logObject = {
    timestamp,
    level,
    message,
    code: code || null,
    msg: msg || message,
    status: status || null,
    app: 'product-service',
    ...meta
  };
  return JSON.stringify(logObject);
});

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    customFormat
  ),
  defaultMeta: { app: 'product-service' },
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' })
  ]
});

// Enhanced logger methods with code, msg, and status
logger.logRequest = (code, msg, status, additionalData = {}) => {
  logger.info(msg, { code, status, ...additionalData });
};

logger.logError = (code, msg, status, error) => {
  logger.error(msg, { code, status, error: error.message, stack: error.stack });
};

logger.logSuccess = (code, msg, status, data = {}) => {
  logger.info(msg, { code, status, ...data });
};

module.exports = logger;
