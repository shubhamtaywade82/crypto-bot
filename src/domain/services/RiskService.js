//--------------------------------------------------------------------------
// A very small rule-engine:
//
// • One global “max contracts per product” limit
// • One global “max portfolio notional” limit
// • Auto-nuke positions whose UPL < -X%
//--------------------------------------------------------------------------
const MAX_SIZE = {
  // contracts; per symbol
  BTCUSD: 10,
  ETHUSD: 50,
};

const MAX_NOTIONAL = 250_000; // USD

const STOP_OUT_PCT = -0.03; // -3 % unrealised PnL triggers close

class RiskService {
  /* ------------------------------------------------------------------- */
  /** Helper you already had – unchanged */
  static calcTargets(price, side, atr = 0.005) {
    const sl =
      side.toLowerCase() === "buy" ? price * (1 - atr) : price * (1 + atr);

    const tp =
      side.toLowerCase() === "buy"
        ? price * (1 + 2 * atr)
        : price * (1 - 2 * atr);

    return { sl, tp };
  }

  /* ------------------------------------------------------------------- */
  /**
   * Checks whether opening <qty> contracts on <symbol> is allowed.
   * Throws an Error if any rule is broken so the caller can `catch`
   * and return 4xx/5xx.
   */
  static checkOpen(symbol, qty, store, lastPrice) {
    // 1 ) per-product size limit
    const current = store.get(symbol)?.size || 0;
    const limit = MAX_SIZE[symbol] ?? Infinity;
    if (current + qty > limit) {
      throw new Error(
        `risk: size ${current + qty} > limit ${limit} on ${symbol}`
      );
    }

    // 2 ) portfolio notional limit
    const notionalNow = store
      .all()
      .reduce((sum, p) => sum + p.size * (p.lastPrice || lastPrice), 0);

    const newNotional = notionalNow + qty * lastPrice;
    if (newNotional > MAX_NOTIONAL) {
      throw new Error(`risk: notional ${newNotional} > ${MAX_NOTIONAL} USD`);
    }
  }

  /* ------------------------------------------------------------------- */
  /**
   * Scans current positions and returns *array* of positions that must
   * be liquidated immediately (risk-cron will call reduceOnly on them).
   * Here we use a simple UPL% rule; you can add margin, funding, etc.
   *
   * @param   {Array} positions – store.all()
   * @returns {Array}           – subset to close
   */
  static positionsToNuke(positions) {
    return positions.filter(
      (p) => (p.uplPct ?? 0) < STOP_OUT_PCT // unrealised PnL worse than -3 %
    );
  }
}

module.exports = RiskService;
