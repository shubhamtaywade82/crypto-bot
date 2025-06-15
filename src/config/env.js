require("dotenv").config(); // loads .env  :contentReference[oaicite:4]{index=4}
module.exports = {
  port: process.env.PORT || 4000,
  delta: {
    key: process.env.DELTA_API_KEY,
    sec: process.env.DELTA_API_SECRET,
    url: process.env.DELTA_BASE || "https://api.india.delta.exchange",
    socket: process.env.DELTA_SOCKET,
  },
};
