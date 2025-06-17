const WebSocket = require('ws');
const logger = require('../../config/logger');
const { delta } = require('../../config/env');
const crypto = require('crypto');

class DeltaWsClient {
  constructor() {
    this.url = delta.wsUrl || 'wss://api-ws.india.delta.exchange/v2/ws/private';
    this.apiKey = delta.key;
    this.apiSecret = delta.secret;
    this.ws = null;
    this.isAlive = false;
    this.reconnectDelay = 5000;
  }

  start() {
    this.ws = new WebSocket(this.url);
    logger.info('Connecting to Delta WS...');

    this.ws.on('open', () => this.authenticate());
    this.ws.on('message', (data) => this.onMessage(data));
    this.ws.on('close', () => this.reconnect());
    this.ws.on('error', (err) => logger.error('WS Error:', err));
  }

  authenticate() {
    const timestamp = Date.now().toString();
    const payload = timestamp + 'websocket_login';
    const signature = crypto
      .createHmac('sha256', this.apiSecret)
      .update(payload)
      .digest('hex');

    const loginMsg = {
      type: 'websocket_login',
      payload: {
        api_key: this.apiKey,
        signature,
        timestamp
      }
    };

    this.ws.send(JSON.stringify(loginMsg));
    logger.info('Delta WS Auth sent...');
  }

  subscribe() {
    const subMsg = {
      type: 'subscribe',
      payload: {
        channels: ['orders']
      }
    };

    this.ws.send(JSON.stringify(subMsg));
    logger.info('Subscribed to orders channel');
  }

  onMessage(data) {
    const msg = JSON.parse(data);
    if (msg.type === 'websocket_login' && msg.success === true) {
      logger.info('WebSocket Auth Success');
      this.subscribe();
      return;
    }

    if (msg.channel === 'orders') {
      this.handleOrderUpdate(msg.payload);
    }
  }

  handleOrderUpdate(payload) {
    const order = payload.order;
    logger.info(`Order Update: ${order.product_symbol} ${order.side} ${order.state} filled: ${order.filled_size}/${order.size}`);

    // You can build further logic here:
    // - trigger Telegram notifications
    // - sync internal store
    // - detect fill completions
  }

  reconnect() {
    logger.warn('WebSocket disconnected. Reconnecting...');
    setTimeout(() => this.start(), this.reconnectDelay);
  }
}

module.exports = DeltaWsClient;
