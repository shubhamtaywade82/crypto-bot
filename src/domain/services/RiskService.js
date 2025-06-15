class RiskService {
  static calcTargets(price, side, atr = 0.005) {
    // 0.5 % default
    const sl = side === "BUY" ? price * (1 - atr) : price * (1 + atr);
    const tp = side === "BUY" ? price * (1 + 2 * atr) : price * (1 - 2 * atr);
    return { sl, tp };
  }
}
module.exports = RiskService;
