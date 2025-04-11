import { useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { toast } from 'react-toastify';
import { useCreateStudyGroupMutation } from '@/lib/redux/slices/studyGroupApi';

const subjects = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'Literature',
  'History',
  'Economics',
  'Other'
];

export default function CreateStudyGroup() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [createStudyGroup, { isLoading }] = useCreateStudyGroupMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    description: '',
    location: '',
    meetingTimes: [''],
    maxMembers: 10,
    tags: ['']
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    router.push('/auth/signin?callbackUrl=/study-groups/create');
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Group name is required';
    }
    
    if (!formData.subject) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleMeetingTimeChange = (index: number, value: string) => {
    const newMeetingTimes = [...formData.meetingTimes];
    newMeetingTimes[index] = value;
    
    setFormData(prev => ({
      ...prev,
      meetingTimes: newMeetingTimes
    }));
  };

  const addMeetingTime = () => {
    setFormData(prev => ({
      ...prev,
      meetingTimes: [...prev.meetingTimes, '']
    }));
  };

  const removeMeetingTime = (index: number) => {
    const newMeetingTimes = [...formData.meetingTimes];
    newMeetingTimes.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      meetingTimes: newMeetingTimes
    }));
  };

  const handleTagChange = (index: number, value: string) => {
    const newTags = [...formData.tags];
    newTags[index] = value;
    
    setFormData(prev => ({
      ...prev,
      tags: newTags
    }));
  };

  const addTag = () => {
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, '']
    }));
  };

  const removeTag = (index: number) => {
    const newTags = [...formData.tags];
    newTags.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      tags: newTags
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await createStudyGroup(formData).unwrap();
      toast.success('Study group created successfully!');
      router.push(`/study-groups/${response._id}`);
    } catch (error) {
      console.error('Failed to create study group:', error);
      toast.error('Failed to create study group. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <p className="text-lg">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Create Study Group | Study Group Finder">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Link href="/study-groups" className="text-primary-600 hover:text-primary-800 flex items-center">
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Study Groups
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-primary-600 px-6 py-4">
              <h1 className="text-2xl font-bold text-white">Create a New Study Group</h1>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              {errors.form && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                  {errors.form}
                </div>
              )}
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Group Name<span className="text-red-600">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                  />
                  {errors.name && <p className="error-message">{errors.name}</p>}
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject<span className="text-red-600">*</span>
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={`input-field ${errors.subject ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select a subject</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                  {errors.subject && <p className="error-message">{errors.subject}</p>}
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description<span className="text-red-600">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className={`input-field ${errors.description ? 'border-red-500' : ''}`}
                    placeholder="Describe the purpose of your study group, topics covered, etc."
                  />
                  {errors.description && <p className="error-message">{errors.description}</p>}
                </div>
                
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location<span className="text-red-600">*</span>
                  </label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleChange}
                    className={`input-field ${errors.location ? 'border-red-500' : ''}`}
                    placeholder="Library, Room 201 or Virtual (Zoom)"
                  />
                  {errors.location && <p className="error-message">{errors.location}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meeting Times
                  </label>
                  {formData.meetingTimes.map((time, index) => (
                    <div key={index} className="flex mb-2">
                      <input
                        type="text"
                        value={time}
                        onChange={(e) => handleMeetingTimeChange(index, e.target.value)}
                        className="input-field"
                        placeholder="e.g., Tuesdays 4-6pm"
                      />
                      {formData.meetingTimes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMeetingTime(index)}
                          className="ml-2 p-2 text-red-600 hover:text-red-800"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addMeetingTime}
                    className="text-sm text-primary-600 hover:text-primary-800"
                  >
                    + Add another meeting time
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  {formData.tags.map((tag, index) => (
                    <div key={index} className="flex mb-2">
                      <input
                        type="text"
                        value={tag}
                        onChange={(e) => handleTagChange(index, e.target.value)}
                        className="input-field"
                        placeholder="e.g., Calculus, Programming"
                      />
                      {formData.tags.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTag(index)}
                          className="ml-2 p-2 text-red-600 hover:text-red-800"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addTag}
                    className="text-sm text-primary-600 hover:text-primary-800"
                  >
                    + Add another tag
                  </button>
                </div>
                
                <div>
                  <label htmlFor="maxMembers" className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Members
                  </label>
                  <input
                    id="maxMembers"
                    name="maxMembers"
                    type="number"
                    min="2"
                    max="50"
                    value={formData.maxMembers}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Link href="/study-groups" className="btn-secondary">
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Study Group'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
} 