const https = require('https');

const payload = JSON.stringify({
  license_key: 'LOV-TEST-KEY',
  device_id: 'TEST-DEVICE-123'
});

const options = {
  hostname: 'lovable-dev-extension.vercel.app',
  port: 443,
  path: '/index.php?route=api/check',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': payload.length
  }
};

console.log('Sending request to: https://' + options.hostname + options.path);

const req = https.request(options, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response text:', data);
  });
});

req.on('error', (err) => {
  console.error('Error fetching:', err);
});

req.write(payload);
req.end();
