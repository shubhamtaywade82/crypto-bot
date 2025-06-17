module.exports = class PositionSizer {
  constructor(balance, riskPct = 2, leverage = 5) {
    this.balance = balance;
    this.riskPct = riskPct / 100;
    this.leverage = leverage;
  }

  calculate(product, side) {
    const price = parseFloat(product.mark_price);
    const contractValue = parseFloat(product.contract_value);
    const tickSize = parseFloat(product.tick_size);
    const maxQty = (this.balance * this.leverage) / price;

    // Apply risk rule:
    const riskCapital = this.balance * this.riskPct;
    const qty = Math.min((riskCapital * this.leverage) / price, maxQty);

    // Round to contract lot sizes
    const rounded = Math.floor(qty / contractValue) * contractValue;

    return rounded;
  }
};
