import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useDispatch } from 'react-redux';
import { updateProfile, setUser } from '@/lib/redux/slices/userSlice';
import { AppDispatch } from '@/lib/redux/store';
import { toast } from 'react-toastify';

const SUBJECTS = [
  "Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", 
  "Literature", "History", "Geography", "Economics", "Psychology", 
  "Philosophy", "Art", "Music", "Foreign Languages", "Business", 
  "Engineering", "Medicine", "Law"
];

const WEEKDAYS = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

const TIMES = [
  "Morning", "Afternoon", "Evening"
];

const ProfileForm = () => {
  const { data: session, update: updateSession } = useSession();
  const dispatch = useDispatch<AppDispatch>();
  
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [education, setEducation] = useState('');
  const [major, setMajor] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [availability, setAvailability] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const fetchUserProfile = async () => {
    if (session?.user?.id) {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/user/${session.user.id}`);
        const data = await response.json();
        
        if (response.ok) {
          setName(data.name || '');
          setBio(data.bio || '');
          setLocation(data.location || '');
          setEducation(data.education || '');
          setMajor(data.major || '');
          setInterests(data.interests || []);
          setAvailability(data.availability || []);
          
          // Update Redux store with user data
          dispatch(setUser({
            id: data._id,
            name: data.name,
            email: data.email,
            image: data.image,
            bio: data.bio,
            location: data.location,
            education: data.education,
            major: data.major,
            interests: data.interests,
            availability: data.availability,
          }));
        } else {
          toast.error(data.message || 'Failed to load profile data');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  useEffect(() => {
    fetchUserProfile();
  }, [session, dispatch]);
  
  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };
  
  const toggleAvailability = (slot: string) => {
    setAvailability(prev => 
      prev.includes(slot)
        ? prev.filter(s => s !== slot)
        : [...prev, slot]
    );
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      setError('Name is required');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      const profileData = {
        name,
        bio,
        location,
        education,
        major,
        interests,
        availability,
      };
      
      // Make the API call to update the profile
      const response = await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
      
      const updatedUser = await response.json();
      
      // Update Redux store with new data
      dispatch(setUser({
        id: session?.user?.id || '',
        name: updatedUser.name,
        email: session?.user?.email || '',
        image: session?.user?.image || '',
        bio: updatedUser.bio,
        location: updatedUser.location,
        education: updatedUser.education,
        major: updatedUser.major,
        interests: updatedUser.interests,
        availability: updatedUser.availability,
      }));
      
      // Update the session
      await updateSession();
      
      // Fetch the latest profile data
      await fetchUserProfile();
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error instanceof Error) {
        setError(error.message);
        toast.error(error.message);
      } else {
        setError('Failed to update profile. Please try again.');
        toast.error('Failed to update profile. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Your Profile</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Full Name *
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
            placeholder="Your name"
            required
          />
        </div>
        
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="input-field"
            placeholder="Tell others about yourself, your interests, and study goals..."
          />
        </div>
        
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="input-field"
            placeholder="Your city"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="education" className="block text-sm font-medium text-gray-700">
              Education
            </label>
            <input
              id="education"
              type="text"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              className="input-field"
              placeholder="Your university or school"
            />
          </div>
          
          <div>
            <label htmlFor="major" className="block text-sm font-medium text-gray-700">
              Major
            </label>
            <input
              id="major"
              type="text"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              className="input-field"
              placeholder="Your major or field of study"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interests
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {SUBJECTS.map(subject => (
              <div 
                key={subject} 
                className={`
                  cursor-pointer p-2 rounded border text-sm font-medium
                  ${interests.includes(subject) 
                    ? 'bg-primary-100 border-primary-300 text-primary-800' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}
                `}
                onClick={() => toggleInterest(subject)}
              >
                {subject}
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Availability
          </label>
          <div className="space-y-4">
            {WEEKDAYS.map(day => (
              <div key={day} className="space-y-2">
                <p className="text-sm font-medium text-gray-700">{day}</p>
                <div className="flex space-x-2">
                  {TIMES.map(time => {
                    const availabilitySlot = `${day} ${time}`;
                    return (
                      <div 
                        key={availabilitySlot} 
                        className={`
                          cursor-pointer px-3 py-1 rounded border text-sm font-medium flex-1 text-center
                          ${availability.includes(availabilitySlot) 
                            ? 'bg-primary-100 border-primary-300 text-primary-800' 
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}
                        `}
                        onClick={() => toggleAvailability(availabilitySlot)}
                      >
                        {time}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <button
            type="submit"
            className="w-full btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm; 