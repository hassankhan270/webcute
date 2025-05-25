import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface IPost extends Document {
  title: string;
  content: string;
  author: IUser['_id'];
  status: 'draft' | 'published';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

const postSchema = new Schema<IPost>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  publishedAt: {
    type: Date
  }
});

// Update the updatedAt timestamp before saving
postSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Post = mongoose.model<IPost>('Post', postSchema); 