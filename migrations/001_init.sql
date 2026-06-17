CREATE TABLE IF NOT EXISTS app_finances__budgets (
  id          TEXT    NOT NULL,
  name        TEXT    NOT NULL,
  limit_cents INTEGER NOT NULL,
  period      TEXT    NOT NULL DEFAULT 'monthly',
  color       TEXT,
  created_by  TEXT    NOT NULL,
  created_at  TEXT    NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS app_finances__transactions (
  id          TEXT    NOT NULL,
  budget_id   TEXT,
  amount_cents INTEGER NOT NULL,
  description TEXT    NOT NULL,
  date        TEXT    NOT NULL,
  member_id   TEXT,
  created_at  TEXT    NOT NULL,
  PRIMARY KEY (id)
);
