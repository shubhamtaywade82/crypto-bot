// src/adapters/exchange/delta.js
// -----------------------------------------------------------------------------
// Unified Delta‑Exchange adapter (v2)
// -----------------------------------------------------------------------------
/* eslint-disable camelcase */
const DeltaRestClient = require('delta-rest-client');
const { delta }       = require('../../config/env');
const logger          = require('../../config/logger');

if (!delta.key || !delta.secret)
  throw new Error('DELTA_API_KEY / DELTA_API_SECRET missing – check your .env');

// -- singleton swagger client -------------------------------------------------
const clientP = new DeltaRestClient(delta.key, delta.secret, delta.rest);
const use     = fn => clientP.then(fn);

// helper → every market‑data call returns parsed JSON
const parse = p => JSON.parse(p.data.toString());

// -----------------------------------------------------------------------------
// Market‑data API --------------------------------------------------------------
// -----------------------------------------------------------------------------
const market = {
  /** full product list */
  listProducts : () => use(c => c.apis.Products.getProducts().then(parse)),

  /** ticker (24 h stats) */
  ticker       : ({ symbol = 'all' } = {}) =>
    use(c => c.apis.MarketData.getV2Ticker({ symbol }).then(parse)),

  l1OrderBook  : ({ symbol }) =>
    use(c => c.apis.MarketData.getL1Orderbook({ symbol }).then(parse)),

  l2OrderBook  : ({ symbol }) =>
    use(c => c.apis.MarketData.getL2Orderbook({ symbol }).then(parse)),

  candles      : ({ symbol, resolution = '1m', limit = 500, start_time, end_time }) =>
    use(c => c.apis.MarketData.getCandlesticks({ symbol, resolution, limit, start_time, end_time }).then(parse)),

  trades       : ({ symbol, limit = 50 } = {}) =>
    use(c => c.apis.MarketData.getAllTrades({ symbol, limit }).then(parse))
};

// -----------------------------------------------------------------------------
// Trading API -----------------------------------------------------------------
// -----------------------------------------------------------------------------
function _place(order) {
  return use(c => c.apis.Orders.placeOrder({ order }).then(parse));
}

const trading = {
  marketOrder : ({ product_id, side, size, client_order_id }) =>
    _place({ product_id, side, size, order_type: 'market_order', client_order_id }),

  order       : _place,

  reduceOnly  : ({ product_id, side, size, client_order_id }) =>
    _place({ product_id, side, size, reduce_only: true, order_type: 'market_order', client_order_id }),

  cancelOrder : ({ order_id }) => use(c => c.apis.Orders.cancelOrder({ order_id }).then(parse)),

  cancelAll   : ({ product_id }) => use(c => c.apis.Orders.cancelOrders({ product_id }).then(parse)),

  positions   : ({ symbol = 'all' } = {}) => use(c => c.apis.Positions.getPositions({ symbol }).then(parse)),

  margins     : () => use(c => c.apis.Margins.getMargins().then(parse)),

  wallets     : () => use(c => c.apis.Wallets.getWallets().then(parse))
};

// -----------------------------------------------------------------------------
module.exports = {
  ...market,
  ...trading,
  _sdk : clientP
};
