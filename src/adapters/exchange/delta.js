const market = require("./marketData"); // public
const trade = require("./trading"); // private

module.exports = {
  ...market,
  ...trade,
};
