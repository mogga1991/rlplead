import winston from 'winston';

/**
 * Winston Logger Configuration for FedLeads
 * Provides structured logging with different levels for development and production
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

// Custom log format
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;

    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }

    return log;
  })
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} ${level}: ${message}`;

    if (Object.keys(meta).length > 0 && !meta.timestamp) {
      log += ` ${JSON.stringify(meta, null, 2)}`;
    }

    return log;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: isTest ? 'error' : (process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info')),
  format: customFormat,
  defaultMeta: {
    service: 'fedleads',
    environment: process.env.NODE_ENV,
  },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: isDevelopment ? consoleFormat : customFormat,
    }),
  ],
  // Don't exit on error
  exitOnError: false,
});

// Add file transport in production
if (!isDevelopment && !isTest) {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    })
  );

  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    })
  );
}

// Helper methods for common logging patterns
export const log = {
  /**
   * Log an informational message
   */
  info: (message: string, meta?: any) => {
    logger.info(message, meta);
  },

  /**
   * Log a warning
   */
  warn: (message: string, meta?: any) => {
    logger.warn(message, meta);
  },

  /**
   * Log an error
   */
  error: (message: string, error?: Error | any, meta?: any) => {
    if (error instanceof Error) {
      logger.error(message, { error: error.message, stack: error.stack, ...meta });
    } else {
      logger.error(message, { error, ...meta });
    }
  },

  /**
   * Log debug information (development only)
   */
  debug: (message: string, meta?: any) => {
    logger.debug(message, meta);
  },

  /**
   * Log API request
   */
  request: (method: string, path: string, meta?: any) => {
    logger.info(`${method} ${path}`, { type: 'request', ...meta });
  },

  /**
   * Log API response
   */
  response: (method: string, path: string, statusCode: number, duration: number, meta?: any) => {
    logger.info(`${method} ${path} ${statusCode}`, {
      type: 'response',
      statusCode,
      duration,
      ...meta,
    });
  },

  /**
   * Log database query
   */
  query: (query: string, duration: number, meta?: any) => {
    logger.debug('Database query', { type: 'query', query, duration, ...meta });
  },

  /**
   * Log external API call
   */
  externalApi: (service: string, action: string, meta?: any) => {
    logger.info(`External API: ${service} - ${action}`, { type: 'external_api', service, action, ...meta });
  },
};

export default logger;
