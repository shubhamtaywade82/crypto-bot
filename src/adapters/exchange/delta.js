// src/adapters/exchange/delta.js
const market = require('./marketData');
const trade = require('./trading');

module.exports = {
  ...market,
  ...trade
};