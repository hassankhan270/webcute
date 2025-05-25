import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../models/User';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password
    });

    await user.save();

    // Generate tokens
    const tokenOptions: SignOptions = {
      expiresIn: process.env.JWT_EXPIRES_IN
    };

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET!, tokenOptions);
    const refreshToken = jwt.sign({ _id: user._id }, process.env.JWT_REFRESH_SECRET!, tokenOptions);

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token,
      refreshToken
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const tokenOptions: SignOptions = {
      expiresIn: process.env.JWT_EXPIRES_IN
    };

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET!, tokenOptions);
    const refreshToken = jwt.sign({ _id: user._id }, process.env.JWT_REFRESH_SECRET!, tokenOptions);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token,
      refreshToken
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { _id: string };
    const user = await User.findById(decoded._id);

    if (!user) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Generate new tokens
    const tokenOptions: SignOptions = {
      expiresIn: process.env.JWT_EXPIRES_IN
    };

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET!, tokenOptions);
    const newRefreshToken = jwt.sign({ _id: user._id }, process.env.JWT_REFRESH_SECRET!, tokenOptions);

    res.json({
      token,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
}; 