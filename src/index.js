const express = require("express");
const body = require("body-parser");
const env = require("./config/env");
const logger = require("./config/logger");
const expressWinston = require("express-winston");

const exchange = require("./adapters/exchange/delta");
const products = require("./adapters/exchange/products");
const store = require("./adapters/persistence/memoryPositions");
const risk = require("./domain/services/RiskService");
const feed = require("./adapters/ws/DeltaFeed");
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

const deps = { exchange, products, store, risk, openCmd, closeCmd };

// require("./adapters/ws/DeltaFeed")({ ...deps, scheduler: deps });

require("./application/schedulers/riskCron")(deps);
feed.start({ ...deps, scheduler: deps }); // 👈 starts the WS exactly once

// HTTP layer
const app = express();
app.use(body.json());
// ▒▒▒ Request logger (every HTTP call) ▒▒▒
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
app.use("/webhooks", require("./adapters/http/tradingview")(deps));
app.get("/healthz", (_req, res) => res.json({ wsUp: feed.isConnected() }));

app.listen(env.port, () => logger.info(`API on :${env.port}`));
