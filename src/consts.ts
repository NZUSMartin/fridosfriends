/**
 * Central, board-editable configuration.
 * Edit these values (and re-deploy) to update the site — or, for the funding
 * figure, set FUNDING.sheetUrl to a published Google-Sheet CSV link and the
 * thermometer updates live on every visit with NO rebuild needed.
 */
export const FUNDING = {
  raised: 2285,         // EUR raised in the current year (fallback if no live sheet)
  goal: 30000,          // EUR target for the year
  year: 2026,
  asof: 'Juli 2026',    // "as of" stamp (fallback; the live sheet's "Stand" column overrides it)
  // Published Google-Sheet CSV link (File → Share → Publish to web → CSV).
  // Columns: "Bisher gesammelt", "Ziel", "Jahr", "Stand", …  — one row per year; a header row is fine.
  // German number format ("2.285,06") is fine. The row whose "Jahr" equals `year` above drives the bar.
  // Leave '' to use the fixed numbers above.
  sheetUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRkXKBVSF_b8GISfrET7J01Ym7i6kJfBZ5tLXfBLxI-r6RtFb1kau-XTmwH0hyoEpZ7AzwV1zZP82CH/pub?output=csv',
};

export const BETTERPLACE =
  'https://www.betterplace.org/de/projects/165916-schulstipendien-fuer-maedchen-in-uganda-bildung-ist-ihre-zukunft';
export const BETTERPLACE_SHORT = 'https://www.betterplace.org/de/projects/165916';
export const PAYPAL_DONATE =
  'https://www.paypal.com/donate/?hosted_button_id=R94VT44NWJ7QY'; // one-time
export const PAYPAL_SUBSCRIBE = ''; // paste the PayPal *subscription* button link here once created

// Photo credit + AI-modification disclosure. Used as the figcaption under every
// sensitive photo that was AI-modified for privacy (faces are synthetic stand-ins).
// Unmodified images (e.g. the hands close-up, Pater Frido) keep the plain credit.
export const CREDIT_AI_DE =
  'Foto: JRS Uganda · Sensible Bilder mit KI modifiziert – abgebildete Personen sind nicht real.';
export const CREDIT_AI_EN =
  'Foto: JRS Uganda · Sensitive images modified with AI – the people shown are not real.';
