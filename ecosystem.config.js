module.exports = {
  apps: [
    {
      name: "crypto-bot",
      script: "src/index.js",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      env: { NODE_ENV: "production" },
    },
  ],
};
