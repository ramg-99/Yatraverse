/**
 * Simulated network: 300–700ms delay, occasional failure.
 * @template T
 * @param {T | (() => T)} result
 * @param {{ failRate?: number }} [opts]
 * @returns {Promise<T>}
 */
export function simulate(result, opts = {}) {
  const failRate = 0;
  const ms = 150 + Math.floor(Math.random() * 200);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(typeof result === 'function' ? result() : result);
    }, ms);
  });
}

/** @template T @param {() => Promise<T>} fn @param {number} [times] */
export async function withRetry(fn, times = 1) {
  let last;
  for (let i = 0; i <= times; i += 1) {
    try {
      return await fn();
    } catch (err) {
      last = err;
    }
  }
  throw last;
}
