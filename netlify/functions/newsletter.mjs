// Netlify Function: newsletter sign-up with double opt-in — no database, no third-party service.
//   POST { action:'subscribe', email, lang, source, website }  → e-mails a confirmation link to that address.
//   POST { action:'confirm', token }                          → verifies the signed link and notifies the Vorstand,
//                                                               who keeps the list by hand.
// The link carries the address + time, signed with HMAC (key derived from SMTP_PASS, or NEWSLETTER_SECRET if set),
// so nothing is stored before the person confirms. Confirmation needs a button click on /newsletter/ (a plain GET
// does nothing — mail scanners that pre-open links cannot confirm by accident).
// Env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS (as for send-geschenk), optional MAIL_FROM,
//      NEWSLETTER_NOTIFY (default vorstand@fridosfriends.de), NEWSLETTER_SECRET. MAIL_DRYRUN=1 → nothing is sent (tests).
// The confirmation mail leaves via the background function `mail-background` (the mail server needs up to ~20 s to
// accept it); the notification to the Vorstand stays synchronous, so the person only sees "confirmed" once it is out.
import { makeTransport, smtpConfigured, sendInBackground, signText, sigOk, b64u } from '../lib/mail.mjs';

const NOTIFY_DEFAULT = 'vorstand@fridosfriends.de';
const SITE = 'https://www.fridosfriends.de';
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;        // a confirmation link is valid for 30 days
const RATE = { windowMs: 10 * 60 * 1000, max: 6 };  // per IP per function instance (best effort)
const hits = new Map();

const json = (status, body) => ({ statusCode: status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }, body: JSON.stringify(body) });
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const unb64u = (s) => Buffer.from(String(s).replace(/-/g, '+').replace(/_/g, '/'), 'base64');

function limited(ip) {
  const now = Date.now(); const arr = (hits.get(ip) || []).filter((t) => now - t < RATE.windowMs);
  arr.push(now); hits.set(ip, arr); return arr.length > RATE.max;
}
function makeToken(data, env) { const p = b64u(JSON.stringify(data)); return p + '.' + signText(p, env); }
function readToken(token, env) {
  const [p, s] = String(token || '').split('.');
  if (!p || !s) return null;
  if (!sigOk(p, s, env)) return null;
  try { const d = JSON.parse(unb64u(p).toString('utf8')); return (d && EMAIL_RE.test(d.e || '') && Number(d.t)) ? d : null; } catch { return null; }
}
// Only our own hosts may appear in the mailed link (the Host header is client-controlled).
function origin(event) {
  const host = String(event.headers.host || '').toLowerCase();
  if (/^(www\.)?fridosfriends\.de$/.test(host) || /^[a-z0-9-]+--kolleg\.netlify\.app$/.test(host) || host === 'kolleg.netlify.app') return 'https://' + host;
  if (/^localhost:\d+$/.test(host)) return 'http://' + host;
  return SITE;
}
function confirmCopy(lang, link) {
  return lang === 'en'
    ? { subject: 'Please confirm your newsletter sign-up',
        text: `Hello,\n\nthank you for your interest in the Frido’s Friends newsletter. Please confirm your sign-up with this link:\n\n${link}\n\nWe only add your address to our list once you have confirmed. If you did not sign up, simply ignore this message.\n\nFrido’s Friends e.V. · www.fridosfriends.de` }
    : { subject: 'Bitte bestätigen Sie Ihre Newsletter-Anmeldung',
        text: `Guten Tag,\n\nvielen Dank für Ihr Interesse am Newsletter von Frido’s Friends. Bitte bestätigen Sie Ihre Anmeldung über diesen Link:\n\n${link}\n\nErst nach Ihrer Bestätigung nehmen wir Ihre Adresse in den Verteiler auf. Wenn Sie sich nicht angemeldet haben, können Sie diese Nachricht einfach ignorieren.\n\nFrido’s Friends e.V. · www.fridosfriends.de` };
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { ok: false, error: 'method' });
  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return json(400, { ok: false, error: 'json' }); }
  const env = process.env;
  const dry = env.MAIL_DRYRUN === '1';
  if (!smtpConfigured(env)) return json(503, { ok: false, error: 'notconfigured' });
  const ip = (event.headers['x-nf-client-connection-ip'] || event.headers['client-ip'] || 'unknown');
  const from = env.MAIL_FROM || `Frido’s Friends e.V. <${env.SMTP_USER || NOTIFY_DEFAULT}>`;
  const notify = env.NEWSLETTER_NOTIFY || NOTIFY_DEFAULT;

  // ---- step 2: the person clicked the button on the confirmation page
  if (body.action === 'confirm') {
    const d = readToken(body.token, env);
    if (!d) return json(400, { ok: false, error: 'token' });
    if (Date.now() - Number(d.t) > MAX_AGE_MS) return json(410, { ok: false, error: 'expired' });
    if (limited(ip)) return json(429, { ok: false, error: 'rate' });
    const when = new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin', dateStyle: 'long', timeStyle: 'short' });
    const asked = new Date(Number(d.t)).toLocaleString('de-DE', { timeZone: 'Europe/Berlin', dateStyle: 'long', timeStyle: 'short' });
    try {
      const t0 = Date.now();
      await (await makeTransport(env)).sendMail({
        from, to: notify, replyTo: d.e, subject: `Newsletter: neue bestätigte Anmeldung (${d.e})`,
        text: `Eine Newsletter-Anmeldung wurde bestätigt (Double-Opt-in).\n\nE-Mail:          ${d.e}\nAngemeldet am:   ${asked}\nBestätigt am:    ${when}\nAngemeldet über: ${d.s || 'unbekannt'}\nSprache:         ${d.l === 'en' ? 'Englisch' : 'Deutsch'}\n\nBitte in den Newsletter-Verteiler aufnehmen. Diese Nachricht ist zugleich der Nachweis der Einwilligung – bitte aufbewahren, solange die Adresse im Verteiler ist.`,
      });
      console.log('newsletter confirm sent in', Date.now() - t0, 'ms');
      return json(200, { ok: true, dry, email: d.e });
    } catch (err) {
      console.error('newsletter confirm failed:', err && err.message);
      return json(502, { ok: false, error: 'send' });
    }
  }

  // ---- step 1: sign-up → mail the confirmation link
  const { email = '', lang = 'de', source = '', website = '' } = body;
  if (website) return json(200, { ok: true }); // honeypot: pretend success, send nothing
  const addr = String(email).trim();
  if (!EMAIL_RE.test(addr) || addr.length > 120) return json(400, { ok: false, error: 'email' });
  if (limited(ip)) return json(429, { ok: false, error: 'rate' });
  const l = lang === 'en' ? 'en' : 'de';
  const s = /^[a-z-]{1,24}$/.test(String(source)) ? String(source) : '';
  const token = makeToken({ e: addr, l, s, t: Date.now() }, env);
  const link = `${origin(event)}${l === 'en' ? '/en/newsletter/' : '/newsletter/'}?t=${token}`;
  const { subject, text } = confirmCopy(l, link);
  try {
    const msg = { from, to: addr, replyTo: notify, subject, text };
    // the visitor should not wait for the mail server: hand the message to the background function;
    // if that hand-over is refused (or in dry-run), send it right here
    let handed = false;
    if (!dry) { try { handed = await sendInBackground(origin(event), msg, env); } catch { handed = false; } }
    if (!handed) await (await makeTransport(env)).sendMail(msg);
    return json(200, { ok: true, dry, ...(dry ? { link } : {}) });
  } catch (err) {
    console.error('newsletter subscribe failed:', err && err.message);
    return json(502, { ok: false, error: 'send' });
  }
};
