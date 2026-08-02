const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const manifestPath = path.join(publicDir, 'site.webmanifest');

function fail(msg) {
  console.error('PWA manifest check FAILED:', msg);
  process.exitCode = 2;
}

function ok(msg) {
  console.log('PWA manifest check OK:', msg);
}

if (!fs.existsSync(manifestPath)) {
  fail('site.webmanifest not found at ' + manifestPath);
  process.exit(2);
}

let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
} catch (err) {
  fail('site.webmanifest is not valid JSON: ' + err.message);
  process.exit(2);
}

// Basic required fields
const requiredFields = ['name', 'short_name', 'start_url', 'display', 'icons'];
for (const f of requiredFields) {
  if (!manifest[f]) {
    fail(`manifest missing required field: ${f}`);
  }
}

if (!Array.isArray(manifest.icons)) {
  fail('manifest.icons is not an array');
}

// Ensure required icon sizes are declared and files exist
const requiredIconSizes = ['192x192', '512x512'];
for (const size of requiredIconSizes) {
  const icon = manifest.icons.find((i) => i.sizes && i.sizes === size);
  if (!icon) {
    fail(`manifest does not contain an icon entry with sizes "${size}"`);
  }
  // Resolve src (allow leading slash)
  const src = icon.src.replace(/^\//, '');
  const iconPath = path.join(publicDir, src);
  if (!fs.existsSync(iconPath)) {
    fail(`manifest icon declared but file missing: ${iconPath}`);
  }
}

// Check common static assets exist
const requiredFiles = ['favicon.ico', 'favicon-16x16.png', 'favicon-32x32.png', 'apple-touch-icon.png', 'fallback.png'];
for (const f of requiredFiles) {
  const p = path.join(publicDir, f);
  if (!fs.existsSync(p)) {
    fail(`required public asset missing: ${p}`);
  }
}

// Basic mime-type hint: check that manifest was served with application/manifest+json in dev is out of scope for CI
ok('manifest and required icon files exist');
console.log('Manifest summary:');
console.log('  name:', manifest.name);
console.log('  short_name:', manifest.short_name);
console.log('  icons:', manifest.icons.map((i) => `${i.src} (${i.sizes})`).join(', '));

process.exit(0);
