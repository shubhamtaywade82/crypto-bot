const express = require("express");
const body = require("body-parser");
const env = require("./config/env");
const morgan = require("morgan");
const logger = require("./config/logger");
const expressWinston = require("express-winston");

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

  /* HTTP layer ---------------------------------------------------------- */
  const app = express();
  app.use(
    expressWinston.logger({
      winstonInstance: logger, // reuse your singleton
      meta: true, // log body, query, etc.
      msg: "HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms",
      colorize: false,
      requestWhitelist: ["body", "headers"], // keep these fields
      responseWhitelist: ["body"],
    })
  );
  app.use(body.json());
  app.use(
    morgan(":method :url :status :response-time ms - :res[content-length]", {
      stream: { write: (msg) => logger.http(msg.trim()) },
    })
  );

  app.use("/webhooks", require("./adapters/http/tradingview")(deps));
  app.get("/healthz", (_req, res) => res.json({ ok: true }));

  app.listen(env.port, () => logger.info(`API on :${env.port}`));

  app.use((err, _req, res, _next) => {
    logger.error(err);
    res.status(500).json({ error: err.message });
  });
}

main().catch((err) => {
  logger.error("fatal boot error", err);
  process.exit(1);
});
