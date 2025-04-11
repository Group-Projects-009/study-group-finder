import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useDispatch } from 'react-redux';
import { addGroup, updateGroup, StudyGroup } from '@/lib/redux/slices/studyGroupSlice';
import { AppDispatch } from '@/lib/redux/store';

const SUBJECTS = [
  "Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", 
  "Literature", "History", "Geography", "Economics", "Psychology", 
  "Philosophy", "Art", "Music", "Foreign Languages", "Business", 
  "Engineering", "Medicine", "Law"
];

interface StudyGroupFormProps {
  groupData?: StudyGroup; // If provided, edit mode; otherwise, create mode
}

const StudyGroupForm = ({ groupData }: StudyGroupFormProps) => {
  const router = useRouter();
  const { data: session } = useSession();
  const dispatch = useDispatch<AppDispatch>();
  
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('');
  const [maxMembers, setMaxMembers] = useState<number>(10);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const isEditMode = !!groupData;
  
  // Populate form with existing data if in edit mode
  useEffect(() => {
    if (groupData) {
      setTitle(groupData.title || groupData.name || '');
      setSubject(groupData.subject || '');
      setDescription(groupData.description || '');
      setDate(groupData.date || '');
      setTime(groupData.time || '');
      setLocation(groupData.location || '');
      setCity(groupData.city || '');
      setMaxMembers(groupData.maxMembers || 10);
    }
  }, [groupData]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user) {
      setError('You must be signed in to create or edit a study group');
      return;
    }
    
    // Validation
    if (!title || !subject || !description || !date || !time || !location || !city) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      const payload = {
        title,
        subject,
        description,
        date,
        time,
        location,
        city,
        maxMembers,
      };
      
      if (isEditMode) {
        // Update existing group
        const response = await fetch(`/api/study-groups/${groupData._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to update study group');
        }
        
        // Update redux state
        dispatch(updateGroup(data));
        
        // Redirect to group details
        router.push(`/study-groups/${groupData._id}`);
      } else {
        // Create new group
        const response = await fetch('/api/study-groups', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to create study group');
        }
        
        // Update redux state
        dispatch(addGroup(data));
        
        // Redirect to the newly created group
        router.push(`/study-groups/${data._id}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get today's date in YYYY-MM-DD format for min attribute of date input
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {isEditMode ? 'Edit Study Group' : 'Create Study Group'}
      </h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
            placeholder="Study group title"
            required
          />
        </div>
        
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
            Subject *
          </label>
          <select
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="input-field"
            required
          >
            <option value="">Select a subject</option>
            {SUBJECTS.map((subj) => (
              <option key={subj} value={subj}>
                {subj}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="input-field"
            placeholder="Describe what you'll be studying, goals, expectations, etc."
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date *
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={today}
              className="input-field"
              required
            />
          </div>
          
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700">
              Time *
            </label>
            <input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="input-field"
              required
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Location *
          </label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="input-field"
            placeholder="Specific meeting location (e.g., Library, Coffee Shop, Online)"
            required
          />
        </div>
        
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            City *
          </label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="input-field"
            placeholder="City name"
            required
          />
        </div>
        
        <div>
          <label htmlFor="maxMembers" className="block text-sm font-medium text-gray-700">
            Maximum Members
          </label>
          <input
            id="maxMembers"
            type="number"
            value={maxMembers}
            onChange={(e) => setMaxMembers(parseInt(e.target.value) || 10)}
            min={2}
            max={50}
            className="input-field"
          />
          <p className="mt-1 text-sm text-gray-500">
            Limit the number of people who can join your group (2-50)
          </p>
        </div>
        
        <div>
          <button
            type="submit"
            className="w-full btn-primary"
            disabled={isLoading}
          >
            {isLoading 
              ? (isEditMode ? 'Saving...' : 'Creating...') 
              : (isEditMode ? 'Save Changes' : 'Create Group')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudyGroupForm; 