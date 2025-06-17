const axios = require('axios');
const { telegram } = require('../../config/env');

const send = async (message) => {
  if (!telegram.botToken || !telegram.chatId) return;

  const url = `https://api.telegram.org/bot${telegram.botToken}/sendMessage`;
  await axios.post(url, {
    chat_id: telegram.chatId,
    text: message,
    parse_mode: 'Markdown'
  });
};

module.exports = { send };
