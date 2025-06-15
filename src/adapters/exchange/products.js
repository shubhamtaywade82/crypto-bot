const { listProducts } = require("./delta"); // helper exists again
let cache = [];

let readyP = refresh();

async function refresh() {
  const body = await listProducts();
  cache = Array.isArray(body.result) ? body.result : body;
  setTimeout(refresh, 60 * 60 * 1000);
  return cache;
}

module.exports = {
  bySymbol: (s) => cache.find((p) => p.symbol === s),
  getBySymbol: (s) => cache.find((p) => p.symbol === s), // ← alias for legacy code
  ready: () => readyP,
};
