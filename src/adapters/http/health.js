module.exports = (feed) => (_, res) => res.json({ wsUp: feed.isConnected() });
