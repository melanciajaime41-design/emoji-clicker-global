CREATE TABLE IF NOT EXISTS leaderboard (
  player_id TEXT PRIMARY KEY NOT NULL,
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_score
ON leaderboard(score DESC, updated_at ASC);
