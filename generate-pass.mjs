// Generates an "Add to Google Wallet" link for a fake coworking pass.
// Uses a Generic pass with the class + object embedded in the signed JWT,
// so no Wallet API calls are needed -- just an issuer ID and a service account key.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createSign, randomUUID } from 'node:crypto';

// Minimal .env loader so this runs on Node 18 (no --env-file needed).
if (existsSync('.env')) {
  for (const line of readFileSync('.env', 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
}

const issuerId = process.env.ISSUER_ID;
const keyPath = process.env.SERVICE_ACCOUNT_KEY || './keys/service-account.json';
const memberName = process.env.MEMBER_NAME || 'Alex Example';
const logoUrl =
  process.env.LOGO_URL ||
  'https://storage.googleapis.com/wallet-lab-tools-codelab-artifacts-public/pass_google_logo.jpg';

if (!issuerId) {
  console.error('Missing ISSUER_ID. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

const key = JSON.parse(readFileSync(keyPath, 'utf8'));
const classId = `${issuerId}.foxglove_cowork_pass`;
const objectId = `${issuerId}.member_${randomUUID()}`;

const genericClass = { id: classId };

const genericObject = {
  id: objectId,
  classId,
  state: 'ACTIVE',
  hexBackgroundColor: '#2d1b4e',
  logo: { sourceUri: { uri: logoUrl }, contentDescription: { defaultValue: { language: 'en-US', value: 'Foxglove Cowork logo' } } },
  cardTitle: { defaultValue: { language: 'en-US', value: 'Foxglove Cowork' } },
  subheader: { defaultValue: { language: 'en-US', value: 'Member' } },
  header: { defaultValue: { language: 'en-US', value: memberName } },
  barcode: { type: 'QR_CODE', value: objectId, alternateText: 'FGC-0042' },
  textModulesData: [
    { id: 'plan', header: 'PLAN', body: 'Flex Desk - Unlimited' },
    { id: 'floor', header: 'FLOOR', body: '3 - Quiet Zone' },
    { id: 'since', header: 'MEMBER SINCE', body: 'Oct 2026' },
    { id: 'wifi', header: 'WIFI', body: 'foxglove-guest / hotdesk42' },
  ],
  linksModuleData: {
    uris: [{ uri: 'https://example.com/foxglove-cowork', description: 'Foxglove Cowork (fake)', id: 'site' }],
  },
};

const b64url = (b) => Buffer.from(b).toString('base64url');
const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
const payload = b64url(
  JSON.stringify({
    iss: key.client_email,
    aud: 'google',
    typ: 'savetowallet',
    iat: Math.floor(Date.now() / 1000),
    origins: [],
    payload: { genericClasses: [genericClass], genericObjects: [genericObject] },
  }),
);
const signature = createSign('RSA-SHA256').update(`${header}.${payload}`).sign(key.private_key, 'base64url');

const link = `https://pay.google.com/gp/v/save/${header}.${payload}.${signature}`;
writeFileSync('save-link.txt', link + '\n');
console.log('\nOpen this link on your Pixel (or paste it into Chrome):\n');
console.log(link + '\n');
console.log('Also saved to save-link.txt (gitignored).');
