import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    // Connect to database
    await dbConnect();
    
    const { name, email, password } = req.body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      subjects: [],
      availability: [],
    });
    
    // Return user without password
    const userWithoutPassword = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      subjects: user.subjects,
      availability: user.availability,
      createdAt: user.createdAt,
    };
    
    return res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Error in /api/auth/signup:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 