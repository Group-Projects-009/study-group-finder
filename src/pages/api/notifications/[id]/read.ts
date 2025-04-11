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
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const notificationId = req.query.id as string;
  const userId = session.user.id;

  // Check if valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    // Mock successful response for invalid IDs (demo purposes)
    if (notificationId && !isNaN(parseInt(notificationId))) {
      return res.status(200).json({ message: 'Notification marked as read' });
    }
    return res.status(400).json({ message: 'Invalid notification ID' });
  }

  try {
    await dbConnect();

    // Find notification and ensure it belongs to the current user
    const notification = await Notification.findOne({
      _id: notificationId,
      userId
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // If already read, just return success
    if (notification.read) {
      return res.status(200).json({ message: 'Notification already read' });
    }

    // Mark as read
    notification.read = true;
    await notification.save();

    return res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 