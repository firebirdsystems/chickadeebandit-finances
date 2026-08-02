-- Automation support for the `record_transaction` action.
--
-- `source_event_id` records which app event produced the row. The dispatcher's
-- dedupe guard matches on it (SELECT 1 FROM ... WHERE source_event_id = ?
-- LIMIT 1), so a redelivered event does not book the same expense twice --
-- which matters more here than in most apps, since a duplicate row silently
-- overstates spending against a budget.
--
-- Nullable on purpose: transactions entered by a person have no source event,
-- and the guard only ever looks for a specific non-null id.
ALTER TABLE app_finances__transactions ADD COLUMN source_event_id TEXT;

CREATE INDEX IF NOT EXISTS app_finances__transactions_source_event_idx
  ON app_finances__transactions (source_event_id);
