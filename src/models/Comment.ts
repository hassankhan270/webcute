import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';
import { IPost } from './Post';

export interface IComment extends Document {
  content: string;
  author: IUser['_id'];
  post: IPost['_id'];
  createdAt: Date;
}

const commentSchema = new Schema<IComment>({
  content: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Comment = mongoose.model<IComment>('Comment', commentSchema); 