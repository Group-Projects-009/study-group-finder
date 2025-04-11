import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '@/lib/mongodb';
import StudyGroup from '@/models/StudyGroup';
import User from '@/models/User';
import mongoose from 'mongoose';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Connect to database
  await dbConnect();
  
  // GET method - fetch all study groups with optional filters
  if (req.method === 'GET') {
    try {
      const { subject, location, search } = req.query;
      
      // Build the filter object
      const filter: any = {};
      
      if (subject) {
        filter.subject = subject;
      }
      
      if (location) {
        filter.location = { $regex: new RegExp(String(location), 'i') };
      }
      
      if (search) {
        filter.$or = [
          { name: { $regex: new RegExp(String(search), 'i') } },
          { description: { $regex: new RegExp(String(search), 'i') } },
        ];
      }
      
      // Try to fetch from database
      let studyGroups;
      
      try {
        // Fetch study groups with filters
        studyGroups = await StudyGroup.find(filter)
          .populate('creator', 'name image')
          .populate('members', 'name image')
          .sort({ createdAt: -1 });
      } catch (dbError) {
        console.error('Database error:', dbError);
      }
      
      // If database fetch fails or returns no results, use mock data
      if (!studyGroups || studyGroups.length === 0) {
        // Mock data for demonstration purposes
        const mockGroups = [
          {
            _id: '1',
            name: 'Calculus Crew',
            subject: 'Mathematics',
            description: 'A group dedicated to mastering calculus concepts and solving challenging problems together.',
            members: [
              { _id: '1', name: 'Demo User', image: 'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff' },
              { _id: '2', name: 'Jane Smith', image: 'https://ui-avatars.com/api/?name=Jane+Smith&background=553C9A&color=fff' }
            ],
            location: 'Online',
            meetingTimes: ['Tuesdays 4-6pm', 'Fridays 3-5pm'],
            maxMembers: 8,
            creator: { _id: '1', name: 'Demo User', image: 'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff' },
            tags: ['Calculus', 'Mathematics', 'Differential Equations'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            _id: '2',
            name: 'Physics Forum',
            subject: 'Physics',
            description: 'Discuss physics concepts, prepare for exams, and work on problem sets in this collaborative group.',
            members: [
              { _id: '3', name: 'Alex Johnson', image: 'https://ui-avatars.com/api/?name=Alex+Johnson&background=6B46C1&color=fff' },
              { _id: '4', name: 'Taylor Wilson', image: 'https://ui-avatars.com/api/?name=Taylor+Wilson&background=047857&color=fff' }
            ],
            location: 'University Library',
            meetingTimes: ['Mondays 3-5pm', 'Thursdays 4-6pm'],
            maxMembers: 12,
            creator: { _id: '3', name: 'Alex Johnson', image: 'https://ui-avatars.com/api/?name=Alex+Johnson&background=6B46C1&color=fff' },
            tags: ['Physics', 'Mechanics', 'Thermodynamics'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            _id: '3',
            name: 'Computer Science Hub',
            subject: 'Computer Science',
            description: 'Learn programming, algorithms, and data structures with peers in a supportive environment.',
            members: [
              { _id: '5', name: 'Maria Garcia', image: 'https://ui-avatars.com/api/?name=Maria+Garcia&background=DC2626&color=fff' },
              { _id: '6', name: 'James Lee', image: 'https://ui-avatars.com/api/?name=James+Lee&background=2563EB&color=fff' }
            ],
            location: 'Online',
            meetingTimes: ['Wednesdays 7-9pm', 'Saturdays 2-4pm'],
            maxMembers: 15,
            creator: { _id: '5', name: 'Maria Garcia', image: 'https://ui-avatars.com/api/?name=Maria+Garcia&background=DC2626&color=fff' },
            tags: ['Programming', 'Algorithms', 'Data Structures'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        
        // Filter mock data based on query parameters
        let filteredMockGroups = mockGroups;
        
        if (subject) {
          filteredMockGroups = filteredMockGroups.filter(group => 
            group.subject.toLowerCase() === String(subject).toLowerCase()
          );
        }
        
        if (location) {
          const locationRegex = new RegExp(String(location), 'i');
          filteredMockGroups = filteredMockGroups.filter(group => 
            locationRegex.test(group.location)
          );
        }
        
        if (search) {
          const searchRegex = new RegExp(String(search), 'i');
          filteredMockGroups = filteredMockGroups.filter(group => 
            searchRegex.test(group.name) || 
            searchRegex.test(group.description) ||
            group.tags.some(tag => searchRegex.test(tag))
          );
        }
        
        return res.status(200).json(filteredMockGroups);
      }
      
      return res.status(200).json(studyGroups);
    } catch (error) {
      console.error('Error in GET /api/study-groups:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  // POST method - create a new study group
  if (req.method === 'POST') {
    const session = await getServerSession(req, res, authOptions);
    
    // Check if user is logged in
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    try {
      const { name, subject, description, meetingTimes, location, maxMembers, tags } = req.body;
      
      // Validate required fields
      if (!name || !subject || !description || !location) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      // Find or create user
      let userId = session.user.id;
      let user;
      
      if (mongoose.Types.ObjectId.isValid(userId)) {
        user = await User.findById(userId);
      }
      
      if (!user && session.user.email) {
        user = await User.findOne({ email: session.user.email });
      }
      
      if (!user && session.user.email) {
        try {
          user = new User({
            name: session.user.name || 'User',
            email: session.user.email,
            image: session.user.image,
            createdGroups: [],
            joinedGroups: []
          });
          
          await user.save();
          userId = user._id;
        } catch (err) {
          console.error("Error creating new user:", err);
        }
      }
      
      if (!user) {
        // For demo purposes, create a temporary group without database
        const tempGroup = {
          _id: Math.floor(Math.random() * 10000).toString(),
          name,
          subject,
          description,
          location,
          meetingTimes: meetingTimes || [],
          maxMembers: maxMembers || 10,
          creator: {
            _id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            image: session.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.name || 'User')}`
          },
          members: [
            {
              _id: session.user.id,
              name: session.user.name,
              email: session.user.email,
              image: session.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.name || 'User')}`
            }
          ],
          tags: tags || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        return res.status(201).json(tempGroup);
      }
      
      // Create new study group in database
      const studyGroup = await StudyGroup.create({
        name,
        subject,
        description,
        meetingTimes: meetingTimes || [],
        location,
        creator: user._id,
        members: [user._id], // Creator is automatically a member
        maxMembers: maxMembers || 10,
        tags: tags || []
      });
      
      // Update user's createdGroups and joinedGroups arrays
      await User.findByIdAndUpdate(
        user._id,
        {
          $addToSet: { 
            createdGroups: studyGroup._id, 
            joinedGroups: studyGroup._id 
          }
        }
      );
      
      // Populate creator and members for response
      const populatedGroup = await StudyGroup.findById(studyGroup._id)
        .populate('creator', 'name image')
        .populate('members', 'name image');
      
      return res.status(201).json(populatedGroup);
    } catch (error) {
      console.error('Error in POST /api/study-groups:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  // Method not allowed
  return res.status(405).json({ message: 'Method not allowed' });
} 