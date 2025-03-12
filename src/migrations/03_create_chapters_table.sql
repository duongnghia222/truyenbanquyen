-- Create chapters table
CREATE TABLE IF NOT EXISTS chapters (
  id SERIAL PRIMARY KEY,
  novel_id INTEGER NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  content_url VARCHAR(255) NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (novel_id, chapter_number)
);

-- Add indexes for efficient queries
CREATE INDEX idx_chapters_novel_id ON chapters(novel_id);
CREATE INDEX idx_chapters_chapter_number ON chapters(chapter_number);
CREATE INDEX idx_chapters_created_at ON chapters(created_at);

-- Add foreign key constraint to reading_history.last_chapter_id
ALTER TABLE reading_history 
ADD CONSTRAINT fk_reading_history_chapter 
FOREIGN KEY (last_chapter_id) 
REFERENCES chapters(id)
ON DELETE SET NULL;

-- Add table comments
COMMENT ON TABLE chapters IS 'Stores chapter information for novels';
COMMENT ON COLUMN chapters.id IS 'Unique identifier for the chapter';
COMMENT ON COLUMN chapters.novel_id IS 'Reference to the novel this chapter belongs to';
COMMENT ON COLUMN chapters.chapter_number IS 'Chapter number (unique within a novel)';
COMMENT ON COLUMN chapters.title IS 'Title of the chapter';
COMMENT ON COLUMN chapters.content_url IS 'URL to the chapter content file';
COMMENT ON COLUMN chapters.views IS 'View count for this chapter'; 