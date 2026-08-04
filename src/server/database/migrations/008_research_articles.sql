-- ============================================================
-- Migration 008: Research Articles Table
-- ============================================================

CREATE TABLE IF NOT EXISTS research_articles (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  summary      TEXT,
  content      TEXT,
  thumbnail    TEXT,
  author       TEXT,
  category     TEXT,
  "readingTime" INTEGER DEFAULT 5,
  "createdAt"  TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt"  TIMESTAMPTZ DEFAULT NOW()
);

-- Thêm index để hỗ trợ sắp xếp và tìm kiếm
CREATE INDEX IF NOT EXISTS idx_research_category ON research_articles(category);
CREATE INDEX IF NOT EXISTS idx_research_created_at ON research_articles("createdAt" DESC);
