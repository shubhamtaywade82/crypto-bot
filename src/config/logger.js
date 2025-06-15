const { createLogger, format, transports } = require("winston");

module.exports = createLogger({
  level : process.env.LOG_LEVEL || 'http',
  format: format.combine(
    format.colorize(),
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
    //format.printf(
     // ({ timestamp, level, message, ...meta }) =>
      //  `${timestamp} ${level}: ${message}` +
     //   (Object.keys(meta).length ? " " + JSON.stringify(meta) : "")
   // )
format.printf(({ timestamp, level, message, ...meta }) => {
  let metaStr = '';
  try {
    metaStr = Object.keys(meta).length ? ' ' + JSON.stringify(meta) : '';
  } catch (e) {
    metaStr = ' (meta: circular)';
  }
  return `${timestamp} ${level}: ${message}${metaStr}`;
})
 // ),
  transports: [new transports.Console()],
});
