import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '@/lib/mongodb';
import StudyGroup from '@/models/StudyGroup';
import User from '@/models/User';
import Message from '@/models/Message';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  
  // Connect to database
  await dbConnect();
  
  // GET method - fetch a specific study group
  if (req.method === 'GET') {
    try {
      const studyGroup = await StudyGroup.findById(id)
        .populate('creator', 'name image')
        .populate('members', 'name image');
      
      if (!studyGroup) {
        return res.status(404).json({ message: 'Study group not found' });
      }
      
      return res.status(200).json(studyGroup);
    } catch (error) {
      console.error(`Error in GET /api/study-groups/${id}:`, error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  // PUT method - update a study group
  if (req.method === 'PUT') {
    const session = await getServerSession(req, res, authOptions);
    
    // Check if user is logged in
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    try {
      // Find the study group
      const studyGroup = await StudyGroup.findById(id);
      
      if (!studyGroup) {
        return res.status(404).json({ message: 'Study group not found' });
      }
      
      // Check if the user is the creator of the study group
      if (studyGroup.creator.toString() !== session.user.id) {
        return res.status(403).json({ message: 'Forbidden - you can only update your own study groups' });
      }
      
      const { title, subject, description, date, time, location, city, maxMembers } = req.body;
      
      // Validate required fields
      if (!title || !subject || !description || !date || !time || !location || !city) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      // Update the study group
      const updatedGroup = await StudyGroup.findByIdAndUpdate(
        id,
        {
          title,
          subject,
          description,
          date,
          time,
          location,
          city,
          maxMembers: maxMembers || 10,
        },
        { new: true, runValidators: true }
      )
        .populate('creator', 'name image')
        .populate('members', 'name image');
      
      return res.status(200).json(updatedGroup);
    } catch (error) {
      console.error(`Error in PUT /api/study-groups/${id}:`, error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  // DELETE method - delete a study group
  if (req.method === 'DELETE') {
    const session = await getServerSession(req, res, authOptions);
    
    // Check if user is logged in
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    try {
      // Find the study group
      const studyGroup = await StudyGroup.findById(id);
      
      if (!studyGroup) {
        return res.status(404).json({ message: 'Study group not found' });
      }
      
      // Check if the user is the creator of the study group
      if (studyGroup.creator.toString() !== session.user.id) {
        return res.status(403).json({ message: 'Forbidden - you can only delete your own study groups' });
      }
      
      // Delete all messages in the study group
      await Message.deleteMany({ studyGroup: id });
      
      // Remove group from all users' createdGroups and joinedGroups arrays
      await User.updateMany(
        { $or: [{ createdGroups: id }, { joinedGroups: id }] },
        { $pull: { createdGroups: id, joinedGroups: id } }
      );
      
      // Delete the study group
      await StudyGroup.findByIdAndDelete(id);
      
      return res.status(200).json({ message: 'Study group deleted successfully' });
    } catch (error) {
      console.error(`Error in DELETE /api/study-groups/${id}:`, error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  // Method not allowed
  return res.status(405).json({ message: 'Method not allowed' });
} 