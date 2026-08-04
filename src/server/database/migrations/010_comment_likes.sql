-- ============================================================
-- Migration 010: Comment Likes
-- ============================================================

CREATE TABLE IF NOT EXISTS comment_likes (
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment_id  UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, comment_id)
);
