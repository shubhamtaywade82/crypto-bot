module.exports =
  ({ exchange, store }) =>
  async (alert) => {
    const pos = store.get(alert.product);
    if (!pos) throw new Error("no open pos");

    await exchange.reduceOnly({
      product_id: pos.product_id,
      side: pos.side === "buy" ? "sell" : "buy",
      size: pos.size,
      client_order_id: alert.client_order_id,
    });

    store.remove(alert.product);
  };
