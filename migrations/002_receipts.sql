-- Forwarded receipts (email-in "+receipts" routing target).
--
-- When a household forwards a receipt to their inbound address with a +receipts
-- tag, the hub stores the attachment under the finances app and inserts a row
-- here. The finances "Receipts" tab lists them with a download link. filename
-- and note are encrypted at rest by the hub codec; file_id / *_id / *_at columns
-- stay plaintext (opaque tokens / timestamps).

CREATE TABLE IF NOT EXISTS app_finances__receipts (
  id                TEXT NOT NULL CHECK (length(id) BETWEEN 1 AND 128),
  file_id           TEXT NOT NULL,
  filename          TEXT NOT NULL,
  note              TEXT NOT NULL DEFAULT '',
  source_message_id TEXT,
  received_at       TEXT NOT NULL,
  PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS app_finances__receipts_received_idx
  ON app_finances__receipts (received_at DESC, id DESC);
