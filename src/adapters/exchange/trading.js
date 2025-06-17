const { request } = require("./deltaRest");

async function placeOrder(order) {
  return request("POST", "/v2/orders", {}, order);
}

async function cancelOrder(order_id) {
  return request("DELETE", `/v2/orders/${order_id}`);
}

async function changeLeverage(payload) {
  return request("POST", "/v2/positions/change_leverage", {}, payload);
}

async function getBalances() {
  return request("GET", "/v2/wallet/balances");
}

module.exports = { placeOrder, cancelOrder, changeLeverage, getBalances };
