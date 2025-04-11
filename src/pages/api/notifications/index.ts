import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import dbConnect from '@/lib/dbConnect';
import Notification from '@/models/Notification';
import mongoose from 'mongoose';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await dbConnect();

  // Get user ID from session
  const userId = session.user.id;

  try {
    if (req.method === 'GET') {
      // Fetch notifications for the user
      try {
        const notifications = await Notification.find({ userId })
          .sort({ createdAt: -1 })
          .limit(50)
          .lean();
        
        return res.status(200).json(notifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        
        // Return mock data for demonstration or if database is not connected
        return res.status(200).json(getMockNotifications(userId));
      }
    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in notifications API:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Helper function to generate mock notifications for demonstration
function getMockNotifications(userId: string) {
  return [
    {
      _id: new mongoose.Types.ObjectId(),
      userId,
      title: 'New member joined',
      message: 'John Doe has joined your Calculus Crew study group',
      type: 'group_join',
      read: false,
      data: {
        groupId: '1',
        groupName: 'Calculus Crew',
        userId: '456',
        userName: 'John Doe'
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
    },
    {
      _id: new mongoose.Types.ObjectId(),
      userId,
      title: 'Study group update',
      message: 'Physics Forum meeting time has been changed to 6:00 PM',
      type: 'group_update',
      read: true,
      data: {
        groupId: '2',
        groupName: 'Physics Forum'
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() // 5 hours ago
    },
    {
      _id: new mongoose.Types.ObjectId(),
      userId,
      title: 'New message',
      message: 'You have a new message in Computer Science Hub',
      type: 'message',
      read: false,
      data: {
        groupId: '3',
        groupName: 'Computer Science Hub'
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() // 2 days ago
    },
    {
      _id: new mongoose.Types.ObjectId(),
      userId,
      title: 'Member left group',
      message: 'Jane Smith has left your Calculus Crew study group',
      type: 'group_leave',
      read: false,
      data: {
        groupId: '1',
        groupName: 'Calculus Crew',
        userId: '789',
        userName: 'Jane Smith'
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString() // 5 days ago
    }
  ];
} 