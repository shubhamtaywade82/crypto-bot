const { publicRequest } = require("./publicRest");

async function listProducts() {
  return publicRequest("GET", "/v2/products");
}

async function getTicker(symbol) {
  return publicRequest("GET", `/v2/tickers/${symbol}`);
}

module.exports = { listProducts, getTicker };
