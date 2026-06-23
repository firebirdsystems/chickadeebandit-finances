CREATE TABLE IF NOT EXISTS app_finances__budgets (
  id          TEXT    NOT NULL CHECK (length(id) BETWEEN 1 AND 128),
  -- name is encrypted before D1 sees it; 1200 allows 200 Unicode characters
  -- plus the v1 AES-GCM envelope while still bounding raw storage.
  name        TEXT    NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 1200),
  limit_cents INTEGER NOT NULL CHECK (
    typeof(limit_cents) = 'integer'
    AND limit_cents BETWEEN 0 AND 1000000000000
  ),
  period      TEXT    NOT NULL DEFAULT 'monthly'
              CHECK (period IN ('monthly', 'weekly')),
  color       TEXT    NOT NULL DEFAULT '#6366f1'
              CHECK (color IN (
                '#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444',
                '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#64748b'
              )),
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS app_finances__transactions (
  id          TEXT    NOT NULL CHECK (length(id) BETWEEN 1 AND 128),
  budget_id   TEXT,
  amount_cents INTEGER NOT NULL CHECK (
    typeof(amount_cents) = 'integer'
    AND amount_cents BETWEEN 1 AND 1000000000000
  ),
  -- description is also encrypted; 2800 bounds a 500-character Unicode value
  -- after base64 expansion and encryption metadata.
  description TEXT    NOT NULL CHECK (length(trim(description)) BETWEEN 1 AND 2800),
  date        TEXT    NOT NULL CHECK (
    length(date) = 10
    AND date = strftime('%Y-%m-%d', date)
  ),
  PRIMARY KEY (id),
  FOREIGN KEY (budget_id) REFERENCES app_finances__budgets(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS app_finances__transactions_date_idx
  ON app_finances__transactions (date DESC, id DESC);

CREATE INDEX IF NOT EXISTS app_finances__transactions_budget_date_idx
  ON app_finances__transactions (budget_id, date DESC, id DESC);
