module.exports =
  ({ exchange, store, products, risk }) =>
  async (alert) => {
    const { product, side, qty, client_order_id } = alert;
    const prod = await products.getBySymbol(product);
    risk.checkOpen(prod.id, qty); // throws if over-risk

    await exchange.marketOrder({
      product_id: prod.id,
      side,
      size: qty,
      client_order_id,
    });

    store.addPosition(prod.id, side, qty); // local cache
  };
