const { createLogger, format, transports } = require("winston");

// simple console logger -- extend later with files, slack, etc.
const logger = createLogger({
  level: process.env.LOG_LEVEL || "debug",
  format: format.combine(
    format.colorize(),
    format.timestamp({ format: "HH:mm:ss" }),
    format.printf(
      ({ level, message, timestamp }) => `[${timestamp}] ${level}: ${message}`
    )
  ),
  transports: [new transports.Console()],
});

module.exports = logger;
