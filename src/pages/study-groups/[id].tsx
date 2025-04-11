import { useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import StudyGroup from '@/models/StudyGroup';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import GroupChat from '@/components/chat/GroupChat';

interface Member {
  _id: string;
  name: string;
  email: string;
  image?: string;
}

interface StudyGroupType {
  _id: string;
  name: string;
  subject: string;
  description: string;
  location: string;
  meetingTimes: string[];
  maxMembers: number;
  creator: Member;
  members: Member[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface StudyGroupDetailProps {
  group: StudyGroupType;
}

export default function StudyGroupDetail({ group }: StudyGroupDetailProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('details');
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const isAuthenticated = status === 'authenticated';
  const currentUserId = session?.user?.id;
  const isMember = isAuthenticated && group.members.some(member => member._id === currentUserId);
  const isCreator = isAuthenticated && group.creator._id === currentUserId;

  const handleJoin = async () => {
    if (!isAuthenticated) {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(router.asPath)}`);
      return;
    }

    setIsJoining(true);
    
    try {
      const response = await fetch(`/api/study-groups/${group._id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        router.reload();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to join group. Please try again.');
      }
    } catch (error) {
      console.error('Error joining group:', error);
      alert('An error occurred while trying to join the group.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = async () => {
    if (isCreator) {
      alert('As the creator, you cannot leave the group. You can delete it instead.');
      return;
    }

    setIsLeaving(true);
    
    try {
      const response = await fetch(`/api/study-groups/${group._id}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        router.reload();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to leave group. Please try again.');
      }
    } catch (error) {
      console.error('Error leaving group:', error);
      alert('An error occurred while trying to leave the group.');
    } finally {
      setIsLeaving(false);
    }
  };

  if (router.isFallback) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <p className="text-lg">Loading study group...</p>
        </div>
      </Layout>
    );
  }

  const isGroupFull = group.members.length >= group.maxMembers;
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="mb-4 text-sm">
            <ol className="flex space-x-2">
              <li><Link href="/study-groups" className="text-primary-600 hover:text-primary-800">Study Groups</Link></li>
              <li><span className="text-gray-500 mx-1">/</span></li>
              <li className="text-gray-700 truncate">{group.name}</li>
            </ol>
          </nav>
          
          {/* Group Header */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
                  <p className="text-gray-600">{group.subject}</p>
                </div>
                <div className="flex items-start space-x-4">
                  {isAuthenticated && !isMember && !isCreator && (
                    <button
                      onClick={handleJoin}
                      disabled={isJoining || isGroupFull}
                      className={`btn-primary ${(isJoining || isGroupFull) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isJoining ? 'Joining...' : isGroupFull ? 'Group Full' : 'Join Group'}
                    </button>
                  )}
                  {isAuthenticated && isMember && !isCreator && (
                    <button
                      onClick={handleLeave}
                      disabled={isLeaving}
                      className={`btn-secondary ${isLeaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isLeaving ? 'Leaving...' : 'Leave Group'}
                    </button>
                  )}
                  {isAuthenticated && isCreator && (
                    <Link href={`/study-groups/${group._id}/edit`} className="btn-secondary">
                      Edit Group
                    </Link>
                  )}
                </div>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {group.tags.map((tag, index) => (
                  <span key={index} className="inline-block bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex -mb-px space-x-8">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'details'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'members'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Members ({group.members.length})
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'chat'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Chat
              </button>
            </nav>
          </div>
          
          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {activeTab === 'details' && (
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">About this Study Group</h2>
                <p className="text-gray-700 mb-6 whitespace-pre-line">{group.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Location</h3>
                    <p className="text-gray-900">{group.location}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Group Size</h3>
                    <p className="text-gray-900">{group.members.length} / {group.maxMembers} members</p>
                  </div>
                  
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Meeting Times</h3>
                    <ul className="text-gray-900">
                      {group.meetingTimes.map((time, index) => (
                        <li key={index} className="mb-1">{time}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'members' && (
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Group Members</h2>
                
                <ul className="divide-y divide-gray-200">
                  {group.members.map((member) => (
                    <li key={member._id} className="py-4 flex items-center">
                      <img
                        src={member.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=0D8ABC&color=fff`}
                        alt={member.name}
                        className="h-10 w-10 rounded-full"
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{member.name}</p>
                        {member._id === group.creator._id && (
                          <p className="text-xs text-primary-600">Group Creator</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {activeTab === 'chat' && (
              <div className="p-6 h-96">
                {isAuthenticated && isMember ? (
                  <GroupChat groupId={group._id} groupName={group.name} />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-700 mb-4">
                      {isAuthenticated 
                        ? 'You need to join this group to participate in the chat.'
                        : 'You need to sign in and join this group to participate in the chat.'}
                    </p>
                    {isAuthenticated ? (
                      <button
                        onClick={handleJoin}
                        disabled={isJoining || isGroupFull}
                        className={`btn-primary ${(isJoining || isGroupFull) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isJoining ? 'Joining...' : isGroupFull ? 'Group Full' : 'Join Group'}
                      </button>
                    ) : (
                      <Link href={`/auth/signin?callbackUrl=${encodeURIComponent(router.asPath)}`} className="btn-primary">
                        Sign In
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };
  
  // Check if we're trying to access the my-groups page
  if (id === "my-groups") {
    return {
      redirect: {
        destination: '/study-groups/my-groups',
        permanent: false,
      }
    };
  }

  // For MongoDB ObjectId validation
  // Allow numeric IDs for the demo data
  if (!mongoose.Types.ObjectId.isValid(id) && isNaN(parseInt(id))) {
    return {
      notFound: true
    };
  }
  
  try {
    await dbConnect();
    
    // Try to fetch from database or use mock data for demo
    let studyGroup;
    let group;
    
    if (mongoose.Types.ObjectId.isValid(id)) {
      studyGroup = await StudyGroup.findById(id)
        .populate('creator', 'name email image')
        .populate('members', 'name email image')
        .lean();
      
      if (studyGroup) {
        // Convert MongoDB documents to plain objects
        group = JSON.parse(JSON.stringify(studyGroup));
      }
    }
    
    // If not found in database and ID is numeric, use mock data
    if (!group && /^\d+$/.test(id)) {
      // Mock data for demo purposes
      group = {
        _id: id,
        name: 'Calculus Study Group',
        subject: 'Mathematics',
        description: 'A group dedicated to mastering calculus concepts. We focus on limits, derivatives, integrals, and applications.',
        location: 'Main Library, Room 102',
        meetingTimes: ['Tuesdays 4-6pm', 'Fridays 3-5pm'],
        maxMembers: 10,
        creator: {
          _id: '1',
          name: 'Demo User',
          email: 'demo@example.com',
          image: 'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff'
        },
        members: [
          {
            _id: '1',
            name: 'Demo User',
            email: 'demo@example.com',
            image: 'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff'
          },
          {
            _id: '2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            image: 'https://ui-avatars.com/api/?name=Jane+Smith&background=553C9A&color=fff'
          },
          {
            _id: '3',
            name: 'Bob Johnson',
            email: 'bob@example.com',
            image: 'https://ui-avatars.com/api/?name=Bob+Johnson&background=047857&color=fff'
          }
        ],
        tags: ['Calculus', 'Mathematics', 'Study Group'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    
    if (!group) {
      return {
        notFound: true
      };
    }
    
    return {
      props: {
        group
      }
    };
  } catch (error) {
    console.error('Error fetching study group:', error);
    return {
      notFound: true
    };
  }
}; 