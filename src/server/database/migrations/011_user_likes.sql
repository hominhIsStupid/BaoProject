-- ============================================================
-- Migration 011: User Likes (for articles)
-- ============================================================

CREATE TABLE IF NOT EXISTS user_likes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  article_id  UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  category    VARCHAR(50),
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, article_id)
);
