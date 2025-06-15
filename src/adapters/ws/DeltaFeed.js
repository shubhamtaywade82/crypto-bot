// src/adapters/ws/DeltaFeed.js
const WebSocket = require("ws");
const crypto = require("crypto");
const { delta } = require("../../config/env");
const logger = require("../../config/logger");

const WS_URL = delta.socket || "wss://socket.india.delta.exchange"; // put test-net in .env if needed

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const sign = (
  ts // HMAC_SHA256(secret, `GET${ts}/live`)
) =>
  crypto.createHmac("sha256", delta.sec).update(`GET${ts}/live`).digest("hex");

let ws = null; // singleton instance
let hbTimer = null; // server heartbeat watchdog
let pingInterval = null; // client ping fallback
let reconnectAttempts = 0;

const isConnected = () => ws && ws.readyState === WebSocket.OPEN;

/* -------------------------------------------------------------------------- */
/* Bootstrap                                                                  */
/* -------------------------------------------------------------------------- */

function start(deps) {
  if (isConnected()) return ws; // already live – guard against double start

  ws = new WebSocket(WS_URL);

  ws.on("open", () => {
    logger.info("[WS] socket opened");
    const ts = (Date.now() * 1_000).toString(); // μ-seconds
    logger.debug(`[WS] sig ${sign(ts)}`); 
    ws.send(
      JSON.stringify({
        type: "auth",
        api_key: delta.key,
        timestamp: ts,
        signature: sign(ts),
      })
    );
  });

  ws.on("message", (raw) => {
    logger.debug(`[WS] ← ${raw}`);
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }

    /* ----- heartbeat (30 s, spec) --------------------------------------- */
    if (msg.type === "heartbeat") {
      clearTimeout(hbTimer);
      hbTimer = setTimeout(() => {
        logger.warn("[WS] heartbeat missed – terminating");
        ws.terminate(); // triggers close → reconnect
      }, 35_000);
      return;
    }

    /* ----- auth success -------------------------------------------------- */
    if (msg.type === "auth" && msg.success) {
      logger.info("[WS] authenticated – subscribing to orders & positions");
      reconnectAttempts = 0; // reset back-off on success

      ws.send(
        JSON.stringify({
          type: "subscribe",
          payload: {
            channels: [
              { name: "orders", symbols: ["all"] },
              { name: "positions", symbols: ["all"] },
            ],
          },
        })
      );

      /* client ping fallback every 25 s */
      pingInterval = setInterval(() => isConnected() && ws.ping(), 25_000);
      return;
    }

    /* ----- subscription ack / other data -------------------------------- */
    deps.scheduler?.handleSocket?.(msg);
  });

  ws.on("close", (code, reason) => {
    logger.warn(`[WS] closed (${code}) ${reason || ""}`);
    cleanup();
    scheduleReconnect(deps);
  });

  ws.on("error", (err) => logger.error(`[WS] error: ${err.message}`));

  return ws;
}

/* -------------------------------------------------------------------------- */
/* Utilities                                                                  */
/* -------------------------------------------------------------------------- */

function cleanup() {
  clearTimeout(hbTimer);
  clearInterval(pingInterval);
  hbTimer = pingInterval = null;
  ws = null;
}

function scheduleReconnect(deps) {
  const delay = Math.min(30_000, 2 ** reconnectAttempts * 1_000); // capped exp back-off
  logger.info(`[WS] reconnecting in ${delay / 1000}s …`);
  setTimeout(() => {
    reconnectAttempts += 1;
    start(deps);
  }, delay);
}

module.exports = { start, isConnected };
