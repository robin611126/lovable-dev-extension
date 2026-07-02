# License Manager - Installation & Documentation

## 1. Installation Guide

This system is designed to run perfectly on standard shared hosting (like Hostinger, Namecheap, cPanel) with PHP 8.2+ and MySQL.

### Step 1: Upload Files
1. Create a new subdomain on your hosting (e.g., `license.your-domain.com`).
2. Upload the entire `licensing-server` folder contents to the public directory (usually `public_html`).
3. Ensure `.htaccess` is uploaded (it is a hidden file, make sure your FTP client shows hidden files).

### Step 2: Database Setup
1. Open your hosting control panel (cPanel) and go to **MySQL Databases**.
2. Create a new database, user, and password.
3. Assign all privileges to the user for that database.

### Step 3: Run the Installer
1. Open your browser and navigate to your domain (e.g., `https://license.your-domain.com/install/index.php`).
2. Follow the on-screen steps:
   - Enter your Database Host (usually `localhost`), Name, User, and Password.
   - Enter the Email and Password for your main Admin account.
3. **IMPORTANT**: After installation is complete, delete the `install` folder from your server for security reasons!

---

## 2. API Documentation

The REST API communicates securely using JWT tokens and JSON payload.

### POST /api/license/activate
Activates a new device or validates an existing session.
- **Request Body:**
  ```json
  {
    "license_key": "GB-XXXX-XXXX-XXXX-XXXX",
    "device_id": "unique-hardware-fingerprint"
  }
  ```
- **Response (Success):**
  ```json
  {
    "success": true,
    "valid": true,
    "session_id": "eyJhbGciOiJ...",
    "user_name": "Customer Name",
    "expires_at": "2027-10-01T00:00:00+00:00",
    "status": "active"
  }
  ```

### POST /api/license/check
Used for subsequent heartbeat checks to ensure the session is still valid.
- **Request Body:**
  ```json
  {
    "token": "eyJhbGciOiJ..."
  }
  ```

---

## 3. Extension Integration

To connect your existing Chrome extension to this backend:
1. Open `sidepanel.js`.
2. Locate `VALIDATE_URL` at the top of the file.
3. Change it to your new backend URL: `const VALIDATE_URL = "https://your-domain.com/api/license/activate";`
4. Load the unpacked extension in Chrome, and the Activation UI will seamlessly communicate with your new PHP backend!

---

## 4. Folder Structure
```text
licensing-server/
├── .htaccess                 # URL rewriting and security headers
├── index.php                 # Main Router
├── config/
│   ├── Database.php          # PDO DB Connection
│   └── Settings.php          # Settings Helper
├── Controllers/
│   ├── AdminController.php   # Admin Dashboard Logic
│   ├── ApiController.php     # REST API Logic
│   └── AuthController.php    # Login & Sessions
├── Models/
│   ├── Admin.php
│   ├── Device.php            # Fingerprint binding
│   ├── License.php           # License key management
│   └── Log.php               # API/Activation activity
├── Views/
│   ├── layout.php            # Global UI Layout
│   ├── login.php
│   ├── dashboard.php
│   ├── licenses.php
│   └── settings.php
└── install/
    ├── index.php             # Setup Wizard
    └── database.sql          # DB Schema
```
