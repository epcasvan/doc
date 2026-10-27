CREATE TABLE IF NOT EXISTS fiches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  domains TEXT NOT NULL,
  recipe TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS fiches_updated_at ON fiches (updated_at DESC);
