import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  image: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  readingHistory: [{
    novel: {
      type: Schema.Types.ObjectId,
      ref: 'Novel',
    },
    lastChapter: {
      type: Schema.Types.ObjectId,
      ref: 'Chapter',
    },
    lastReadAt: {
      type: Date,
      default: Date.now,
    },
  }],
  bookmarks: [{
    type: Schema.Types.ObjectId,
    ref: 'Novel',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.User || mongoose.model('User', userSchema); 