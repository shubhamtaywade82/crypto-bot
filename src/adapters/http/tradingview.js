const Ajv = require("ajv"); // npm i ajv
const ajv = new Ajv();

const schema = {
  type: "object",
  required: ["action", "product", "side", "qty"],
  properties: {
    action: { enum: ["OPEN", "CLOSE"] },
    product: { type: "string" },
    side: { enum: ["buy", "sell"] },
    qty: { type: "number", minimum: 1 },
    client_order_id: { type: "string", nullable: true },
  },
  additionalProperties: false,
};
const validate = ajv.compile(schema);

module.exports =
  ({ openCmd, closeCmd }) =>
  async (req, res, next) => {
    const alert = req.body;
    if (!validate(alert)) {
      return res
        .status(400)
        .json({ error: "invalid payload", details: validate.errors });
    }

    try {
      alert.action === "OPEN" ? await openCmd(alert) : await closeCmd(alert);
      res.json({ success: true });
    } catch (err) {
      next(err); // central error handler logs + 500
    }
  };
