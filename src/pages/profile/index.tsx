import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { toast } from 'react-toastify';
import Image from 'next/image';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  image?: string;
  bio?: string;
  education?: string;
  major?: string;
  location?: string;
  interests?: string[];
  availability?: string[];
}

export default function Profile() {
  const router = useRouter();
  const { data: session, status, update: updateSession } = useSession();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchUserProfile = async () => {
    if (status === 'authenticated' && session?.user?.id) {
      try {
        const response = await fetch(`/api/user/${session.user.id}`);
        const data = await response.json();
        
        if (response.ok) {
          setUserProfile(data);
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

  useEffect(() => {
    fetchUserProfile();
  }, [status, session, router]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);

      // Create FormData
      const formData = new FormData();
      formData.append('image', file);

      // Upload image
      const response = await fetch('/api/profile/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();

      // Update profile with new image URL
      const updateResponse = await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: data.imageUrl,
          name: userProfile?.name || session?.user?.name || '',
        }),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update profile with new image');
      }

      // Update session with new image
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          image: data.imageUrl,
        },
      });

      // Fetch fresh profile data
      await fetchUserProfile();
      toast.success('Profile picture updated successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to update profile picture');
    } finally {
      setIsUploading(false);
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
    <Layout title="Profile | Study Group Finder">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="flex-shrink-0 relative">
                  <div 
                    className="h-32 w-32 rounded-full overflow-hidden cursor-pointer relative group"
                    onClick={handleImageClick}
                  >
                    <img
                      src={userProfile?.image || session?.user?.image || `/api/images/${userProfile?._id}`}
                      alt="Profile"
                      className="h-full w-full object-cover transition-opacity group-hover:opacity-75"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-sm font-medium">Change Photo</span>
                    </div>
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
                
                <div className="flex-1 text-center sm:text-left">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {userProfile?.name || session?.user?.name}
                  </h1>
                  <p className="text-gray-600">{userProfile?.email || session?.user?.email}</p>
                  
                  <div className="mt-4">
                    {userProfile?.education && (
                      <p className="text-gray-700">
                        <span className="font-medium">Education:</span> {userProfile.education}
                      </p>
                    )}
                    {userProfile?.major && (
                      <p className="text-gray-700">
                        <span className="font-medium">Major:</span> {userProfile.major}
                      </p>
                    )}
                    {userProfile?.location && (
                      <p className="text-gray-700">
                        <span className="font-medium">Location:</span> {userProfile.location}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex justify-center sm:justify-start space-x-4 mt-6">
                    <Link href="/profile/edit" className="btn-primary">
                      Edit Profile
                    </Link>
                    <Link href="/study-groups/my-groups" className="btn-secondary">
                      My Study Groups
                    </Link>
                  </div>
                </div>
              </div>
              
              {userProfile?.bio && (
                <div className="mt-8 border-t border-gray-200 pt-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-2">About</h2>
                  <p className="text-gray-700">{userProfile.bio}</p>
                </div>
              )}
              
              {userProfile?.interests && userProfile.interests.length > 0 && (
                <div className="mt-8 border-t border-gray-200 pt-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-2">Interests</h2>
                  <div className="flex flex-wrap gap-2">
                    {userProfile.interests.map((interest: string) => (
                      <span
                        key={interest}
                        className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {userProfile?.availability && userProfile.availability.length > 0 && (
                <div className="mt-8 border-t border-gray-200 pt-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-2">Availability</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {userProfile.availability.map((slot: string) => (
                      <div
                        key={slot}
                        className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700"
                      >
                        {slot}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 