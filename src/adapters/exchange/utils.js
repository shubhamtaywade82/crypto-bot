const crypto = require("crypto");

function generateSignature(secret, timestamp, method, path, query, body) {
  const payload = `${timestamp}${method}${path}${query}${body}`;
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

function serializeQuery(params = {}) {
  const keys = Object.keys(params).sort();
  return keys.map((k) => `${k}=${encodeURIComponent(params[k])}`).join("&");
}

module.exports = { generateSignature, serializeQuery };
