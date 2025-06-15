const express = require("express");
const body = require("body-parser");
const env = require("./config/env");
const logger = require("./config/logger");

const expressWinston = require("express-winston");

const morgan = require("morgan");

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

async function main() {
  await products.ready(); // ← wait here
  logger.info(`Loaded ${products.all?.().length || "all"} products`);

  const deps = { exchange, products, store, risk, openCmd, closeCmd };

  /* ─── HTTP layer ──────────────────────────────────────────────────── */
  const app = express();

  // 1️⃣  Body-parser first so later middleware can see req.body
  app.use(body.json());

  // 2️⃣  REQUEST/RESPONSE logger (one line per call)
  app.use(
    expressWinston.logger({
      winstonInstance: logger,
      level: "http", // one Winston level
      meta: true,
      msg: "HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms",
      requestWhitelist: ["body", "query", "params", "headers"],
      responseWhitelist: ["body"],
    })
  );

  // 3️⃣  Routes
  app.use("/webhooks", require("./adapters/http/tradingview")(deps));
  app.get("/healthz", (_req, res) => res.json({ ok: true }));

  // 4️⃣  ERROR logger (must come *after* routes)
  app.use(
    expressWinston.errorLogger({
      winstonInstance: logger,
    })
  );

  /* start server ------------------------------------------------------ */
  app.listen(env.port, () => logger.info(`API on :${env.port}`));
}

main().catch((err) => {
  logger.error("fatal boot error", err);
  process.exit(1);
});
