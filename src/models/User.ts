import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// Interface for User document
interface IUser extends Document {
  name: string;
  username: string;
  email: string;
  password?: string;
  googleId?: string;
  image?: string;
  budget: {
    coins: number;
    transactions: Array<{
      amount: number;
      description: string;
      novelId?: mongoose.Types.ObjectId;
      createdAt: Date;
    }>;
  };
  role: 'user' | 'admin';
  readingHistory: Array<{
    novel: mongoose.Types.ObjectId;
    lastChapter: mongoose.Types.ObjectId;
    lastReadAt: Date;
  }>;
  uploadedNovels: mongoose.Types.ObjectId[];
  bookmarks: mongoose.Types.ObjectId[];
  comments: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters long'],
    // Password is not required for users who sign in with Google
    required: function(this: IUser): boolean {
      return !this.googleId;
    },
    select: false, // Don't return password by default in queries
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true,
  },
  image: {
    type: String,
  },
  budget: {
    coins: {
      type: Number,
      default: 0,
    },
    transactions: [{
      amount: Number,
      description: String,
      novelId: {
        type: Schema.Types.ObjectId,
        ref: 'Novel',
      },
      createdAt: {
        type: Date,
        default: Date.now,
      }
    }]
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
  uploadedNovels: [{
    type: Schema.Types.ObjectId,
    ref: 'Novel',
  }],
  bookmarks: [{
    type: Schema.Types.ObjectId,
    ref: 'Novel',
  }],
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment',
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

// Method to compare password for login
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Pre-save hook to hash password before saving
userSchema.pre('save', async function(this: mongoose.HydratedDocument<IUser>, next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    // Hash the password with the generated salt
    if (this.password) {
      this.password = await bcrypt.hash(this.password, salt);
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Clear existing model if it exists to ensure schema changes are applied
if (mongoose.models.User) {
  delete mongoose.models.User;
}

const User = mongoose.model<IUser>('User', userSchema);
export default User; 