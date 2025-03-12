-- Create novel comments table
CREATE TABLE IF NOT EXISTS novel_comments (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL CHECK (length(content) <= 1000),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  novel_id INTEGER NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
  parent_id INTEGER REFERENCES novel_comments(id) ON DELETE CASCADE,
  is_edited BOOLEAN NOT NULL DEFAULT FALSE,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create chapter comments table
CREATE TABLE IF NOT EXISTS chapter_comments (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL CHECK (length(content) <= 1000),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  novel_id INTEGER NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
  chapter_id INTEGER NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  parent_id INTEGER REFERENCES chapter_comments(id) ON DELETE CASCADE,
  is_edited BOOLEAN NOT NULL DEFAULT FALSE,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create likes tables for novel comments
CREATE TABLE IF NOT EXISTS novel_comment_likes (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment_id INTEGER NOT NULL REFERENCES novel_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, comment_id)
);

-- Create likes tables for chapter comments
CREATE TABLE IF NOT EXISTS chapter_comment_likes (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment_id INTEGER NOT NULL REFERENCES chapter_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, comment_id)
);

-- Create indexes for efficient querying
CREATE INDEX idx_novel_comments_novel_id ON novel_comments(novel_id);
CREATE INDEX idx_novel_comments_user_id ON novel_comments(user_id);
CREATE INDEX idx_novel_comments_parent_id ON novel_comments(parent_id);
CREATE INDEX idx_novel_comments_created_at ON novel_comments(created_at);

CREATE INDEX idx_chapter_comments_novel_id ON chapter_comments(novel_id);
CREATE INDEX idx_chapter_comments_chapter_id ON chapter_comments(chapter_id);
CREATE INDEX idx_chapter_comments_user_id ON chapter_comments(user_id);
CREATE INDEX idx_chapter_comments_parent_id ON chapter_comments(parent_id);
CREATE INDEX idx_chapter_comments_created_at ON chapter_comments(created_at);

CREATE INDEX idx_novel_comment_likes_comment_id ON novel_comment_likes(comment_id);
CREATE INDEX idx_chapter_comment_likes_comment_id ON chapter_comment_likes(comment_id);

-- Add table comments
COMMENT ON TABLE novel_comments IS 'Stores comments on novels';
COMMENT ON COLUMN novel_comments.content IS 'Text content of the comment';
COMMENT ON COLUMN novel_comments.parent_id IS 'Reference to parent comment (for replies)';
COMMENT ON COLUMN novel_comments.is_edited IS 'Indicates if the comment has been edited';
COMMENT ON COLUMN novel_comments.is_deleted IS 'Soft delete flag';

COMMENT ON TABLE chapter_comments IS 'Stores comments on individual chapters';
COMMENT ON COLUMN chapter_comments.content IS 'Text content of the comment';
COMMENT ON COLUMN chapter_comments.parent_id IS 'Reference to parent comment (for replies)';
COMMENT ON COLUMN chapter_comments.is_edited IS 'Indicates if the comment has been edited';
COMMENT ON COLUMN chapter_comments.is_deleted IS 'Soft delete flag';

COMMENT ON TABLE novel_comment_likes IS 'Junction table for novel comment likes';
COMMENT ON TABLE chapter_comment_likes IS 'Junction table for chapter comment likes'; 