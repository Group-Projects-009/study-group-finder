import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import dbConnect from '@/lib/mongodb';
import StudyGroup from '@/models/StudyGroup';
import User from '@/models/User';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  // Require authentication in production
  // For demonstration, we'll allow it in development
  const session = await getServerSession(req, res, authOptions);
  
  if (process.env.NODE_ENV === 'production' && !session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  try {
    // Connect to database
    await dbConnect();
    
    // Get all study groups
    const studyGroups = await StudyGroup.find({});
    
    // Create a map of users and their groups
    const userCreatedGroups: Record<string, string[]> = {};
    const userJoinedGroups: Record<string, string[]> = {};
    
    // Process all study groups
    for (const group of studyGroups) {
      const creatorId = group.creator.toString();
      
      // Add to created groups
      if (!userCreatedGroups[creatorId]) {
        userCreatedGroups[creatorId] = [];
      }
      userCreatedGroups[creatorId].push(group._id.toString());
      
      // Add all members to joined groups
      for (const memberId of group.members) {
        const memberIdStr = memberId.toString();
        if (!userJoinedGroups[memberIdStr]) {
          userJoinedGroups[memberIdStr] = [];
        }
        userJoinedGroups[memberIdStr].push(group._id.toString());
      }
    }
    
    // Update all users
    const updatePromises = [];
    
    // Get all unique user IDs from both maps
    const createdGroupUserIds = Object.keys(userCreatedGroups);
    const joinedGroupUserIds = Object.keys(userJoinedGroups);
    const allUserIds: string[] = [];
    
    // Add all IDs from created groups
    for (const id of createdGroupUserIds) {
      if (!allUserIds.includes(id)) {
        allUserIds.push(id);
      }
    }
    
    // Add all IDs from joined groups
    for (const id of joinedGroupUserIds) {
      if (!allUserIds.includes(id)) {
        allUserIds.push(id);
      }
    }
    
    for (const userId of allUserIds) {
      updatePromises.push(
        User.findByIdAndUpdate(userId, {
          createdGroups: userCreatedGroups[userId] || [],
          joinedGroups: userJoinedGroups[userId] || []
        })
      );
    }
    
    await Promise.all(updatePromises);
    
    return res.status(200).json({ 
      message: `Migration completed. Updated ${updatePromises.length} users.`,
      userCount: updatePromises.length
    });
  } catch (error) {
    console.error('Error in migrate-user-groups:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 