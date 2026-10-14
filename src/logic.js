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

/**
 * "Retry after a lost response" (app-template guide): whether a failed
 * write's answer leaves its outcome unknown — no status, a 400, or a 5xx
 * other than 507 — so the page reads the row back by its pinned id. A
 * `UNIQUE_CONSTRAINT` answer is a 400 too: the usual retry of a create that
 * landed collides on its own pinned id. Only finding the row under that id
 * says it landed; not found keeps the usual failure line.
 */
export function outcomeUnknown(e) {
  if (e?.code === "UNIQUE_CONSTRAINT" || /UNIQUE constraint failed/i.test(String(e?.message ?? ""))) return true;
  const status = Number(e?.status) || 0;
  return status === 0 || status === 400 || (status >= 500 && status !== 507);
}

/**
 * Whether a stored row differs from what the form holds now, over the form's
 * own fields only, compared as text with a missing value as empty.
 */
export function storedDiffers(row, fields) {
  return Object.keys(fields).some((k) => String(row?.[k] ?? "") !== String(fields[k] ?? ""));
}

export const SAVED_AS_FIRST = "Saved as first entered — check it and update what changed.";

/**
 * The line a failed write shows ("Refused, gone, or failed" in the app-template
 * guide): "try again" only when retrying can work. `action` and `thing` are the
 * app's own words. `found` is the caller's re-read after a write that changed
 * nothing: false = the row is gone, true = it is still there, null = the
 * re-read failed. A row still there after a plain `WHERE id = ?` write means
 * the row policy refused it; only a `guarded` write (one with a state
 * condition) can have been "changed by someone else". Decided from the error's
 * `status` / `code`, never from the hub's or the browser's text.
 */
export function failureLine(e, { action, thing, found, guarded = false } = {}) {
  if (e?.forUser) return e.message;
  if (e?.code === "UNIQUE_CONSTRAINT" || /UNIQUE constraint failed/i.test(String(e?.message ?? ""))) return `That ${thing} already exists.`;
  if (e?.status === 403 || (found === true && !guarded)) return `You don’t have permission to ${action}.`;
  if (e?.status === 507) return "The household’s storage is full — free up space first.";
  if (e?.status === 429) return "Too many tries — wait a minute and try again.";
  if (found === null) return `Couldn’t ${action} — try again.`;
  if (found === false || (found === undefined && e?.status === 404)) return `This ${thing} has been removed.`;
  if (found === true || e?.status === 409) return `This ${thing} was changed by someone else — check it first.`;
  return `Couldn’t ${action} — try again.`;
}
