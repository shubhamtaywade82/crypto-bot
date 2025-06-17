const market = require("./marketData");
const trade = require("./trading");

module.exports = {
  ...market,
  ...trade,
};
