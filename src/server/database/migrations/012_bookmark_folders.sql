-- ============================================================
-- Migration 012: Bookmark Folders
-- ============================================================

ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS folder_name TEXT DEFAULT 'Mặc định';
