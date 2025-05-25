import { Request, Response } from 'express';
import { Post } from '../models/Post';
import { AuthRequest } from '../middleware/auth';

export const getPosts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const status = req.query.status as string;

    const query: any = {};
    
    // Add status filter if provided
    if (status) {
      if (!['draft', 'published'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status. Must be either "draft" or "published"' });
      }
      query.status = status;
    }

    // Add search filter if provided
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const posts = await Post.find(query)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getMyPosts = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const query: any = { author: req.user?._id };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const posts = await Post.find(query)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, tags, status } = req.body;

    // Validate status if provided
    if (status && !['draft', 'published'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be either "draft" or "published"' });
    }

    const post = new Post({
      title,
      content,
      author: req.user?._id,
      tags: tags || [],
      status: status || 'draft',
      publishedAt: status === 'published' ? new Date() : undefined
    });

    await post.save();

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updatePost = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, tags } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    post.title = title || post.title;
    post.content = content || post.content;
    post.tags = tags || post.tags;

    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deletePost = async (req: AuthRequest, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    await post.deleteOne();

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updatePostStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (!['draft', 'published'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    post.status = status;
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const publishPost = async (req: AuthRequest, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    post.status = 'published';
    post.publishedAt = new Date();
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const unpublishPost = async (req: AuthRequest, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    post.status = 'draft';
    post.publishedAt = undefined;
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getPost = async (req: Request, res: Response) => {
  try {
    console.log(req.params.id);
    const post = await Post.findById(req.params.id).populate('author', 'name email');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}; 