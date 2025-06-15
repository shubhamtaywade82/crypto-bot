// src/adapters/exchange/marketData.js
const { request } = require('./deltaRest');

async function listProducts() {
  return request('GET', '/products');
}

async function getTicker(symbol) {
  return request('GET', `/tickers/${symbol}`);
}

module.exports = { listProducts, getTicker };