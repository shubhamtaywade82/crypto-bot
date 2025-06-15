const { listProducts } = require("./delta");
let cache = [];

async function refresh() {
  const res = await listProducts();
  cache = JSON.parse(res.data.toString());
  setTimeout(refresh, 60 * 60 * 1000);
}
refresh();

module.exports = {
  bySymbol: (s) => cache.find((p) => p.symbol === s),
};
