const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const expressWinston = require("express-winston");
const logger = require("./config/logger");
const env = require("./config/env");

/* domain … ----------------------------------------------------------------- */
const exchange = require("./adapters/exchange/delta");
const products = require("./adapters/exchange/products");
const store = require("./adapters/persistence/memoryPositions");
const risk = require("./domain/services/RiskService");

const openCmd = require("./application/commands/openPosition")({
  exchange,
  products,
  store,
  risk,
});
const closeCmd = require("./application/commands/closePosition")({
  exchange,
  store,
});

(async () => {
  /* preload product cache */
  const list = await products.ready();
  logger.info(`Loaded ${list.length} products`);

  const deps = { exchange, products, store, risk, openCmd, closeCmd };

  /* ─── HTTP layer ────────────────────────────────────────────────────── */
  const app = express();
  app.use(bodyParser.json());

  /* 1️⃣ very slim access log ------------------------------------------- */
  morgan.token("body", (req) =>
    req.method === "POST"
      ? JSON.stringify(req.body).slice(0, 200) // truncate long alerts
      : ""
  );
  app.use(
    morgan(":method :url :status :response-time ms :body", {
      immediate: true,
      stream: { write: (msg) => logger.http(msg.trim()) },
    })
  );

  /* 2️⃣ routes ---------------------------------------------------------- */
  app.use("/webhooks", require("./adapters/http/tradingview")(deps));
  app.get("/healthz", (_req, res) => res.json({ ok: true }));

  /* 3️⃣ domain → http error mapper ------------------------------------- */
  app.use((err, _req, res, next) => {
    /* Swagger errors have err.response; plain throw() have only message */
    const code = err.response?.body?.error?.code || "internal_error";
    const ctx = err.response?.body?.error?.context || null;
    const status = err.response?.statusCode === 400 ? 400 : 500;

    res.status(status).json({ code, msg: err.message, ctx, status });
    next(Object.assign(new Error(code), { ctx, status })); // → winston
  });

  app.use((err, _req, _res, _next) => {
    logger.error(err.message, { status: err.status, ctx: err.ctx });
  });

  app.listen(env.port, () => logger.info(`API on :${env.port}`));
})().catch((e) => {
  logger.error("fatal boot error", e);
  process.exit(1);
});
