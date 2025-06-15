// src/adapters/exchange/deltaRest.js
const axios = require('axios');
const { delta } = require('../../config/env');
const { generateSignature, serializeQuery } = require('./utils');

const instance = axios.create({
  baseURL: delta.restUrl,
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' }
});

async function request(method, path, params = {}, body = {}) {
  const timestamp = Date.now().toString();
  const queryStr = serializeQuery(params);
  const bodyStr = (method === 'GET' || !body) ? '' : JSON.stringify(body);
  const fullPath = path + (queryStr ? `?${queryStr}` : '');

  const signature = generateSignature(delta.secret, timestamp, method, path, queryStr, bodyStr);

  const headers = {
    'api-key': delta.key,
    'timestamp': timestamp,
    'signature': signature
  };

  return instance.request({
    method,
    url: fullPath,
    params,
    data: body,
    headers
  }).then(res => res.data);
}

module.exports = { request };