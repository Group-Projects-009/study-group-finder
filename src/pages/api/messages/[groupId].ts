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
  const { groupId } = req.query;
  
  // Connect to database
  await dbConnect();
  
  // GET method - fetch messages for a study group
  if (req.method === 'GET') {
    try {
      // Verify the study group exists
      const studyGroup = await StudyGroup.findById(groupId);
      
      if (!studyGroup) {
        return res.status(404).json({ message: 'Study group not found' });
      }
      
      // Fetch messages for the study group
      const messages = await Message.find({ studyGroup: groupId })
        .populate('sender', 'name image')
        .sort({ createdAt: 1 });
      
      return res.status(200).json(messages);
    } catch (error) {
      console.error(`Error in GET /api/messages/${groupId}:`, error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  // POST method - create a new message
  if (req.method === 'POST') {
    const session = await getServerSession(req, res, authOptions);
    
    // Check if user is logged in
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    try {
      const { content } = req.body;
      
      // Validate required fields
      if (!content) {
        return res.status(400).json({ message: 'Message content is required' });
      }
      
      // Verify the study group exists
      const studyGroup = await StudyGroup.findById(groupId);
      
      if (!studyGroup) {
        return res.status(404).json({ message: 'Study group not found' });
      }
      
      // Check if user is a member of the group
      if (!studyGroup.members.includes(session.user.id)) {
        return res.status(403).json({ message: 'Forbidden - you must be a member to send messages' });
      }
      
      // Create new message
      const message = await Message.create({
        studyGroup: groupId,
        sender: session.user.id,
        content,
      });
      
      // Populate sender info for response
      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'name image');
      
      return res.status(201).json(populatedMessage);
    } catch (error) {
      console.error(`Error in POST /api/messages/${groupId}:`, error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  // Method not allowed
  return res.status(405).json({ message: 'Method not allowed' });
} 