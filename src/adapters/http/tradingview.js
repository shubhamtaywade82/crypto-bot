const Ajv = require("ajv");
const ajv = new Ajv();
const idStore = require("../persistence/idempotencyStore");
const notify = require("../notifications/telegram");

const schema = {
  type: "object",
  required: ["action", "product", "side"],
  properties: {
    action: { enum: ["OPEN", "CLOSE"] },
    product: { type: "string" },
    side: { enum: ["buy", "sell"] },
  },
  additionalProperties: false,
};

const validate = ajv.compile(schema);

module.exports =
  ({ openCmd, closeCmd }) =>
  async (req, res, next) => {
    if (!validate(req.body)) {
      return res
        .status(400)
        .json({ error: "Invalid payload", details: validate.errors });
    }

    try {
      const { action, client_order_id } = req.body;

      if (!idStore.register(client_order_id)) {
        await notify.send(`⚠ Duplicate alert skipped: ${client_order_id}`);
        return res.json({ duplicate: true });
      }

      if (action === "OPEN") await openCmd(req.body);
      if (action === "CLOSE") await closeCmd(req.body);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  };
