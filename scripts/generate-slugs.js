/**
 * This script generates slugs for all existing novels in the database
 * Run this script once after adding the slug field to the Novel model
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Define the Novel schema
const novelSchema = new mongoose.Schema({
  title: String,
  slug: String,
  author: String,
  description: String,
  coverImage: String,
  genres: [String],
  status: String,
  uploadedBy: mongoose.Schema.Types.ObjectId,
  rating: Number,
  views: Number,
  chapterCount: Number,
  createdAt: Date,
  updatedAt: Date,
});

// Generate slug function
function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
}

// Main function to update novels
const updateNovels = async () => {
  try {
    await connectDB();
    
    // Get the Novel model
    const Novel = mongoose.model('Novel', novelSchema);
    
    // Get all novels without slugs
    const novels = await Novel.find({ slug: { $exists: false } });
    
    console.log(`Found ${novels.length} novels without slugs`);
    
    // Update each novel with a slug
    for (const novel of novels) {
      const baseSlug = generateSlug(novel.title);
      
      // Check if slug already exists
      const existingNovel = await Novel.findOne({ slug: baseSlug });
      
      if (existingNovel && existingNovel._id.toString() !== novel._id.toString()) {
        // If slug exists, append a random string to make it unique
        const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 8)}`;
        console.log(`Slug "${baseSlug}" already exists, using "${uniqueSlug}" for novel "${novel.title}"`);
        novel.slug = uniqueSlug;
      } else {
        novel.slug = baseSlug;
      }
      
      // Save the novel
      await novel.save();
      console.log(`Updated novel "${novel.title}" with slug "${novel.slug}"`);
    }
    
    console.log('All novels updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating novels:', error);
    process.exit(1);
  }
};

// Run the script
updateNovels(); 