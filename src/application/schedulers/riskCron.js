// src/application/schedulers/riskCron.js
/* eslint-disable no-await-in-loop */
const cron = require("node-cron");
const logger = require("../../config/logger");

/**
 * Runs every 5 s:
 *  • pulls the latest mark-price for each *distinct* symbol we hold
 *  • checks SL / TP stored on the position object
 *  • calls closeCmd() when either level is crossed
 */
module.exports = ({ exchange, store, closeCmd }) => {
  cron.schedule("*/5 * * * * *", async () => {
    const positions = store.all();
    if (positions.length === 0) return;

    // ---- 1. grab one ticker per symbol ---------------------------------
    const symbols = [...new Set(positions.map((p) => p.symbol))];
    const priceMap = {};

    for (const sym of symbols) {
      try {
        const tkr = await exchange.ticker({ symbol: sym }); // parsed JSON
        // mark_price for futures / close for spot; pick what exists
        priceMap[sym] = parseFloat(
          tkr.mark_price ?? tkr.close ?? tkr.price ?? tkr.p
        );
      } catch (err) {
        logger.warn(`ticker failed for ${sym}: ${err.message}`);
      }
    }

    // ---- 2. evaluate each position -------------------------------------
    for (const pos of positions) {
      const ltp = priceMap[pos.symbol];
      if (!ltp) continue; // no price, skip this round

      const isLong = pos.side.toLowerCase() === "buy";
      const hitSL = isLong ? ltp <= pos.sl : ltp >= pos.sl;
      const hitTP = isLong ? ltp >= pos.tp : ltp <= pos.tp;

      if (!hitSL && !hitTP) continue;

      try {
        logger.info(
          `RiskCron: ${hitSL ? "SL" : "TP"} triggered on ${pos.symbol} @ ${ltp}`
        );

        await closeCmd({
          product: pos.symbol,
          client_order_id: `risk-${Date.now()}`,
        });

        store.del(pos.product_id);
      } catch (err) {
        logger.error(`RiskCron close failed: ${err.message}`);
      }
    }
  });
};
