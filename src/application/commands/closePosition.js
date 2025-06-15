module.exports =
  (deps) =>
  async ({ productId }) => {
    const pos = deps.store.get(productId);
    if (!pos) return;
    await deps.exchange.reduceOnly({
      productId,
      side: pos.side === "BUY" ? "SELL" : "BUY",
      size: pos.qty,
    });
    deps.store.del(productId);
  };
