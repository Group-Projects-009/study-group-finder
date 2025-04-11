import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Layout from '@/components/layout/Layout';
import { toast } from 'react-toastify';

export default function EditProfile() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    education: '',
    major: '',
    interests: '',
    image: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (status === 'authenticated' && session?.user?.id) {
        try {
          const response = await fetch(`/api/user/${session.user.id}`);
          const data = await response.json();
          
          if (response.ok) {
            setFormData({
              name: data.name || '',
              email: data.email || '',
              bio: data.bio || '',
              education: data.education || '',
              major: data.major || '',
              interests: data.interests?.join(', ') || '',
              image: data.image || '',
            });
          } else {
            toast.error('Failed to load profile data');
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
          toast.error('Failed to load profile data');
        } finally {
          setIsLoading(false);
        }
      } else if (status === 'unauthenticated') {
        router.push('/auth/signin');
      }
    };

    fetchUserProfile();
  }, [status, session, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      const response = await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          interests: formData.interests.split(',').map(i => i.trim()).filter(i => i),
        }),
      });
      
      if (response.ok) {
        toast.success('Profile updated successfully');
        router.push('/profile');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <p className="text-lg">Loading profile...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Edit Profile | Study Group Finder">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Your Profile</h1>
          
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`mt-1 input-field ${errors.name ? 'border-red-500' : ''}`}
                />
                {errors.name && <p className="error-message">{errors.name}</p>}
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`mt-1 input-field ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && <p className="error-message">{errors.email}</p>}
              </div>
              
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={handleChange}
                  className="mt-1 input-field"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="education" className="block text-sm font-medium text-gray-700">
                    Education
                  </label>
                  <input
                    type="text"
                    id="education"
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    className="mt-1 input-field"
                  />
                </div>
                
                <div>
                  <label htmlFor="major" className="block text-sm font-medium text-gray-700">
                    Major
                  </label>
                  <input
                    type="text"
                    id="major"
                    name="major"
                    value={formData.major}
                    onChange={handleChange}
                    className="mt-1 input-field"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="interests" className="block text-sm font-medium text-gray-700">
                  Interests (comma separated)
                </label>
                <input
                  type="text"
                  id="interests"
                  name="interests"
                  value={formData.interests}
                  onChange={handleChange}
                  className="mt-1 input-field"
                />
              </div>
              
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                  Profile Image URL
                </label>
                <input
                  type="text"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  className="mt-1 input-field"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Leave empty to use your default profile image.
                </p>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.push('/profile')}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-primary"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
} 