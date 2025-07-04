const map = new Map();

module.exports = {
  upsert: (id, data) => map.set(id, { ...map.get(id), ...data }),
  get: (id) => map.get(id),
  del: (id) => map.delete(id),
  all: () => Array.from(map.values()),
};
