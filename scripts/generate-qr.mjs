import { createRequire } from 'module';
import { writeFileSync, mkdirSync } from 'fs';

const require = createRequire(import.meta.url);
const QRCode = require('qrcode');

const epcData = [
  'BCD', '002', '1', 'SCT', 'SOLADES1STB',
  "Frido's Friends e.V.",
  'DE44680522300000205526',
  'EUR0.00', '', 'Spende Fridos Friends eV', ''
].join('\n');

const svg = await QRCode.toString(epcData, {
  type: 'svg',
  width: 200,
  margin: 2,
  color: { dark: '#1C1B19', light: '#FBF9F4' }
});

mkdirSync('public/images', { recursive: true });
writeFileSync('public/images/sepa-qr.svg', svg);
console.log('SEPA QR code generated.');
