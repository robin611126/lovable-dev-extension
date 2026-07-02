require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const db = require('./db');

const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Simple helper to generate human-readable license keys (e.g. LOV-XXXX-XXXX-XXXX)
function generateKeyString() {
  const parts = [];
  for (let i = 0; i < 3; i++) {
    parts.push(crypto.randomBytes(2).toString('hex').toUpperCase());
  }
  return `LOV-${parts.join('-')}`;
}

// Middleware to verify admin access
function verifyAdmin(req, res, next) {
  const secret = req.headers['x-admin-secret'];
  const expectedSecret = process.env.ADMIN_SECRET || 'my-super-secret-admin-token';
  
  if (!secret || secret !== expectedSecret) {
    return res.status(401).json({ error: 'Unauthorized: Invalid admin secret.' });
  }
  next();
}

// ==========================================
// ADMIN API ENDPOINTS
// ==========================================

// 1. Generate new license keys
app.post('/api/admin/generate-keys', verifyAdmin, async (req, res) => {
  const { duration_type, count } = req.body;
  const validDurations = ['1_hour', '1_week', '1_month', 'lifetime'];
  
  if (!validDurations.includes(duration_type)) {
    return res.status(400).json({ error: 'Invalid duration type. Must be: 1_hour, 1_week, 1_month, or lifetime.' });
  }

  const keysCreated = [];
  const total = parseInt(count) || 1;

  try {
    for (let i = 0; i < total; i++) {
      const key = generateKeyString();
      const lic = await db.createLicense(key, duration_type);
      keysCreated.push(lic);
    }
    res.json({ success: true, count: keysCreated.length, keys: keysCreated });
  } catch (err) {
    console.error('Error generating keys:', err);
    res.status(500).json({ error: 'Failed to generate keys in database.' });
  }
});

// 2. Get list of all generated keys
app.get('/api/admin/keys', verifyAdmin, async (req, res) => {
  try {
    const licenses = await db.getAllLicenses();
    res.json({ success: true, licenses });
  } catch (err) {
    console.error('Error fetching keys:', err);
    res.status(500).json({ error: 'Failed to read keys from database.' });
  }
});

// 3. Suspend a key manually
app.post('/api/admin/suspend-key', verifyAdmin, async (req, res) => {
  const { license_key } = req.body;
  try {
    const updated = await db.updateLicenseStatus(license_key, 'suspended');
    if (!updated) return res.status(404).json({ error: 'License key not found.' });
    res.json({ success: true, license: updated });
  } catch (err) {
    console.error('Error suspending key:', err);
    res.status(500).json({ error: 'Database update failed.' });
  }
});

// 4. Reactivate / Reset a key manually
app.post('/api/admin/reactivate-key', verifyAdmin, async (req, res) => {
  const { license_key } = req.body;
  try {
    const updated = await db.updateLicenseStatus(license_key, 'unactivated');
    if (!updated) return res.status(404).json({ error: 'License key not found.' });
    res.json({ success: true, license: updated });
  } catch (err) {
    console.error('Error reactivating key:', err);
    res.status(500).json({ error: 'Database update failed.' });
  }
});

// ==========================================
// CLIENT API ENDPOINTS (Called by Extension)
// ==========================================

// 1. Activate & Check Keys
app.post('/index.php', async (req, res) => {
  const route = req.query.route;
  
  if (route === 'api/activate') {
    const { license_key, device_id } = req.body;
    if (!license_key || !device_id) {
      return res.status(400).json({ success: false, valid: false, message: 'Missing license key or device ID.' });
    }
    
    try {
      const result = await db.activateLicense(license_key, device_id);
      if (!result.success) {
        return res.json({ success: false, valid: false, message: result.message });
      }

      return res.json({
        success: true,
        valid: true,
        session_id: crypto.randomUUID(),
        user_name: `User-${license_key.substring(4, 8)}`,
        expiry: result.license.expires_at,
        expires_at: result.license.expires_at,
        status: result.license.status,
        duration_type: result.license.duration_type,
        activated_at: result.license.activated_at,
        message: 'License successfully activated!'
      });
    } catch (err) {
      console.error('Activation server error:', err);
      return res.status(500).json({ success: false, valid: false, message: 'Internal activation server error.' });
    }
  }

  if (route === 'api/check') {
    const { license_key, device_id } = req.body;
    if (!license_key || !device_id) {
      return res.status(400).json({ success: false, valid: false, message: 'Missing parameters.' });
    }

    try {
      const check = await db.checkLicense(license_key, device_id);
      if (!check.valid) {
        return res.json({ success: false, valid: false, status: check.status, message: check.message });
      }

      return res.json({
        success: true,
        valid: true,
        status: check.license.status,
        duration_type: check.license.duration_type,
        expiry: check.license.expires_at,
        expires_at: check.license.expires_at,
        message: 'Active license'
      });
    } catch (err) {
      console.error('Verification server error:', err);
      return res.status(500).json({ success: false, valid: false, message: 'Verification server error.' });
    }
  }

  res.status(404).json({ error: 'Route not found' });
});

// Explicit root route — serves admin panel HTML
// (fallback in case express.static doesn't resolve in serverless)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Licensing Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
