const cron = require("node-cron");
const idStore = require("../../adapters/persistence/idempotencyStore");
const logger = require("../../config/logger");

module.exports = () => {
  cron.schedule("*/15 * * * *", () => {
    idStore.purge();
    logger.info("Idempotency keys purged");
  });
};
