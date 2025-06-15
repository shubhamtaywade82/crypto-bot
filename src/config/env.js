require("dotenv").config(); // load .env at boot

function must(name) {
  const v = process.env[name];
  if (!v) throw new Error(`${name} not set in .env`);
  return v;
}

module.exports = {
  port: process.env.PORT || 4000,

  delta: {
    key: must("DELTA_API_KEY"),
    secret: must("DELTA_API_SECRET"),
    rest: process.env.DELTA_BASE || "https://api.india.delta.exchange",
    socket: process.env.DELTA_SOCKET || "wss://socket.india.delta.exchange",
  },
};
