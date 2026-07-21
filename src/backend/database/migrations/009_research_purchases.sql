-- ============================================================
-- Migration 009: Research Articles Price and Purchases
-- ============================================================

-- Add price column to research_articles
ALTER TABLE research_articles ADD COLUMN IF NOT EXISTS price INTEGER DEFAULT 50000;

-- Create user_research_purchases table
CREATE TABLE IF NOT EXISTS user_research_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID REFERENCES users(id) ON DELETE CASCADE,
  "articleId" UUID REFERENCES research_articles(id) ON DELETE CASCADE,
  "purchasedAt" TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE("userId", "articleId")
);
