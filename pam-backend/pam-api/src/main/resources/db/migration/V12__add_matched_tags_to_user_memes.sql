ALTER TABLE user_memes ADD COLUMN matched_tags JSONB NOT NULL DEFAULT '[]';
