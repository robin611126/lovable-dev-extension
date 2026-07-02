const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

const config = require('./obfuscate-config.json');

const filesToObfuscate = [
  'security-hardening.js',
  'extension-config.js',
  'license-guard.js',
  'lovable-auth.js',
  'lovable-feature-api.js',
  'user-messages.js',
  'content-bridge.js',
  'pageHook.js',
  'content-templates.js',
  'sidepanel-templates.js',
  'sounds.js',
  'hwFingerprint.js',
  'sidepanel.js',
  'content.js',
  'background.js'
];

const outputDir = path.join(__dirname, 'dist');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

function copyAssets() {
  const items = [
    'manifest.json',
    'sidepanel.html',
    'sidepanel.css',
    'theme.css',
    'floating.css',
    'jszip.min.js',
    'assets',
    'sounds'
  ];
  items.forEach(item => {
    const src = path.join(__dirname, item);
    const dst = path.join(outputDir, item);
    if (fs.existsSync(src)) {
      if (fs.lstatSync(src).isDirectory()) {
        fs.cpSync(src, dst, { recursive: true });
      } else {
        fs.copyFileSync(src, dst);
      }
    }
  });
}

filesToObfuscate.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${file} (not found)`);
    return;
  }
  console.log(`Obfuscating ${file}...`);
  const code = fs.readFileSync(filePath, 'utf8');
  const result = JavaScriptObfuscator.obfuscate(code, config);
  fs.writeFileSync(path.join(outputDir, file), result.getObfuscatedCode());
  console.log(`  -> dist/${file}`);
});

copyAssets();
console.log('\nDone! Obfuscated files are in dist/');
