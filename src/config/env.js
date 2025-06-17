require("dotenv").config();

function must(name) {
  const v = process.env[name];
  if (!v) throw new Error(`${name} not set in .env`);
  return v;
}

module.exports = {
  port: process.env.PORT || 3000,
  delta: {
    key: must("DELTA_API_KEY"),
    secret: must("DELTA_API_SECRET"),
    restUrl: process.env.DELTA_BASE_URL || "https://api.india.delta.exchange",
  },
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID,
  },
};
