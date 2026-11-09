// Netlify Function: e-mails a generated Geschenk PDF to ONE address the giver typed in.
// Static site → this is the only server piece. Sends through the Verein's own mailbox (SMTP at netcup)
// so SPF stays intact. Configure in Netlify → Site configuration → Environment variables:
//   SMTP_HOST, SMTP_PORT (465 = SSL, 587 = STARTTLS), SMTP_USER, SMTP_PASS, MAIL_FROM (optional,
//   default "Frido’s Friends e.V. <SMTP_USER>"), MAIL_REPLY_TO (optional, default donation@fridosfriends.de). MAIL_DRYRUN=1 → no mail is sent, the message is echoed (tests).
import nodemailer from 'nodemailer';

const REPLY_DEFAULT = 'donation@fridosfriends.de';
const MAX_PDF_BYTES = 4 * 1024 * 1024;           // the client sends a JPEG-based PDF, ~0.5–1 MB
const RATE = { windowMs: 10 * 60 * 1000, max: 6 }; // per IP per function instance (best effort)
const hits = new Map();

const json = (status, body) => ({ statusCode: status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }, body: JSON.stringify(body) });
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function limited(ip) {
  const now = Date.now(); const arr = (hits.get(ip) || []).filter((t) => now - t < RATE.windowMs);
  arr.push(now); hits.set(ip, arr); return arr.length > RATE.max;
}

function copy(lang, occasion, recipient, giver) {
  const en = lang === 'en';
  const occ = occasion === 'weihnachten' ? (en ? 'Christmas' : 'Weihnachten') : (en ? 'birthday' : 'Geburtstag');
  const subject = en ? 'Your gift from Frido’s Friends' : 'Ihr Geschenk von Frido’s Friends';
  const text = en
    ? `Hello,\n\nattached is the gift that was created on fridosfriends.de${giver ? ` by ${giver}` : ''}${recipient ? ` for ${recipient}` : ''} (${occ}): a donation in someone’s name for a girl’s school year in Adjumani, northern Uganda.\n\nThe PDF is A4 — print it or pass it on as it is.\n\nThis message is not a donation receipt. Receipts: vorstand@fridosfriends.de\n\nFrido’s Friends e.V. · www.fridosfriends.de`
    : `Guten Tag,\n\nim Anhang finden Sie das Geschenk, das auf fridosfriends.de${giver ? ` von ${giver}` : ''}${recipient ? ` für ${recipient}` : ''} gestaltet wurde (${occ}): eine Spende in Ihrem Namen für ein Schuljahr eines Mädchens in Adjumani, Norduganda.\n\nDas PDF ist im A4-Format – zum Ausdrucken oder Weiterleiten.\n\nDiese Nachricht ist keine Spendenbescheinigung. Bescheinigungen: vorstand@fridosfriends.de\n\nFrido’s Friends e.V. · www.fridosfriends.de`;
  return { subject, text };
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { ok: false, error: 'method' });
  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return json(400, { ok: false, error: 'json' }); }
  const { to = '', lang = 'de', occasion = '', recipient = '', giver = '', pdf = '', website = '' } = body;
  if (website) return json(200, { ok: true }); // honeypot: pretend success, send nothing
  const toAddr = String(to).trim();
  if (!EMAIL_RE.test(toAddr) || toAddr.length > 120) return json(400, { ok: false, error: 'email' });
  if (typeof pdf !== 'string' || pdf.length < 100 || pdf.length > MAX_PDF_BYTES * 1.4) return json(413, { ok: false, error: 'size' });
  const bytes = Buffer.from(pdf, 'base64');
  if (bytes.length > MAX_PDF_BYTES || bytes.subarray(0, 4).toString() !== '%PDF') return json(400, { ok: false, error: 'pdf' });
  const ip = (event.headers['x-nf-client-connection-ip'] || event.headers['client-ip'] || 'unknown');
  if (limited(ip)) return json(429, { ok: false, error: 'rate' });

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM, MAIL_REPLY_TO, MAIL_DRYRUN } = process.env;
  const dry = MAIL_DRYRUN === '1';
  if (!dry && !(SMTP_HOST && SMTP_USER && SMTP_PASS)) return json(503, { ok: false, error: 'notconfigured' });

  const transport = dry
    ? nodemailer.createTransport({ jsonTransport: true })
    : nodemailer.createTransport({ host: SMTP_HOST, port: Number(SMTP_PORT || 465), secure: Number(SMTP_PORT || 465) === 465, auth: { user: SMTP_USER, pass: SMTP_PASS } });
  const { subject, text } = copy(lang, occasion, String(recipient).slice(0, 60), String(giver).slice(0, 60));
  try {
    const info = await transport.sendMail({
      from: MAIL_FROM || `Frido’s Friends e.V. <${SMTP_USER || REPLY_DEFAULT}>`, to: toAddr, replyTo: MAIL_REPLY_TO || REPLY_DEFAULT, subject, text,
      attachments: [{ filename: 'Fridos-Friends-Geschenk.pdf', content: bytes, contentType: 'application/pdf' }],
    });
    return json(200, { ok: true, dry, id: info.messageId || null, ...(dry ? { size: bytes.length, to: toAddr, subject } : {}) });
  } catch (err) {
    console.error('send-geschenk failed:', err && err.message);
    return json(502, { ok: false, error: 'send' });
  }
};
