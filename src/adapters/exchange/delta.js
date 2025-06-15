const DeltaRestClient = require("delta-rest-client");
const { delta } = require("../../config/env");

// ❶ create a single promise that resolves to the real SDK instance
const clientP = new DeltaRestClient(delta.key, delta.sec, delta.url);

// ❷ tiny helper so every call gets a ready client
const withClient = async (fn) => fn(await clientP);

module.exports = {
  listProducts: () => withClient((c) => c.apis.Products.getProducts()),
  marketOrder: (p) =>
    withClient((c) =>
      c.apis.Orders.placeOrder({ ...p, order_type: "market_order" })
    ),
  reduceOnly: (p) =>
    withClient((c) => c.apis.Orders.placeOrder({ ...p, reduce_only: true })),
};
