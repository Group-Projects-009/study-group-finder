import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import mongoose from 'mongoose';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  
  // Check if user is logged in
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const { id } = req.query;
  
  // Validate user ID
  if (!mongoose.Types.ObjectId.isValid(id as string)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }
  
  // Only allow users to fetch their own profile
  if (session.user.id !== id) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  
  try {
    // Connect to database
    await dbConnect();
    
    // Find user by ID
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.status(200).json(user);
  } catch (error) {
    console.error('Error in /api/user/[id]:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 