CREATE TABLE IF NOT EXISTS slips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  address TEXT,
  bid INTEGER,
  tid INTEGER,
  sid INTEGER,
  bsh TEXT,
  amt VARCHAR(30),
  type INTEGER,
  lc INTEGER,
  spent INTEGER,
  shash TEXT
);
