import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '@/lib/mongodb';
import Notification from '@/models/Notification';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const session = await getServerSession(req, res, authOptions);
  
  // Check if user is logged in
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  // Connect to database
  await dbConnect();
  
  // Find the notification
  const notification = await Notification.findById(id);
  
  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }
  
  // Check if the notification belongs to the current user
  if (notification.userId.toString() !== session.user.id) {
    return res.status(403).json({ message: 'Forbidden - this notification does not belong to you' });
  }
  
  // PATCH method - mark a notification as read
  if (req.method === 'PATCH') {
    try {
      const updatedNotification = await Notification.findByIdAndUpdate(
        id,
        { read: true },
        { new: true }
      );
      
      return res.status(200).json(updatedNotification);
    } catch (error) {
      console.error(`Error in PATCH /api/notifications/${id}:`, error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  // DELETE method - delete a notification
  if (req.method === 'DELETE') {
    try {
      await Notification.findByIdAndDelete(id);
      
      return res.status(200).json({ message: 'Notification deleted' });
    } catch (error) {
      console.error(`Error in DELETE /api/notifications/${id}:`, error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  // Method not allowed
  return res.status(405).json({ message: 'Method not allowed' });
} 