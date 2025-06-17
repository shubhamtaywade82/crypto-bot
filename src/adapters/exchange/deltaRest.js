async function request(method, path, params = {}, body = {}) {
  const timestamp = Date.now().toString();
  const queryStr = serializeQuery(params);
  const bodyStr = method === "GET" || !body ? "" : JSON.stringify(body);
  const fullPath = path + (queryStr ? `?${queryStr}` : "");

  const signature = generateSignature(
    delta.secret,
    timestamp,
    method,
    path,
    queryStr,
    bodyStr
  );
  const headers = {
    "api-key": delta.key,
    timestamp: timestamp,
    signature: signature,
  };

  try {
    const res = await instance.request({
      method,
      url: fullPath,
      params,
      data: body,
      headers,
    });
    return res.data;
  } catch (err) {
    console.error(
      `Delta API failed: ${err.response?.data?.message || err.message}`
    );
    throw err;
  }
}
