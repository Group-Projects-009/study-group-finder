import { Server } from 'socket.io';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import Message from '@/models/Message';
import Notification from '@/models/Notification';
import StudyGroup from '@/models/StudyGroup';
import dbConnect from '@/lib/mongodb';
import { Document, Types } from 'mongoose';

interface GroupMember extends Document {
  _id: Types.ObjectId;
  name?: string;
  image?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Connect to database
  await dbConnect();
  
  // Check if socket.io server is already running
  if ((res.socket as any).server.io) {
    console.log('Socket.io server already running');
    res.end();
    return;
  }
  
  // Create new socket.io server
  const io = new Server((res.socket as any).server, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });
  
  // Store the io instance on the server object
  (res.socket as any).server.io = io;
  
  // Handle socket connections
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    const { userId, groupId } = socket.handshake.query;
    
    if (userId && groupId) {
      socket.join(`group-${groupId}`);
      console.log(`User ${userId} joined group ${groupId}`);
    }
    
    // Handle joining a specific group chat
    socket.on('joinGroup', (data) => {
      if (data.groupId) {
        socket.join(`group-${data.groupId}`);
        console.log(`User ${data.userId || 'Anonymous'} joined group ${data.groupId}`);
      }
    });
    
    // Handle leaving a group chat
    socket.on('leaveGroup', (data) => {
      if (data.groupId) {
        socket.leave(`group-${data.groupId}`);
        console.log(`User ${data.userId || 'Anonymous'} left group ${data.groupId}`);
      }
    });
    
    // Handle sending messages
    socket.on('sendMessage', async (data) => {
      try {
        if (!data.studyGroup || !data.content) {
          return;
        }
        
        // Get session from socket.handshake
        const session = await getSession({ req: { headers: socket.handshake.headers } as any });
        
        if (!session?.user?.id) {
          return;
        }
        
        // Save message to database with file information
        const newMessage = await Message.create({
          studyGroup: data.studyGroup,
          sender: session.user.id,
          content: data.content,
          fileUrl: data.fileUrl,
          fileType: data.fileType,
          fileName: data.fileName,
          fileSize: data.fileSize
        });
        
        // Populate sender details
        const populatedMessage = await Message.findById(newMessage._id)
          .populate('sender', 'name image')
          .select('content sender studyGroup createdAt fileUrl fileType fileName fileSize');
        
        // Broadcast message to all users in the group with complete file information
        io.to(`group-${data.studyGroup}`).emit('newMessage', {
          ...populatedMessage.toObject(),
          fileUrl: data.fileUrl,
          fileType: data.fileType,
          fileName: data.fileName,
          fileSize: data.fileSize
        });
        
        // Find study group to get all members
        const studyGroup = await StudyGroup.findById(data.studyGroup)
          .populate('members', '_id name image');
        
        if (studyGroup) {
          // Create notifications for all members except the sender
          const notificationPromises = studyGroup.members
            .filter((member: GroupMember) => member._id.toString() !== session.user.id) // Exclude sender
            .map((member: GroupMember) => 
              Notification.create({
                userId: member._id,
                type: 'new_message',
                title: 'New message in study group',
                message: `${session.user.name} sent a message in "${studyGroup.name}"`,
                read: false,
                data: {
                  groupId: studyGroup._id,
                  senderId: session.user.id,
                  messageId: newMessage._id,
                },
              })
            );
          
          await Promise.all(notificationPromises);
        }
      } catch (error) {
        console.error('Error handling sendMessage:', error);
      }
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
  
  console.log('Socket.io server started');
  res.end();
} 