import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** @param {...import('clsx').ClassValue} inputs */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;
}

export function money(amount, currency = 'INR') {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(
      amount,
    );
  } catch {
    return `${currency} ${Math.round(amount)}`;
  }
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 5) return 'Still among the stars';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function tripStatus(start, end, now = new Date()) {
  const s = new Date(start);
  const e = new Date(end);
  if (now < s) return 'upcoming';
  if (now > e) return 'past';
  return 'ongoing';
}

export function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48);
}
