const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const logger = require("./config/logger");
const env = require("./config/env");

// domain imports
const exchange = require("./adapters/exchange/delta");
const products = require("./adapters/exchange/products");
const store = require("./adapters/persistence/memoryPositions");
const risk = require("./domain/services/RiskService");

// const DeltaWsClient = require('./adapters/exchange/wsClient');
// const wsClient = new DeltaWsClient();
// wsClient.start();

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
  // preload product list
  const list = await products.ready();
  logger.info(`Loaded ${list.length} products`);

  const deps = { openCmd, closeCmd };

  const app = express();
  app.use(bodyParser.json());

  morgan.token("body", (req) =>
    req.method === "POST" ? JSON.stringify(req.body).slice(0, 200) : ""
  );
  app.use(
    morgan(":method :url :status :response-time ms :body", {
      immediate: true,
      stream: { write: (msg) => logger.http(msg.trim()) },
    })
  );

  // routes
  app.use("/webhooks", require("./adapters/http/tradingview")(deps));
  app.get("/healthz", (_, res) => res.json({ ok: true }));

  app.listen(env.port, () => logger.info(`API running on port ${env.port}`));
})();
