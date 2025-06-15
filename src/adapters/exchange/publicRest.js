const axios = require('axios');
const { delta } = require('../../config/env');

const instance = axios.create({
  baseURL: delta.restUrl,
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' }
});

async function publicRequest(method, path, params = {}) {
  return instance.request({
    method,
    url: path,
    params
  }).then(res => res.data);
}

module.exports = { publicRequest };