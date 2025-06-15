const { createLogger, format, transports } = require("winston");

const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
    format.errors({ stack: true }), // print stack on error
    format.colorize(),
    format.printf(
      ({ timestamp, level, message, ...meta }) =>
        `${timestamp} ${level}: ${message} ` +
        (Object.keys(meta).length ? JSON.stringify(meta) : "")
    )
  ),
  transports: [new transports.Console()],
});

module.exports = logger;
