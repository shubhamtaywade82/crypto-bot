// src/adapters/exchange/trading.js
const { request } = require('./deltaRest');

async function placeOrder(order) {
  return request('POST', '/orders', {}, order);
}

async function cancelOrder(order_id) {
  return request('DELETE', `/orders/${order_id}`);
}

async function changeLeverage(payload) {
  return request('POST', '/positions/change_leverage', {}, payload);
}

async function getBalances() {
  return request('GET', '/wallet/balances');
}

module.exports = { placeOrder, cancelOrder, changeLeverage, getBalances };