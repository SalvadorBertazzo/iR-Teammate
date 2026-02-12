-- Migration: add contact_hint to user_iracings table
-- SQLite dialect

ALTER TABLE user_iracings ADD COLUMN contact_hint TEXT;
