// Netlify BACKGROUND function (the "-background" suffix): the caller gets 202 at once, the mail goes out here.
// Only our own functions can use it — the body must carry a fresh HMAC signature (see netlify/lib/mail.mjs),
// so this is not an open mailer. Retries, because the netcup server sometimes takes long to accept a mail.
// A Geschenk PDF arrives as a key into the blob store (msg.pdfKey); it is deleted once the mail is out.
import { makeTransport, smtpConfigured, sigOk, takePdf, dropPdf, sweepPdfs } from '../lib/mail.mjs';

const MAX_AGE_MS = 5 * 60 * 1000;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export const handler = async (event) => {
  const env = process.env;
  if (event.httpMethod !== 'POST' || !smtpConfigured(env)) return { statusCode: 400 };
  const raw = event.body || '';
  if (!sigOk(raw, event.headers['x-ff-sig'], env)) { console.error('mail-background: bad signature'); return { statusCode: 403 }; }
  let data; try { data = JSON.parse(raw); } catch { return { statusCode: 400 }; }
  if (!data || !data.msg || Math.abs(Date.now() - Number(data.t)) > MAX_AGE_MS) { console.error('mail-background: stale or empty'); return { statusCode: 400 }; }
  const { from, to, replyTo, subject, text, pdfKey } = data.msg;
  let attachments;
  if (pdfKey) {
    const pdf = await takePdf(event, pdfKey).catch(() => null);
    if (!pdf) { console.error('mail-background: parked PDF not found'); return { statusCode: 410 }; }
    attachments = [{ filename: 'Fridos-Friends-Geschenk.pdf', content: pdf, contentType: 'application/pdf' }];
  }
  let status = 500;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const t0 = Date.now();
    try {
      await (await makeTransport(env)).sendMail({ from, to, replyTo, subject, text, attachments });
      console.log(`mail-background: sent in ${Date.now() - t0} ms (attempt ${attempt})`);
      status = 200;
      /* TEMP-PROBE */ if (data.cb) { try { await fetch(`${data.cb}/.netlify/functions/newsletter`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'bgping', attempt: pdfKey ? 2 : 1 }) }); } catch {} }
      break;
    } catch (err) {
      console.error(`mail-background: attempt ${attempt} failed after ${Date.now() - t0} ms:`, err && err.message);
      if (attempt < 3) await wait(20000);
    }
  }
  if (pdfKey) { await dropPdf(event, pdfKey); await sweepPdfs(event); }
  return { statusCode: status };
};
