import mongoose, { Schema } from 'mongoose';

const chapterSchema = new Schema({
  novelId: {
    type: Schema.Types.ObjectId,
    ref: 'Novel',
    required: true,
  },
  chapterNumber: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  views: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to ensure chapter numbers are unique per novel
chapterSchema.index({ novelId: 1, chapterNumber: 1 }, { unique: true });

export default mongoose.models.Chapter || mongoose.model('Chapter', chapterSchema); 