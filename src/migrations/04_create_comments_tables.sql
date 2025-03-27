-- Create chapter comments table
CREATE TABLE IF NOT EXISTS chapter_comments (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL CHECK (length(content) <= 1000),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  novel_id INTEGER NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
  chapter_id INTEGER NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  parent_id INTEGER REFERENCES chapter_comments(id) ON DELETE CASCADE,
  is_edited BOOLEAN NOT NULL DEFAULT FALSE,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create likes table for chapter comments
CREATE TABLE IF NOT EXISTS chapter_comment_likes (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment_id INTEGER NOT NULL REFERENCES chapter_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, comment_id)
);

-- Create indexes for efficient querying
CREATE INDEX idx_chapter_comments_novel_id ON chapter_comments(novel_id);
CREATE INDEX idx_chapter_comments_chapter_id ON chapter_comments(chapter_id);
CREATE INDEX idx_chapter_comments_user_id ON chapter_comments(user_id);
CREATE INDEX idx_chapter_comments_parent_id ON chapter_comments(parent_id);
CREATE INDEX idx_chapter_comments_created_at ON chapter_comments(created_at);

CREATE INDEX idx_chapter_comment_likes_comment_id ON chapter_comment_likes(comment_id);

-- Add table comments
COMMENT ON TABLE chapter_comments IS 'Stores comments on individual chapters that can be viewed at both novel and chapter level';
COMMENT ON COLUMN chapter_comments.content IS 'Text content of the comment';
COMMENT ON COLUMN chapter_comments.novel_id IS 'Reference to the novel this comment belongs to';
COMMENT ON COLUMN chapter_comments.chapter_id IS 'Reference to the chapter this comment belongs to';
COMMENT ON COLUMN chapter_comments.chapter_number IS 'Chapter number for easier reference';
COMMENT ON COLUMN chapter_comments.parent_id IS 'Reference to parent comment (for replies)';
COMMENT ON COLUMN chapter_comments.is_edited IS 'Indicates if the comment has been edited';
COMMENT ON COLUMN chapter_comments.is_deleted IS 'Soft delete flag';

COMMENT ON TABLE chapter_comment_likes IS 'Junction table for chapter comment likes'; 