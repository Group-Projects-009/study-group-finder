import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import dbConnect from '@/lib/mongodb';
import StudyGroup from '@/models/StudyGroup';
import User from '@/models/User';
import Notification from '@/models/Notification';
import mongoose from 'mongoose';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  const session = await getServerSession(req, res, authOptions);
  
  // Check if user is logged in
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  try {
    // Connect to database
    await dbConnect();
    
    let studyGroup;
    let userId = session.user.id;
    let newNotification;
    
    // Special handling for numeric IDs (demo data)
    if (/^\d+$/.test(id as string)) {
      // For demo, return success immediately
      return res.status(200).json({ 
        message: 'Successfully joined the group', 
        success: true 
      });
    }
    
    // Check if ID is valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({ message: 'Invalid group ID' });
    }
    
    // Find the study group
    studyGroup = await StudyGroup.findById(id);
    
    if (!studyGroup) {
      return res.status(404).json({ message: 'Study group not found' });
    }
    
    // Check if user is already a member
    if (studyGroup.members.some(memberId => 
      memberId.toString() === userId
    )) {
      return res.status(400).json({ message: 'You are already a member of this group' });
    }
    
    // Check if group has reached maximum capacity
    if (studyGroup.maxMembers && studyGroup.members.length >= studyGroup.maxMembers) {
      return res.status(400).json({ message: 'This group has reached its maximum capacity' });
    }
    
    // Ensure we have a valid user ID
    let user;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId);
    }
    
    if (!user && session.user.email) {
      user = await User.findOne({ email: session.user.email });
    }
    
    if (!user) {
      // Create new user if needed
      try {
        user = new User({
          name: session.user.name || 'User',
          email: session.user.email,
          image: session.user.image,
          createdGroups: [],
          joinedGroups: []
        });
        
        await user.save();
        userId = user._id.toString();
      } catch (err) {
        console.error("Error creating new user:", err);
        return res.status(500).json({ message: 'Failed to create user profile' });
      }
    }
    
    // Add user to group members
    const updatedGroup = await StudyGroup.findByIdAndUpdate(
      id,
      { $addToSet: { members: user._id } },
      { new: true }
    )
      .populate('creator', 'name image')
      .populate('members', 'name image');
    
    // Add group to user's joinedGroups
    await User.findByIdAndUpdate(
      user._id,
      { $addToSet: { joinedGroups: id } }
    );
    
    // Create notification for group creator
    if (studyGroup.creator.toString() !== user._id.toString()) {
      try {
        newNotification = await Notification.create({
          userId: studyGroup.creator,
          type: 'group_join',
          title: 'New member in your study group',
          message: `${session.user.name} has joined your study group "${studyGroup.name}"`,
          read: false,
          data: {
            groupId: studyGroup._id,
            senderId: user._id
          }
        });
      } catch (err) {
        console.error("Error creating notification:", err);
        // Continue even if notification fails
      }
    }
    
    return res.status(200).json({
      message: 'Successfully joined the group',
      group: updatedGroup
    });
  } catch (error) {
    console.error(`Error in POST /api/study-groups/${id}/join:`, error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 