require("dotenv").config(); // load .env at boot

function must(name) {
  const v = process.env[name];
  if (!v) throw new Error(`${name} not set in .env`);
  return v;
}

module.exports = {
  delta: {
    key: process.env.DELTA_API_KEY,
    secret: process.env.DELTA_API_SECRET,
    restUrl: process.env.DELTA_BASE_URL || 'https://api.india.delta.exchange'
  }
};