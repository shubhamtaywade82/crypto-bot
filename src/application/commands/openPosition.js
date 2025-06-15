module.exports =
  ({ exchange, products, store, risk }) =>
  async ({ product, side, qty, client_order_id }) => {
    const prod = products.bySymbol(product);
    if (!prod) throw new Error(`unknown product ${product}`);

    risk.checkOpen(product, qty, store, prod.mark_price);

    await exchange.marketOrder({
      product_id: prod.id,
      side,
      size: qty,
      client_order_id,
    });

    store.upsert(prod.id, { product_id: prod.id, side, size: qty });
  };
