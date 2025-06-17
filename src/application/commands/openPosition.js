const { normalizeSymbol } = require("../../adapters/exchange/symbolMap");
const PositionSizer = require("../../domain/services/PositionSizer");

module.exports =
  ({ exchange, products, store, risk }) =>
  async ({ product, side }) => {
    const symbol = normalizeSymbol(product);
    const prod = products.bySymbol(symbol);
    if (!prod) throw new Error(`unknown product ${symbol}`);

    const balances = await exchange.getBalances();
    const usdBalance = parseFloat(balances.available_balance); // adapt key if different

    const sizer = new PositionSizer(usdBalance, 2, 5); // risk=2%, leverage=5x
    const qty = sizer.calculate(prod, side);

    if (qty <= 0) throw new Error(`calculated position too small`);

    const price = parseFloat(prod.mark_price || prod.close_price);
    const targets = risk.calcTargets(price, side);

    await exchange.placeOrder({
      product_id: prod.id,
      size: qty,
      side,
      order_type: "market",
      reduce_only: false,
      post_only: false,
    });

    store.upsert(prod.id, {
      product_id: prod.id,
      symbol: prod.symbol,
      side,
      size: qty,
      sl: targets.sl,
      tp: targets.tp,
    });
  };
