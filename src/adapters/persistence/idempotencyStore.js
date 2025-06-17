const idMap = new Map();

module.exports = {
  register: (key) => {
    if (idMap.has(key)) return false;
    idMap.set(key, Date.now());
    return true;
  },
  purge: () => {
    const now = Date.now();
    for (const [k, v] of idMap.entries()) {
      if (now - v > 1000 * 60 * 60) { // purge after 1 hour
        idMap.delete(k);
      }
    }
  }
};
