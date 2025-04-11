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
  
  // PATCH method - update user profile
  if (req.method === 'PATCH') {
    try {
      // Check if user is logged in
      if (!session) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      // Connect to database
      await dbConnect();
      
      const { name, bio, location, education, major, interests, availability, image } = req.body;
      
      // Validate required fields
      if (!name) {
        return res.status(400).json({ message: 'Name is required' });
      }
      
      // Validate user ID
      if (!mongoose.Types.ObjectId.isValid(session.user.id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      // Create update object
      const updateData: any = {
        name,
        bio,
        location,
        education,
        major,
        interests,
        availability,
      };

      // Only include image in update if it's provided
      if (image) {
        updateData.image = image;
      }
      
      // Find and update user
      const updatedUser = await User.findByIdAndUpdate(
        session.user.id,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Error in /api/profile/update:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  // Method not allowed
  return res.status(405).json({ message: 'Method not allowed' });
} 