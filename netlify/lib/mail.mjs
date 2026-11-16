// Shared mail plumbing for the Netlify Functions (send-geschenk, newsletter, mail-background).
//
// Measured 2026-11-16 (phase timings of real sends): connecting, TLS and login at the netcup server take
// about one second; the wait is at the END of the message, where the server scans the content before it
// accepts the mail (5–6 s for a plain note, 16–21 s for the confirmation mail with its link, one 504).
// A second probe showed 18–28 s for ANY mail with an attachment, link or not, with large swings.
// So: mails that a visitor waits for are handed to the background function `mail-background`
// (returns at once, retries on failure); only mails that need an immediate yes/no stay synchronous.
// A background function accepts at most 256 KB, so a Geschenk PDF is parked in Netlify Blobs for the
// seconds until it is sent, and deleted right after (see parkPdf / takePdf).
import nodemailer from 'nodemailer';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { createHmac, createHash, timingSafeEqual, randomUUID } from 'node:crypto';
import { getStore, connectLambda } from '@netlify/blobs';

export const smtpConfigured = (env) => env.MAIL_DRYRUN === '1' || !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);

export async function makeTransport(env) {
  if (env.MAIL_DRYRUN === '1') return nodemailer.createTransport({ jsonTransport: true });
  const port = Number(env.SMTP_PORT || 465);
  let host = env.SMTP_HOST; const tls = {};
  // resolve with getaddrinfo and keep the name for the certificate check (skips nodemailer's own resolver)
  if (!isIP(host)) {
    try { const { address } = await lookup(host, { family: 4 }); tls.servername = host; host = address; }
    catch { /* fall back to nodemailer's own resolution */ }
  }
  return nodemailer.createTransport({
    host, port, secure: port === 465, auth: { user: env.SMTP_USER, pass: env.SMTP_PASS }, tls,
    name: 'www.fridosfriends.de', // EHLO name (the runtime would otherwise announce a link-local address)
    dnsTimeout: 5000, connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 60000,
  });
}

// ---- signing: newsletter tokens and the hand-over to the background function share one key
export function mailKey(env) {
  if (env.NEWSLETTER_SECRET) return env.NEWSLETTER_SECRET;
  return createHash('sha256').update('ff-newsletter|' + (env.SMTP_PASS || 'dryrun')).digest();
}
export const b64u = (buf) => Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
export const signText = (text, env) => b64u(createHmac('sha256', mailKey(env)).update(text).digest());
export function sigOk(text, sig, env) {
  const a = Buffer.from(String(sig || '')); const b = Buffer.from(signText(text, env));
  return a.length === b.length && timingSafeEqual(a, b);
}

// Hand one message to the background function. Resolves true when it was accepted for sending.
export async function sendInBackground(origin, msg, env) {
  const payload = JSON.stringify({ msg, t: Date.now() });
  const res = await fetch(`${origin}/.netlify/functions/mail-background`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'x-ff-sig': signText(payload, env) }, body: payload,
  });
  return res.status >= 200 && res.status < 300;
}

// Only our own hosts may appear in links or receive the hand-over (the Host header is client-controlled).
export function siteOrigin(event) {
  const host = String((event.headers && event.headers.host) || '').toLowerCase();
  if (/^(www\.)?fridosfriends\.de$/.test(host) || /^[a-z0-9-]+--kolleg\.netlify\.app$/.test(host) || host === 'kolleg.netlify.app') return 'https://' + host;
  if (/^localhost:\d+$/.test(host)) return 'http://' + host;
  return 'https://www.fridosfriends.de';
}

// ---- PDF parking: the PDF waits in a blob store only until the background function has sent it
const PDF_STORE = 'geschenk-mail';
const PDF_MAX_AGE_MS = 60 * 60 * 1000;
// (default, eventually consistent store: strong consistency is not available to this function format —
//  a write can take a moment to become readable, so takePdf waits and retries)
const pdfStore = (event) => { connectLambda(event); return getStore(PDF_STORE); };
export async function parkPdf(event, bytes) {
  const key = `${Date.now()}-${randomUUID()}`;
  await pdfStore(event).set(key, bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
  return key;
}
export async function takePdf(event, key) {
  const store = pdfStore(event);
  for (let i = 0; i < 15; i++) { // up to ~70 s
    const buf = await store.get(key, { type: 'arrayBuffer' }).catch(() => null);
    if (buf) return Buffer.from(buf);
    await new Promise((r) => setTimeout(r, 5000));
  }
  return null;
}
export async function dropPdf(event, key) { try { await pdfStore(event).delete(key); } catch { /* already gone */ } }
// leftovers (a hand-over that never ran): anything older than an hour is removed
export async function sweepPdfs(event) {
  try {
    const store = pdfStore(event); const { blobs } = await store.list();
    for (const b of blobs) { const t = Number(String(b.key).split('-')[0]); if (t && Date.now() - t > PDF_MAX_AGE_MS) await store.delete(b.key); }
  } catch { /* best effort */ }
}
