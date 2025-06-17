class RiskService {
  static calcTargets(price, side, atr = 0.005) {
    const sl =
      side.toLowerCase() === "buy" ? price * (1 - atr) : price * (1 + atr);
    const tp =
      side.toLowerCase() === "buy"
        ? price * (1 + 2 * atr)
        : price * (1 - 2 * atr);
    return { sl, tp };
  }
}

module.exports = RiskService;
