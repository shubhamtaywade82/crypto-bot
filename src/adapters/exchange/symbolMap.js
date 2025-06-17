// Adapts TradingView symbols to India DeltaExchange symbols
const SYMBOL_MAP = {
  'BTCUSD.P': 'BTCUSD',
  'BTCUSDT.P': 'BTCUSDT',
  'ETHUSD.P': 'ETHUSD',
  // add more mappings here
};

function normalizeSymbol(symbol) {
  return SYMBOL_MAP[symbol] || symbol;
}

module.exports = { normalizeSymbol };
