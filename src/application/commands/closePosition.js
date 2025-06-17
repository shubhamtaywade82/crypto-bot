module.exports =
  ({ exchange, store }) =>
  async ({ product }) => {
    const pos = store.all().find((p) => p.symbol === product);
    if (!pos) throw new Error("no open position");

    const payload = {
      product_id: pos.product_id,
      size: pos.size,
      side: pos.side === "buy" ? "sell" : "buy",
      order_type: "market",
      reduce_only: true,
    };

    const result = await exchange.placeOrder(payload);
    store.del(pos.product_id);
    return result;
  };
