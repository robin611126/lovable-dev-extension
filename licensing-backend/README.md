# Lovable Dev Licensing Backend

This is a complete, lightweight Express.js backend server with a JSON file-based database (`db.json`) for managing the subscription license keys of your Google Chrome extension.

## 🚀 How to Run Locally

1. Open your terminal in this directory (`c:\Users\shiva\Downloads\lovable dev extension\licensing-backend`).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
   The server will run at: **`http://localhost:3000`**

---

## 🔑 Admin Endpoints

All admin endpoints require the header `x-admin-secret` to match the `ADMIN_SECRET` in your `.env` file (defaults to `my-super-secret-admin-token`).

### 1. Generate License Keys
* **URL**: `POST http://localhost:3000/api/admin/generate-keys`
* **Headers**:
  * `Content-Type: application/json`
  * `x-admin-secret: my-super-secret-admin-token`
* **Body**:
  ```json
  {
    "duration_type": "1_hour", // Options: "1_hour", "1_week", "1_month", "lifetime"
    "count": 5 // How many keys to generate
  }
  ```

### 2. View All Licenses & Statuses
* **URL**: `GET http://localhost:3000/api/admin/keys`
* **Headers**:
  * `x-admin-secret: my-super-secret-admin-token`

### 3. Suspend a License Key
* **URL**: `POST http://localhost:3000/api/admin/suspend-key`
* **Headers**:
  * `Content-Type: application/json`
  * `x-admin-secret: my-super-secret-admin-token`
* **Body**:
  ```json
  {
    "license_key": "LOV-XXXX-XXXX-XXXX"
  }
  ```

### 4. Reactivate / Reset a License Key
* **URL**: `POST http://localhost:3000/api/admin/reactivate-key`
* **Headers**:
  * `Content-Type: application/json`
  * `x-admin-secret: my-super-secret-admin-token`
* **Body**:
  ```json
  {
    "license_key": "LOV-XXXX-XXXX-XXXX"
  }
  ```

---

## ⚡ Extension Integration
The extension is pre-configured to communicate with this local server:
- **Activation requests** go to `http://localhost:3000/index.php?route=api/activate` where they are validated, bound to the browser's hardware fingerprint (`device_id`), and their expiration date calculated.
- **Heartbeat checks** are executed every 30 seconds by the extension background worker, checking against `http://localhost:3000/index.php?route=api/check` to lock out expired or suspended keys.
