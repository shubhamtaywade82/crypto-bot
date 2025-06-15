/**
 * expected payload (TradingView → Alert → Webhook):
 * {
 *   "action": "OPEN" | "CLOSE",
 *   "product": "BTCUSD",
 *   "side": "buy" | "sell",
 *   "qty": 50,
 *   "client_order_id": "{{order.id}}"
 * }
 */
module.exports =
  ({ openCmd, closeCmd }) =>
  (req, res) => {
    const alert = req.body;
    if (!alert || !alert.action) return res.status(400).end();

    (alert.action === "OPEN" ? openCmd(alert) : closeCmd(alert))
      .then(() => res.json({ success: true }))
      .catch((err) => {
        req.app.logger?.error(err);
        res.status(500).json({ error: err.message });
      });
  };
