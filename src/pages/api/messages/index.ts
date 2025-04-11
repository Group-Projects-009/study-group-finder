import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '@/lib/mongodb';
import Message from '@/models/Message';
import StudyGroup from '@/models/StudyGroup';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Connect to database
  await dbConnect();
  
  // Only allow GET method
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  const { groupId } = req.query;
  
  // Verify groupId is provided
  if (!groupId) {
    return res.status(400).json({ message: 'Study group ID is required' });
  }
  
  try {
    // Verify the study group exists
    const studyGroup = await StudyGroup.findById(groupId);
    
    if (!studyGroup) {
      return res.status(404).json({ message: 'Study group not found' });
    }
    
    // Fetch messages for the study group
    const messages = await Message.find({ studyGroup: groupId })
      .populate('sender', 'name image')
      .sort({ createdAt: 1 })
      .select('content sender studyGroup createdAt fileUrl fileType');
    
    // Log some debug information
    console.log(`Retrieved ${messages.length} messages for group ${groupId}`);
    
    return res.status(200).json(messages);
  } catch (error) {
    console.error(`Error in GET /api/messages:`, error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 