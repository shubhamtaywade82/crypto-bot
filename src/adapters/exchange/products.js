const { listProducts } = require("./marketData");

let cache = [];

let readyP = refresh();

async function refresh() {
  const body = await listProducts();
  cache = Array.isArray(body.result) ? body.result : body;
  setTimeout(refresh, 60 * 60 * 1000); // refresh hourly
  return cache;
}

module.exports = {
  bySymbol: (s) => cache.find((p) => p.symbol === s),
  ready: () => readyP,
  all: () => cache,
};
