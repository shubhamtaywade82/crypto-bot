const cron = require("node-cron"); // pure JS scheduler :contentReference[oaicite:7]{index=7}
module.exports = (deps) => {
  cron.schedule("*/5 * * * * *", () => {
    // every 5 s demo
    deps.store.all().forEach(async (p) => {
      const ltp = deps.ticker.get(p.product_id); // in-memory cache
      if (!ltp) return;
      const stop = p.side === "BUY" ? ltp <= p.sl : ltp >= p.sl;
      const take = p.side === "BUY" ? ltp >= p.tp : ltp <= p.tp;
      if (stop || take) await deps.closeCmd({ productId: p.product_id });
    });
  });
};
