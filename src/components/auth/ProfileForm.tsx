import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface ProfileFormProps {
  initialData: any;
  onSuccess: (data: any) => void;
  onCancel: () => void;
}

const ProfileForm = ({ initialData, onSuccess, onCancel }: ProfileFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    education: '',
    interests: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize form with initial data
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        bio: initialData.bio || '',
        location: initialData.location || '',
        education: initialData.education || '',
        interests: initialData.interests || '',
      });
    }
  }, [initialData]);
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      const data = await response.json();
      onSuccess(data);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name*
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>
        
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            value={formData.bio}
            onChange={handleChange}
            className="input-field resize-none"
            placeholder="Tell others about yourself"
          />
        </div>
        
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="input-field"
            placeholder="City, Country"
          />
        </div>
        
        <div>
          <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-1">
            Education
          </label>
          <input
            type="text"
            id="education"
            name="education"
            value={formData.education}
            onChange={handleChange}
            className="input-field"
            placeholder="University or School"
          />
        </div>
        
        <div>
          <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-1">
            Interests
          </label>
          <input
            type="text"
            id="interests"
            name="interests"
            value={formData.interests}
            onChange={handleChange}
            className="input-field"
            placeholder="Separate interests with commas"
          />
        </div>
        
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ProfileForm; 