import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { StudyGroup } from '@/lib/redux/slices/studyGroupSlice';

export default function MyStudyGroups() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [createdGroups, setCreatedGroups] = useState<StudyGroup[]>([]);
  const [joinedGroups, setJoinedGroups] = useState<StudyGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not authenticated
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      const fetchMyGroups = async () => {
        try {
          setIsLoading(true);
          const response = await fetch('/api/study-groups/my-groups');
          
          if (!response.ok) {
            throw new Error('Failed to fetch my study groups');
          }
          
          const data = await response.json();
          setCreatedGroups(data.createdGroups || []);
          setJoinedGroups(data.joinedGroups || []);
          setError(null);
        } catch (err) {
          console.error('Error fetching study groups:', err);
          setError('Failed to load your study groups. Using demo data instead.');
          
          // Fallback to mock data if API fails
          setCreatedGroups([
            {
              _id: '1',
              name: 'Calculus Study Group',
              subject: 'Mathematics',
              description: 'A group for students studying Calculus I and II',
              location: 'Library, Room 201',
              meetingTimes: ['Tuesdays 4-6pm', 'Fridays 3-5pm'],
              maxMembers: 8,
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
                }
              ],
              tags: ['Calculus', 'Mathematics', 'Study Group'],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]);
          
          setJoinedGroups([
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
                  _id: '1',
                  name: 'Demo User',
                  email: 'demo@example.com',
                  image: 'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff'
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
          ]);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchMyGroups();
    }
  }, [status, router, session]);

  const renderGroupList = (groups: StudyGroup[], emptyMessage: string) => {
    if (groups.length === 0) {
      return (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-600">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <div key={group._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-md flex flex-col">
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-xl font-semibold text-gray-900">{group.name}</h3>
              <p className="text-gray-500">{group.subject} • {group.members.length} members</p>
              
              <div className="mt-4">
                <p className="text-gray-700 line-clamp-2">{group.description}</p>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {group.tags?.map((tag, index) => (
                  <span key={index} className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="mt-auto pt-4 flex space-x-3">
                <Link 
                  href={`/study-groups/${group._id}`} 
                  className="btn-primary py-2 px-4 flex-1 text-center"
                >
                  View Group
                </Link>
                {group.creator._id === session?.user?.id && (
                  <Link 
                    href={`/study-groups/${group._id}/edit`} 
                    className="btn-secondary py-2 px-4 flex-1 text-center"
                  >
                    Edit
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (status === 'loading' || isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <p className="text-lg">Loading your study groups...</p>
        </div>
      </Layout>
    );
  }

  const hasNoGroups = createdGroups.length === 0 && joinedGroups.length === 0;

  return (
    <Layout title="My Study Groups | Study Group Finder">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">My Study Groups</h1>
            <Link href="/study-groups/create" className="btn-primary">
              Create New Group
            </Link>
          </div>

          {error && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {hasNoGroups ? (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <div className="inline-flex items-center justify-center rounded-full bg-primary-100 p-4 text-primary-600 mb-4">
                <svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">No study groups yet</h2>
              <p className="text-gray-600 mb-6">
                You haven't joined or created any study groups yet. Create a new group or find existing ones to join.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/study-groups/create" className="btn-primary">
                  Create a Study Group
                </Link>
                <Link href="/study-groups" className="btn-secondary">
                  Find Groups to Join
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-10">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Groups You Created</h2>
                {renderGroupList(createdGroups, "You haven't created any study groups yet.")}
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Groups You Joined</h2>
                {renderGroupList(joinedGroups, "You haven't joined any study groups yet.")}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 