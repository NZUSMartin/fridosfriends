/**
 * Central, board-editable configuration.
 * Edit these values (and re-deploy) to update the site — or, for the funding
 * figure, set FUNDING.sheetUrl to a published Google-Sheet CSV link and the
 * thermometer updates live on every visit with NO rebuild needed.
 */
export const FUNDING = {
  raised: 25450,        // EUR raised so far (fallback if no live sheet)
  goal: 30000,          // EUR target for the year
  year: 2026,
  asof: 'Juni 2026',    // "as of" stamp (fallback)
  // Published Google-Sheet CSV link (File → Share → Publish to web → CSV).
  // First data row must be: raised,goal,year,asof   e.g.  25450,30000,2026,Juli 2026
  // Leave '' to use the fixed numbers above.
  sheetUrl: '',
};

export const BETTERPLACE =
  'https://www.betterplace.org/de/projects/165916-schulstipendien-fuer-maedchen-in-uganda-bildung-ist-ihre-zukunft';
export const BETTERPLACE_SHORT = 'https://www.betterplace.org/de/projects/165916';
export const PAYPAL_DONATE =
  'https://www.paypal.com/donate/?hosted_button_id=R94VT44NWJ7QY'; // one-time
export const PAYPAL_SUBSCRIBE = ''; // paste the PayPal *subscription* button link here once created
