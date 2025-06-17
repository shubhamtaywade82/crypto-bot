const { request } = require("./deltaRest");

// 🏦 Get wallet balances
async function getBalances() {
  return request("GET", "/v2/wallet/balances");
}

// 📊 Get open positions
async function getPositions() {
  return request("GET", "/v2/positions");
}

// ⚙️ Change leverage
async function changeLeverage(product_id, leverage) {
  return request(
    "POST",
    "/v2/positions/change_leverage",
    {},
    {
      product_id,
      leverage,
    }
  );
}

module.exports = {
  getBalances,
  getPositions,
  changeLeverage,
};
