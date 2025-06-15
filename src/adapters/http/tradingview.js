const router = require("express").Router();
module.exports = (deps) => {
  router.post("/tradingview", async (req, res) => {
    const { symbol, side, qty } = req.body; // JSON auto-typed :contentReference[oaicite:8]{index=8}
    await deps.openCmd({ symbol, side: side === "buy" ? "BUY" : "SELL", qty });
    res.sendStatus(200);
  });
  return router;
};
