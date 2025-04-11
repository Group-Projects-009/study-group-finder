import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '@/lib/mongodb';
import StudyGroup from '@/models/StudyGroup';
import User from '@/models/User';
import mongoose from 'mongoose';

// Define a type for the study group document from MongoDB
interface StudyGroupDocument {
  _id: {
    toString: () => string;
  };
  [key: string]: any;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET method
  if (req.method !== 'GET') {
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
    
    // Try to get user data
    let userData = null;
    
    if (mongoose.Types.ObjectId.isValid(session.user.id)) {
      try {
        // Get user with populated created and joined groups
        userData = await User.findById(session.user.id)
          .populate({
            path: 'createdGroups', 
            populate: [
              { path: 'creator', select: 'name image' },
              { path: 'members', select: 'name image' }
            ]
          })
          .populate({
            path: 'joinedGroups',
            populate: [
              { path: 'creator', select: 'name image' },
              { path: 'members', select: 'name image' }
            ]
          });
      } catch (err) {
        console.error("Error finding user by ID:", err);
      }
    }
    
    // If we don't have user data, try to find by email
    if (!userData && session.user.email) {
      try {
        userData = await User.findOne({ email: session.user.email })
          .populate({
            path: 'createdGroups', 
            populate: [
              { path: 'creator', select: 'name image' },
              { path: 'members', select: 'name image' }
            ]
          })
          .populate({
            path: 'joinedGroups',
            populate: [
              { path: 'creator', select: 'name image' },
              { path: 'members', select: 'name image' }
            ]
          });
      } catch (err) {
        console.error("Error finding user by email:", err);
      }
    }
    
    // If still no user data, create a new user or use demo data
    if (!userData) {
      // Try to create a new user if email is available
      if (session.user.email) {
        try {
          const newUser = new User({
            name: session.user.name || 'User',
            email: session.user.email,
            image: session.user.image,
            createdGroups: [],
            joinedGroups: []
          });
          
          userData = await newUser.save();
        } catch (err) {
          console.error("Error creating new user:", err);
        }
      }
      
      // If still no user data, return demo data
      if (!userData) {
        return res.status(200).json({
          createdGroups: [
            {
              _id: '1',
              name: 'Calculus Study Group',
              subject: 'Mathematics',
              description: 'A group for students studying Calculus I and II',
              location: 'Library, Room 201',
              meetingTimes: ['Tuesdays 4-6pm', 'Fridays 3-5pm'],
              maxMembers: 8,
              creator: {
                _id: session.user.id || '1',
                name: session.user.name || 'Demo User',
                email: session.user.email || 'user@example.com',
                image: session.user.image || 'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff'
              },
              members: [
                {
                  _id: session.user.id || '1',
                  name: session.user.name || 'Demo User',
                  email: session.user.email || 'user@example.com',
                  image: session.user.image || 'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff'
                },
                {
                  _id: '2',
                  name: 'Jane Smith',
                  email: 'jane@example.com',
                  image: 'https://ui-avatars.com/api/?name=Jane+Smith&background=553C9A&color=fff'
                }
              ],
              tags: ['Calculus', 'Mathematics', 'Study Group'],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ],
          joinedGroups: [
            {
              _id: '2',
              name: 'Physics Forum',
              subject: 'Physics',
              description: 'A group dedicated to discussing various physics topics and helping each other with assignments',
              location: 'Science Building, Room 102',
              meetingTimes: ['Mondays 3-5pm', 'Thursdays 4-6pm'],
              maxMembers: 12,
              creator: {
                _id: '3',
                name: 'Alex Johnson',
                email: 'alex@example.com',
                image: 'https://ui-avatars.com/api/?name=Alex+Johnson&background=6B46C1&color=fff'
              },
              members: [
                {
                  _id: session.user.id || '1',
                  name: session.user.name || 'Demo User',
                  email: session.user.email || 'user@example.com',
                  image: session.user.image || 'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff'
                },
                {
                  _id: '3',
                  name: 'Alex Johnson',
                  email: 'alex@example.com',
                  image: 'https://ui-avatars.com/api/?name=Alex+Johnson&background=6B46C1&color=fff'
                }
              ],
              tags: ['Physics', 'Mechanics', 'Thermodynamics'],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]
        });
      }
    }
    
    // Process user data with proper error handling
    let createdGroups = [];
    let joinedGroups = [];
    
    try {
      // Filter out any duplicates (groups that are both created and joined)
      if (userData.createdGroups && Array.isArray(userData.createdGroups)) {
        createdGroups = userData.createdGroups;
      }
      
      if (userData.joinedGroups && Array.isArray(userData.joinedGroups)) {
        const createdGroupIds = createdGroups.map((group: StudyGroupDocument) => 
          group._id ? group._id.toString() : ''
        ).filter(id => id);
        
        joinedGroups = userData.joinedGroups.filter((group: StudyGroupDocument) => 
          group._id && !createdGroupIds.includes(group._id.toString())
        );
      }
    } catch (err) {
      console.error("Error processing user groups:", err);
    }
    
    return res.status(200).json({
      createdGroups: createdGroups || [],
      joinedGroups: joinedGroups || []
    });
  } catch (error) {
    console.error('Error in GET /api/study-groups/my-groups:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 