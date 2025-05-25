import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { Post, IPost } from '../models/Post';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { _id: string };
    const user = await User.findOne({ _id: decoded._id });

    if (!user) {
      throw new Error();
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate.' });
  }
};

export const checkRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Please authenticate.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    next();
  };
};

export const checkPostOwnership = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const post = await Post.findById(req.params.id).exec();
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    const postDoc = post as IPost;
    if (req.user?.role !== 'admin' && postDoc.author.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
}; 