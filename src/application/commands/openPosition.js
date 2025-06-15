module.exports =
  (deps) =>
  async ({ symbol, side, qty }) => {
    const { exchange, products, store, risk } = deps;
    const product = products.bySymbol(symbol);
    const mkt = await exchange.marketOrder({
      productId: product.id,
      side,
      size: qty,
    });
    const price = Number(mkt.body.price);
    const { sl, tp } = risk.calcTargets(price, side);
    store.upsert(product.id, { side, qty, sl, tp });
  };
