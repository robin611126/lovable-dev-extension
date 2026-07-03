const fs = require('fs');
const path = require('path');

// Determine if we should use Supabase or local json db
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const isSupabase = !!(SUPABASE_URL && SUPABASE_KEY);

let supabase = null;
if (isSupabase) {
  try {
    const { createClient } = require('@supabase/supabase-js');
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('Database Mode: Supabase Cloud Database');
  } catch (err) {
    console.error('Failed to load Supabase client, check dependency installation:', err);
  }
} else {
  console.log('Database Mode: Local JSON File Database');
}

// Support Render persistent disk path (/opt/render/project/src/data)
const RENDER_DISK_PATH = '/opt/render/project/src/data';
let DB_FILE = path.join(__dirname, 'db.json');

try {
  if (!isSupabase && fs.existsSync(RENDER_DISK_PATH)) {
    DB_FILE = path.join(RENDER_DISK_PATH, 'db.json');
  }
} catch (e) {
  console.log('Using default local db file path');
}

// Initialize database file if it doesn't exist
if (!isSupabase && !fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ licenses: [] }, null, 2));
}

function readDb() {
  if (isSupabase) return { licenses: [] };
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading DB:', err);
    return { licenses: [] };
  }
}

function writeDb(data) {
  if (isSupabase) return;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing DB:', err);
  }
}

async function getLicense(key) {
  if (isSupabase) {
    try {
      const { data, error } = await supabase
        .from('licenses')
        .select('*')
        .eq('license_key', key)
        .maybeSingle();
      if (error) {
        console.error('Supabase error in getLicense:', error);
        return null;
      }
      return data;
    } catch (e) {
      console.error('Supabase connection error in getLicense:', e);
      return null;
    }
  } else {
    const db = readDb();
    return db.licenses.find(l => l.license_key === key);
  }
}

async function createLicense(key, durationType) {
  const newLicense = {
    license_key: key,
    duration_type: durationType, // '1_hour', '1_week', '1_month', 'lifetime'
    status: 'unactivated', // 'unactivated', 'active', 'expired', 'suspended'
    device_id: null,
    activated_at: null,
    expires_at: null,
    created_at: new Date().toISOString()
  };

  if (isSupabase) {
    try {
      const { data, error } = await supabase
        .from('licenses')
        .insert([newLicense])
        .select()
        .single();
      if (error) {
        console.error('Supabase error in createLicense:', error);
        throw error;
      }
      return data;
    } catch (e) {
      console.error('Supabase connection error in createLicense:', e);
      throw e;
    }
  } else {
    const db = readDb();
    db.licenses.push(newLicense);
    writeDb(db);
    return newLicense;
  }
}

async function activateLicense(key, deviceId) {
  const license = await getLicense(key);
  
  if (!license) return { success: false, message: 'License key not found.' };
  if (license.status === 'suspended') return { success: false, message: 'License has been suspended.' };
  if (license.status === 'expired') return { success: false, message: 'License has expired.' };
  
  // If already activated, check device lock
  if (license.status === 'active') {
    if (license.device_id !== deviceId) {
      return { success: false, message: 'This key is already registered to another device.' };
    }
    // Check if expired in the meantime
    if (license.expires_at && new Date() > new Date(license.expires_at)) {
      await updateLicenseStatus(key, 'expired');
      return { success: false, message: 'License has expired.' };
    }
    return { success: true, license };
  }

  // Activate fresh key
  const activated_at = new Date().toISOString();
  
  // Calculate expiration time
  const now = new Date();
  let expires_at = null;
  if (license.duration_type === '1_hour') {
    now.setHours(now.getHours() + 1);
    expires_at = now.toISOString();
  } else if (license.duration_type === '1_week') {
    now.setDate(now.getDate() + 7);
    expires_at = now.toISOString();
  } else if (license.duration_type === '1_month') {
    now.setDate(now.getDate() + 30);
    expires_at = now.toISOString();
  } else if (license.duration_type === 'lifetime') {
    expires_at = null; // No expiry
  }

  if (isSupabase) {
    try {
      const { data, error } = await supabase
        .from('licenses')
        .update({
          status: 'active',
          device_id: deviceId,
          activated_at: activated_at,
          expires_at: expires_at
        })
        .eq('license_key', key)
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error in activateLicense:', error);
        return { success: false, message: 'Database update failed during activation.' };
      }
      return { success: true, license: data };
    } catch (e) {
      console.error('Supabase connection error in activateLicense:', e);
      return { success: false, message: 'Database connection failed during activation.' };
    }
  } else {
    // Local DB logic
    const db = readDb();
    const dbLicense = db.licenses.find(l => l.license_key === key);
    dbLicense.status = 'active';
    dbLicense.device_id = deviceId;
    dbLicense.activated_at = activated_at;
    dbLicense.expires_at = expires_at;
    writeDb(db);
    return { success: true, license: dbLicense };
  }
}

async function checkLicense(key, deviceId) {
  const license = await getLicense(key);

  if (!license) return { valid: false, status: 'invalid', message: 'License key not found.' };
  if (license.status === 'suspended') return { valid: false, status: 'suspended', message: 'License suspended.' };
  
  if (license.status === 'active') {
    if (license.device_id !== deviceId) {
      return { valid: false, status: 'invalid', message: 'Device ID mismatch.' };
    }
    // Check expiration
    if (license.expires_at && new Date() > new Date(license.expires_at)) {
      await updateLicenseStatus(key, 'expired');
      return { valid: false, status: 'expired', message: 'License expired.' };
    }
    return { valid: true, status: 'active', license };
  }

  return { valid: false, status: license.status, message: `License is ${license.status}.` };
}

async function updateLicenseStatus(key, newStatus) {
  if (isSupabase) {
    try {
      const { data, error } = await supabase
        .from('licenses')
        .update({ status: newStatus })
        .eq('license_key', key)
        .select()
        .maybeSingle();
      if (error) {
        console.error('Supabase error in updateLicenseStatus:', error);
        return null;
      }
      return data;
    } catch (e) {
      console.error('Supabase connection error in updateLicenseStatus:', e);
      return null;
    }
  } else {
    const db = readDb();
    const license = db.licenses.find(l => l.license_key === key);
    if (!license) return null;
    license.status = newStatus;
    writeDb(db);
    return license;
  }
}

async function getAllLicenses() {
  const now = new Date();
  if (isSupabase) {
    try {
      const { data, error } = await supabase
        .from('licenses')
        .select('*');
      if (error) {
        console.error('Supabase error in getAllLicenses:', error);
        return [];
      }
      
      const licenses = data || [];
      const expiredKeys = [];
      
      for (const lic of licenses) {
        if (lic.status === 'active' && lic.expires_at && new Date(lic.expires_at) < now) {
          lic.status = 'expired';
          expiredKeys.push(lic.license_key);
        }
      }
      
      if (expiredKeys.length > 0) {
        // Bulk update expired keys in Supabase
        const { error: updateError } = await supabase
          .from('licenses')
          .update({ status: 'expired' })
          .in('license_key', expiredKeys);
        if (updateError) {
          console.error('Failed to auto-expire keys in Supabase:', updateError);
        } else {
          console.log(`Auto-expired ${expiredKeys.length} license keys in Supabase.`);
        }
      }
      
      return licenses;
    } catch (e) {
      console.error('Supabase connection error in getAllLicenses:', e);
      return [];
    }
  } else {
    const dbData = readDb();
    let updated = false;
    dbData.licenses.forEach(lic => {
      if (lic.status === 'active' && lic.expires_at && new Date(lic.expires_at) < now) {
        lic.status = 'expired';
        updated = true;
      }
    });
    if (updated) {
      writeDb(dbData);
      console.log('Auto-expired keys in local JSON database.');
    }
    return dbData.licenses;
  }
}

module.exports = {
  getLicense,
  createLicense,
  activateLicense,
  checkLicense,
  updateLicenseStatus,
  getAllLicenses
};
