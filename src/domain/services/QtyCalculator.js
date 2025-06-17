const account = require("../../adapters/exchange/account");

// 30% of total balance to be deployed per trade
const MAX_UTILIZATION = 0.3;

async function computeQty(product, side, price) {
  const balances = await account.getBalances();

  const usdBalance = balances?.result?.find((b) => b.asset_symbol === "USD");
  const availableBalance = parseFloat(usdBalance?.available_balance || 0);

  const allocCapital = availableBalance * MAX_UTILIZATION;

  // Get contract value for product (e.g. 0.001 BTC per contract for BTCUSD)
  const contractValue = parseFloat(product.contract_value);

  const maxContracts = Math.floor(allocCapital / (contractValue * price));

  // Lot sizing (respect exchange limits)
  const minQty = product.min_order_size
    ? parseFloat(product.min_order_size)
    : 1;

  const finalQty = Math.floor(maxContracts / minQty) * minQty;

  if (finalQty < minQty) {
    throw new Error("Insufficient balance to open minimum position.");
  }

  return finalQty;
}

module.exports = { computeQty };
