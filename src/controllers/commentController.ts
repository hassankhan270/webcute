import { Request, Response } from 'express';
import { Comment } from '../models/Comment';
import { Post } from '../models/Post';
import { AuthRequest } from '../middleware/auth';

export const getComments = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Comment.countDocuments({ post: req.params.postId });

    res.json({
      comments,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalComments: total
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const { content } = req.body;
    const postId = req.params.postId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = new Comment({
      content,
      author: req.user?._id,
      post: postId
    });

    await comment.save();

    const populatedComment = await comment.populate('author', 'name email');

    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}; 