import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useDispatch } from 'react-redux';
import { joinGroup, leaveGroup } from '@/lib/redux/slices/studyGroupSlice';
import { StudyGroup } from '@/lib/redux/slices/studyGroupSlice';
import { AppDispatch } from '@/lib/redux/store';

interface StudyGroupCardProps {
  group: StudyGroup;
  isMember?: boolean;
  isCreator?: boolean;
}

const StudyGroupCard = ({ group, isMember = false, isCreator = false }: StudyGroupCardProps) => {
  const { data: session } = useSession();
  const dispatch = useDispatch<AppDispatch>();
  
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [error, setError] = useState('');
  
  const handleJoinGroup = async () => {
    if (!session) {
      return;
    }
    
    try {
      setIsJoining(true);
      setError('');
      
      const response = await fetch(`/api/study-groups/${group._id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to join group');
      }
      
      // Update redux state
      if (session.user?.id) {
        dispatch(joinGroup({
          groupId: group._id,
          user: {
            _id: session.user.id,
            name: session.user.name || 'User',
            email: session.user.email || 'user@example.com',
            image: session.user.image || undefined,
          },
        }));
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to join group. Please try again.');
      }
    } finally {
      setIsJoining(false);
    }
  };
  
  const handleLeaveGroup = async () => {
    if (!session) {
      return;
    }
    
    try {
      setIsLeaving(true);
      setError('');
      
      const response = await fetch(`/api/study-groups/${group._id}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to leave group');
      }
      
      // Update redux state
      if (session.user?.id) {
        dispatch(leaveGroup({
          groupId: group._id,
          userId: session.user.id,
        }));
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to leave group. Please try again.');
      }
    } finally {
      setIsLeaving(false);
    }
  };
  
  // Format date string
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-800 mb-1 hover:text-primary-600">
            <Link href={`/study-groups/${group._id}`}>
              {group.name}
            </Link>
          </h3>
          <span className="inline-block bg-primary-100 text-primary-800 text-xs font-semibold px-2.5 py-0.5 rounded">
            {group.subject}
          </span>
        </div>
        
        <p className="text-gray-700 mb-4 line-clamp-2">{group.description}</p>
        
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDate(group.createdAt)} • {group.meetingTimes[0] || 'Time TBD'}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{group.location}</span>
          </div>
        </div>
        
        <div className="flex items-center mb-4">
          <div className="flex -space-x-2 overflow-hidden">
            {group.members.slice(0, 3).map((member, index) => (
              <div key={member._id} className="inline-block h-8 w-8 rounded-full ring-2 ring-white overflow-hidden">
                {member.image ? (
                  <Image 
                    src={member.image} 
                    alt={member.name} 
                    width={32} 
                    height={32} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-primary-500 flex items-center justify-center text-white text-xs font-medium">
                    {member.name[0]?.toUpperCase()}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <span className="text-sm text-gray-600 ml-2">
            {group.members.length > 3 ? 
              `${group.members.slice(0, 3).map(m => m.name).join(', ')} +${group.members.length - 3} more` : 
              group.members.map(m => m.name).join(', ')}
          </span>
        </div>
        
        {error && (
          <div className="text-red-500 text-sm mb-4">
            {error}
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            <span>Created by {group.creator.name}</span>
          </div>
          
          <div>
            {!session ? (
              <Link href="/auth/signin" className="btn-primary text-sm">
                Sign in to join
              </Link>
            ) : isCreator ? (
              <Link href={`/study-groups/${group._id}/edit`} className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded">
                Edit
              </Link>
            ) : isMember ? (
              <button
                onClick={handleLeaveGroup}
                disabled={isLeaving}
                className="text-sm bg-red-50 hover:bg-red-100 text-red-700 font-medium py-2 px-4 rounded"
              >
                {isLeaving ? 'Leaving...' : 'Leave Group'}
              </button>
            ) : (
              <button
                onClick={handleJoinGroup}
                disabled={isJoining}
                className="btn-primary text-sm"
              >
                {isJoining ? 'Joining...' : 'Join Group'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyGroupCard; 