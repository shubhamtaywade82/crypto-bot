const DeltaRestClient = require("delta-rest-client");
const { delta } = require("../../config/env");

// one global, promise-based client
const clientP = new DeltaRestClient(delta.key, delta.secret, delta.rest);

const withClient = (fn) => clientP.then(fn); // tiny helper

module.exports = {
  listProducts: () => withClient((c) => c.apis.Products.getProducts()),

  marketOrder: (p) =>
    withClient((c) =>
      c.apis.Orders.placeOrder({
        order_type: "market_order",
        ...p,
      })
    ),

  reduceOnly: (p) =>
    withClient((c) =>
      c.apis.Orders.placeOrder({
        reduce_only: true,
        ...p,
      })
    ),

  cancelAll: (product_id) =>
    withClient((c) => c.apis.Orders.cancelOrders({ product_id })),
};
