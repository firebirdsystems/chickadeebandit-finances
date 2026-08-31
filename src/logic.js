export const COLORS = Object.freeze([
  '#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#64748b',
]);

export const MAX_CENTS = 1_000_000_000_000;

export function normalizeColor(value) {
  return COLORS.includes(value) ? value : COLORS[0];
}

export function dollarsToCents(value, { allowZero = false } = {}) {
  if (typeof value === 'string' && value.trim() === '') return null;
  const dollars = Number(value);
  if (!Number.isFinite(dollars) || dollars < 0 || (!allowZero && dollars === 0)) {
    return null;
  }
  const cents = Math.round(dollars * 100);
  if (!Number.isSafeInteger(cents) || cents > MAX_CENTS || (!allowZero && cents === 0)) return null;
  return cents;
}

/**
 * Exact for this module only: every Date here is constructed with `Date.UTC`
 * (or handed in anchored at UTC midnight by the caller), so reading it back in
 * UTC is a round trip, not a timezone conversion. Do NOT reach for this on a
 * Date built from local parts.
 */
function utcDateString(date) {
  return date.toISOString().slice(0, 10);
}

export function currentPeriodBounds(period, now = new Date()) {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const day = now.getUTCDate();

  if (period === 'weekly') {
    const today = new Date(Date.UTC(year, month, day));
    const mondayOffset = (today.getUTCDay() + 6) % 7;
    const start = new Date(today);
    start.setUTCDate(today.getUTCDate() - mondayOffset);
    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 7);
    return { start: utcDateString(start), end: utcDateString(end) };
  }

  return {
    start: utcDateString(new Date(Date.UTC(year, month, 1))),
    end: utcDateString(new Date(Date.UTC(year, month + 1, 1))),
  };
}

export function isValidDateString(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

/**
 * Fields the in-app search matches against (see hub-sdk `searchMatch`).
 * The budget a transaction sits under counts as well as its own
 * description, so "groceries" finds the line items filed under that
 * budget as well as the ones described that way.
 */
export function searchableFields(transaction, budgetName = "") {
  return [transaction.description, budgetName];
}
