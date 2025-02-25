import mongoose, { Schema, Document } from 'mongoose';

// Interface for Comment document
export interface IComment extends Document {
  content: string;
  user: mongoose.Types.ObjectId;
  novel: mongoose.Types.ObjectId;
  parent?: mongoose.Types.ObjectId;
  likes: mongoose.Types.ObjectId[];
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: [1000, 'Comment must be less than 1000 characters']
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  novel: {
    type: Schema.Types.ObjectId,
    ref: 'Novel',
    required: true,
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  isEdited: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
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

// Create virtual field to get replies to this comment
commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parent',
});

// Add index to improve performance for common queries
commentSchema.index({ novel: 1, createdAt: -1 });
commentSchema.index({ user: 1, createdAt: -1 });
commentSchema.index({ parent: 1 });

const Comment = mongoose.models.Comment || mongoose.model<IComment>('Comment', commentSchema);
export default Comment; 