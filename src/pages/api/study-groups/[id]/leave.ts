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
    let user;
    
    // Special handling for numeric IDs (demo data)
    if (/^\d+$/.test(id as string)) {
      // For demo, return success immediately
      return res.status(200).json({ 
        message: 'Successfully left the group', 
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
    
    // Ensure we have a valid user document
    if (mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId);
    }
    
    if (!user && session.user.email) {
      user = await User.findOne({ email: session.user.email });
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user is a member of the group
    const isMember = studyGroup.members.some(
      (memberId: mongoose.Types.ObjectId) => memberId.toString() === user._id.toString()
    );
    
    if (!isMember) {
      return res.status(400).json({ message: 'You are not a member of this group' });
    }
    
    // Check if user is the creator of the study group
    if (studyGroup.creator.toString() === user._id.toString()) {
      return res.status(400).json({ 
        message: 'As the creator, you cannot leave the group. Please delete the group instead or transfer ownership.'
      });
    }
    
    // Remove user from group members
    const updatedGroup = await StudyGroup.findByIdAndUpdate(
      id,
      { $pull: { members: user._id } },
      { new: true }
    )
      .populate('creator', 'name image')
      .populate('members', 'name image');
    
    // Remove group from user's joinedGroups
    await User.findByIdAndUpdate(
      user._id,
      { $pull: { joinedGroups: id } }
    );
    
    // Create notification for group creator
    try {
      await Notification.create({
        userId: studyGroup.creator,
        type: 'group_leave',
        title: 'Member left your study group',
        message: `${session.user.name} has left your study group "${studyGroup.name}"`,
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
    
    return res.status(200).json({
      message: 'Successfully left the group',
      group: updatedGroup
    });
  } catch (error) {
    console.error(`Error in POST /api/study-groups/${id}/leave:`, error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 