/** Mock FX rates relative to INR. */
export const RATES = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  JPY: 1.8,
  GBP: 0.0094,
};

/**
 * @param {number} amountInr
 * @param {string} currency
 */
export function convert(amountInr, currency = 'INR') {
  const rate = RATES[currency] ?? 1;
  return amountInr * rate;
}
