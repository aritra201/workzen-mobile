/**
 * Regenerate icon / adaptive-icon / splash-icon from WORKZEN_LOGO_URI.
 * Run: node scripts/generate-brand-assets.js
 */
const fs = require('fs');
const path = require('path');

const LOGO_URL =
  process.env.WORKZEN_LOGO_URL ||
  'https://res.cloudinary.com/jrfg8gkx/image/upload/v1790473248/favicon.png';
const BG = '#0b1628';
const assetsDir = path.join(__dirname, '..', 'assets');

async function main() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch {
    console.error('Install sharp first: npm install --save-dev sharp');
    process.exit(1);
  }

  const res = await fetch(LOGO_URL);
  if (!res.ok) {
    throw new Error(`Failed to download logo: ${res.status}`);
  }
  const input = Buffer.from(await res.arrayBuffer());

  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  await sharp(input)
    .resize(1024, 1024, { fit: 'contain', background: BG })
    .png()
    .toFile(path.join(assetsDir, 'icon.png'));

  await sharp(input)
    .resize(660, 660, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({
      top: 182,
      bottom: 182,
      left: 182,
      right: 182,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(path.join(assetsDir, 'adaptive-icon.png'));

  await sharp(input)
    .resize(280, 280, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(assetsDir, 'splash-icon.png'));

  console.log('Wrote icon.png, adaptive-icon.png, splash-icon.png');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
