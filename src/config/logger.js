const { createLogger, format, transports } = require("winston");
const safeStringify = require('fast-safe-stringify'); // ✅ new package

module.exports = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: format.combine(
    format.colorize(),
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
    format.printf(({ timestamp, level, message, ...meta }) => {
      const metaStr = Object.keys(meta).length ? ' ' + safeStringify(meta) : '';
      return `${timestamp} ${level}: ${message}${metaStr}`;
    })
  ),
  transports: [new transports.Console()],
});
