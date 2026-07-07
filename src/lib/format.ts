import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { enIN } from 'date-fns/locale';

/**
 * Locale-aware formatting (HLD §3/§8). Salary/numbers are kept in Western
 * numerals for clarity; currency is the Indian Rupee (₹).
 */

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('en-IN');

/** Format a salary/amount as ₹25,000. */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return '—';
  return currencyFormatter.format(amount);
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return numberFormatter.format(value);
}

/** Format a monthly salary range as "₹15,000 – ₹20,000" (single value if equal/one-sided). */
export function formatSalaryRange(
  min: number | null | undefined,
  max: number | null | undefined,
): string {
  const hasMin = min !== null && min !== undefined && !Number.isNaN(min);
  const hasMax = max !== null && max !== undefined && !Number.isNaN(max);
  if (hasMin && hasMax) {
    return min === max ? formatCurrency(min) : `${formatCurrency(min)} – ${formatCurrency(max)}`;
  }
  if (hasMin) return formatCurrency(min);
  if (hasMax) return formatCurrency(max);
  return '—';
}

/** "Posted 3 days ago" style relative time. */
export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true, locale: enIN });
  } catch {
    return '—';
  }
}

/** "12 Jun 2026" style absolute date. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return format(parseISO(iso), 'd MMM yyyy', { locale: enIN });
  } catch {
    return '—';
  }
}

/** Months → "2 yr 3 mo" experience label. */
export function formatExperience(months: number | null | undefined): string {
  if (!months || months <= 0) return 'Fresher';
  const years = Math.floor(months / 12);
  const rem = months % 12;
  const parts: string[] = [];
  if (years) parts.push(`${years} yr`);
  if (rem) parts.push(`${rem} mo`);
  return parts.join(' ');
}
