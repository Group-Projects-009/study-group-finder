import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';

type StudyGroup = {
  _id: string;
  name: string;
  subject: string;
  description: string;
  members: any[] | number; // Can be an array of members or just the count
  location: string;
  image?: string;
  tags: string[];
};

export default function StudyGroups() {
  const router = useRouter();
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<StudyGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  // Available subjects for filtering
  const subjects = ['Mathematics', 'Physics', 'Computer Science', 'Biology', 'Chemistry', 'Literature', 'History'];

  useEffect(() => {
    const fetchStudyGroups = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/study-groups');
        
        if (!response.ok) {
          throw new Error('Failed to fetch study groups');
        }
        
        const data = await response.json();
        setStudyGroups(data);
        setFilteredGroups(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching study groups:', error);
        setError('Failed to load study groups. Using demo data instead.');
        
        // Fallback to mock data if API fails
        const mockGroups = [
          {
            _id: '1',
            name: 'Calculus Crew',
            subject: 'Mathematics',
            description: 'A group dedicated to mastering calculus concepts and solving challenging problems together.',
            members: 8,
            location: 'Online',
            image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1632&q=80',
            tags: ['Calculus', 'Mathematics', 'Differential Equations'],
          },
          {
            _id: '2',
            name: 'Physics Forum',
            subject: 'Physics',
            description: 'Discuss physics concepts, prepare for exams, and work on problem sets in this collaborative group.',
            members: 12,
            location: 'University Library',
            image: 'https://images.unsplash.com/photo-1636466497217-26a5ae026d0c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1674&q=80',
            tags: ['Physics', 'Mechanics', 'Thermodynamics'],
          },
          {
            _id: '3',
            name: 'Computer Science Hub',
            subject: 'Computer Science',
            description: 'Learn programming, algorithms, and data structures with peers in a supportive environment.',
            members: 15,
            location: 'Online',
            image: 'https://images.unsplash.com/photo-1623479322729-28b25c16b011?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
            tags: ['Programming', 'Algorithms', 'Data Structures'],
          },
          {
            _id: '4',
            name: 'Biology Study Circle',
            subject: 'Biology',
            description: 'Focus on biological sciences from molecular biology to ecology and everything in between.',
            members: 10,
            location: 'Science Building, Room 302',
            image: 'https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
            tags: ['Biology', 'Genetics', 'Ecology'],
          },
          {
            _id: '5',
            name: 'Chemistry Collaborators',
            subject: 'Chemistry',
            description: 'Master organic chemistry, biochemistry, and lab techniques in this interactive study group.',
            members: 7,
            location: 'Chemistry Lab',
            image: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80',
            tags: ['Chemistry', 'Organic Chemistry', 'Biochemistry'],
          },
          {
            _id: '6',
            name: 'Literature Circle',
            subject: 'Literature',
            description: 'Analyze and discuss literary works from various periods and cultures.',
            members: 9,
            location: 'Library Reading Room',
            image: 'https://images.unsplash.com/photo-1519682577862-22b62b24e493?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80',
            tags: ['Literature', 'Books', 'Analysis'],
          },
        ];
        
        setStudyGroups(mockGroups);
        setFilteredGroups(mockGroups);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStudyGroups();
  }, []);

  // Filter groups whenever search term or subject filter changes
  useEffect(() => {
    let result = studyGroups;
    
    // Filter by search term
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      result = result.filter(
        group =>
          group.name.toLowerCase().includes(lowerCaseSearch) ||
          group.description.toLowerCase().includes(lowerCaseSearch) ||
          group.tags.some(tag => tag.toLowerCase().includes(lowerCaseSearch))
      );
    }
    
    // Filter by subject
    if (subjectFilter) {
      result = result.filter(group => group.subject === subjectFilter);
    }
    
    setFilteredGroups(result);
  }, [searchTerm, subjectFilter, studyGroups]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSubjectFilter(e.target.value);
  };

  // Helper function to get member count
  const getMemberCount = (group: StudyGroup): number => {
    if (typeof group.members === 'number') {
      return group.members;
    }
    return Array.isArray(group.members) ? group.members.length : 0;
  };

  // Helper function to get default image if none is provided
  const getGroupImage = (group: StudyGroup): string => {
    if (group.image) return group.image;
    
    // Default images by subject
    const defaultImages: Record<string, string> = {
      'Mathematics': 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1632&q=80',
      'Physics': 'https://images.unsplash.com/photo-1636466497217-26a5ae026d0c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1674&q=80',
      'Computer Science': 'https://images.unsplash.com/photo-1623479322729-28b25c16b011?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
      'Biology': 'https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
      'Chemistry': 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80',
      'Literature': 'https://images.unsplash.com/photo-1519682577862-22b62b24e493?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80'
    };
    
    return defaultImages[group.subject] || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80';
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <p className="text-lg">Loading study groups...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Study Groups | Find Your Perfect Study Group">
      <div className="bg-primary-700 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
              Find Your Study Group
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-primary-100">
              Connect with peers who share your academic interests and goals.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Section */}
        <div className="bg-white shadow rounded-lg mb-8 p-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Study Groups
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="search"
                  className="input-field pl-10"
                  placeholder="Search by name, description, or tags"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Subject
              </label>
              <select
                id="subject"
                className="input-field"
                value={subjectFilter}
                onChange={handleSubjectChange}
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>
          </div>
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

        {/* Study Groups List */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {filteredGroups.length} {filteredGroups.length === 1 ? 'Group' : 'Groups'} Available
          </h2>
          <Link href="/study-groups/create" className="btn-primary">
            Create Group
          </Link>
        </div>

        {filteredGroups.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No study groups found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
            <div className="mt-6">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSubjectFilter('');
                }}
                className="btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredGroups.map((group) => (
              <div key={group._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-md flex flex-col">
                <div className="h-48 overflow-hidden">
                  <img src={getGroupImage(group)} alt={group.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{group.name}</h3>
                  <p className="text-gray-500 mb-2">{group.subject} • {getMemberCount(group)} members</p>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{group.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {group.tags.map((tag, index) => (
                      <span key={index} className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <svg className="h-5 w-5 text-gray-400 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {group.location}
                  </div>
                  
                  <div className="mt-auto">
                    <Link href={`/study-groups/${group._id}`} className="btn-primary w-full text-center">
                      View Group
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
} 