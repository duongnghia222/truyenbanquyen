-- Create genres table
CREATE TABLE IF NOT EXISTS genres (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create novels table
CREATE TABLE IF NOT EXISTS novels (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  author VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  cover_image VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'completed', 'hiatus')),
  uploaded_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating DECIMAL(3,2) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  views INTEGER NOT NULL DEFAULT 0,
  chapter_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create novel_genres junction table
CREATE TABLE IF NOT EXISTS novel_genres (
  novel_id INTEGER NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
  genre_id INTEGER NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
  PRIMARY KEY (novel_id, genre_id)
);

-- Create bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  novel_id INTEGER NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, novel_id)
);

-- Create reading_history table
CREATE TABLE IF NOT EXISTS reading_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  novel_id INTEGER NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
  last_chapter_id INTEGER,
  last_read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, novel_id)
);

-- Create indexes
CREATE INDEX idx_novels_slug ON novels(slug);
CREATE INDEX idx_novels_uploaded_by ON novels(uploaded_by);
CREATE INDEX idx_novels_rating ON novels(rating);
CREATE INDEX idx_novels_views ON novels(views);
CREATE INDEX idx_novels_created_at ON novels(created_at);
CREATE INDEX idx_novels_updated_at ON novels(updated_at);
CREATE INDEX idx_reading_history_user_novel ON reading_history(user_id, novel_id);
CREATE INDEX idx_reading_history_last_read ON reading_history(last_read_at);
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_novel_id ON bookmarks(novel_id);

-- Add table comments
COMMENT ON TABLE novels IS 'Stores novel information';
COMMENT ON COLUMN novels.id IS 'Unique identifier for the novel';
COMMENT ON COLUMN novels.title IS 'Title of the novel';
COMMENT ON COLUMN novels.slug IS 'URL-friendly version of the title';
COMMENT ON COLUMN novels.author IS 'Original author of the novel';
COMMENT ON COLUMN novels.description IS 'Novel description/synopsis';
COMMENT ON COLUMN novels.cover_image IS 'URL to the novel cover image';
COMMENT ON COLUMN novels.status IS 'Publication status (ongoing, completed, hiatus)';
COMMENT ON COLUMN novels.uploaded_by IS 'User ID who uploaded the novel';
COMMENT ON COLUMN novels.rating IS 'Average rating from user reviews (0-5)';
COMMENT ON COLUMN novels.views IS 'Total view count for the novel';
COMMENT ON COLUMN novels.chapter_count IS 'Number of chapters in the novel';

COMMENT ON TABLE genres IS 'Stores genre categories';
COMMENT ON TABLE novel_genres IS 'Junction table connecting novels to their genres';
COMMENT ON TABLE bookmarks IS 'Stores user bookmarks of novels';
COMMENT ON TABLE reading_history IS 'Tracks user reading history and progress'; 