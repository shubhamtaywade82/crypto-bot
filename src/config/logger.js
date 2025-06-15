const { createLogger, format, transports } = require("winston");

module.exports = createLogger({
  level : process.env.LOG_LEVEL || 'http',
  format: format.combine(
    format.colorize(),
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
    format.printf(
      ({ timestamp, level, message, ...meta }) =>
        `${timestamp} ${level}: ${message}` +
        (Object.keys(meta).length ? " " + JSON.stringify(meta) : "")
    )
  ),
  transports: [new transports.Console()],
});
