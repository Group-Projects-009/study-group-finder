import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import Layout from '@/components/layout/Layout';

// Define the notification interface
interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'group_join' | 'group_leave' | 'group_update' | 'message' | 'new_message';
  read: boolean;
  data?: {
    groupId?: string;
    groupName?: string;
    userId?: string;
    userName?: string;
    messageId?: string;
    senderId?: string;
  };
  createdAt: string;
}

export default function Notifications() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/notifications');
    }
  }, [status, router]);

  // Fetch notifications
  useEffect(() => {
    if (status === 'authenticated') {
      fetchNotifications();
    }
  }, [status]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications');
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications. Please try again later.');
      
      // Return empty array instead of mock data
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // Find the notification in our state
      const notification = notifications.find(n => n._id === notificationId);
      if (!notification || notification.read) return;

      // Optimistically update UI
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );

      // Make API call
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
      // Revert the optimistic update if the API call fails
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, read: false } : n)
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      // Optimistically update UI
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));

      // Make API call
      const response = await fetch('/api/notifications/read-all', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      // Revert the optimistic update if the API call fails
      fetchNotifications();
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification._id);
    
    // Navigate based on notification type and data
    if (notification.type === 'group_join' || notification.type === 'group_leave' || notification.type === 'group_update') {
      if (notification.data?.groupId) {
        router.push(`/study-groups/${notification.data.groupId}`);
      }
    } else if (notification.type === 'message' || notification.type === 'new_message') {
      if (notification.data?.groupId) {
        router.push(`/study-groups/${notification.data.groupId}?tab=chat`);
      }
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) {
      return 'just now';
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
      });
    }
  };

  // Get mock notifications for demonstration
  const getMockNotifications = (): Notification[] => {
    return [
      {
        _id: '1',
        userId: '123',
        title: 'New member joined',
        message: 'John Doe has joined your Calculus Crew study group',
        type: 'group_join',
        read: false,
        data: {
          groupId: '1',
          groupName: 'Calculus Crew',
          userId: '456',
          userName: 'John Doe'
        },
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
      },
      {
        _id: '2',
        userId: '123',
        title: 'Study group update',
        message: 'Physics Forum meeting time has been changed to 6:00 PM',
        type: 'group_update',
        read: true,
        data: {
          groupId: '2',
          groupName: 'Physics Forum'
        },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() // 5 hours ago
      },
      {
        _id: '3',
        userId: '123',
        title: 'New message',
        message: 'You have a new message in Computer Science Hub',
        type: 'message',
        read: false,
        data: {
          groupId: '3',
          groupName: 'Computer Science Hub'
        },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() // 2 days ago
      },
      {
        _id: '4',
        userId: '123',
        title: 'Member left group',
        message: 'Jane Smith has left your Calculus Crew study group',
        type: 'group_leave',
        read: false,
        data: {
          groupId: '1',
          groupName: 'Calculus Crew',
          userId: '789',
          userName: 'Jane Smith'
        },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString() // 5 days ago
      }
    ];
  };

  // If not authenticated, show loading state
  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <Layout title="Notifications | Study Group Finder">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Notifications | Study Group Finder">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {notifications.some(n => !n.read) && (
            <button 
              onClick={markAllAsRead}
              className="text-sm text-primary-600 hover:text-primary-800"
            >
              Mark all as read
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <h2 className="mt-4 text-lg font-medium text-gray-900">No notifications</h2>
            <p className="mt-2 text-gray-500">You don't have any notifications at the moment.</p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <li 
                  key={notification._id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read ? 'bg-primary-50' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                      {getNotificationIcon(notification.type, !notification.read)}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </p>
                      <p className={`text-sm ${!notification.read ? 'text-gray-700' : 'text-gray-500'}`}>
                        {notification.message}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="ml-2 flex-shrink-0">
                        <span className="inline-block h-2 w-2 rounded-full bg-primary-600"></span>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Layout>
  );
}

// Helper function to get notification icon based on type
function getNotificationIcon(type: string, unread: boolean) {
  const baseClasses = `h-6 w-6 ${unread ? 'text-primary-600' : 'text-gray-400'}`;
  
  switch (type) {
    case 'group_join':
      return (
        <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      );
    case 'group_leave':
      return (
        <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
        </svg>
      );
    case 'group_update':
      return (
        <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'message':
      return (
        <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      );
    case 'new_message':
      return (
        <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      );
    default:
      return (
        <svg className={baseClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      );
  }
} 