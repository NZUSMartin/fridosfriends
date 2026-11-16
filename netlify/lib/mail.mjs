// Shared mail plumbing for the Netlify Functions (send-geschenk, newsletter, mail-background).
//
// Measured 2026-11-16 (phase timings of real sends): connecting, TLS and login at the netcup server take
// about one second; the wait is at the END of the message, where the server scans the content before it
// accepts the mail (5–6 s for a plain note, 16–21 s for the confirmation mail with its link, one 504).
// So: mails that a visitor waits for are handed to the background function `mail-background`
// (returns at once, retries on failure); only mails that need an immediate yes/no stay synchronous.
import nodemailer from 'nodemailer';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { createHmac, createHash, timingSafeEqual } from 'node:crypto';

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
