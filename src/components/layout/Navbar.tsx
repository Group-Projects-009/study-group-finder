import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import { useAppSelector } from '@/lib/redux/hooks';
import type { RootState } from '@/lib/redux/store';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { data: session, status, update: updateSession } = useSession();
  const currentUser = useAppSelector((state: RootState) => state.user.currentUser);

  const isActive = (path: string) => router.pathname === path;

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  // Update session when currentUser changes
  useEffect(() => {
    if (currentUser && session?.user) {
      updateSession({
        ...session,
        user: {
          ...session.user,
          image: currentUser.image || session.user.image,
        },
      });
    }
  }, [currentUser, session, updateSession]);

  // Get the correct image URL
  const getProfileImage = () => {
    // First try the current user's image from Redux
    if (currentUser?.image) {
      return currentUser.image;
    }
    
    // Then try the session user's image
    if (session?.user?.image) {
      return session.user.image;
    }
    
    // Finally, use the API endpoint
    return `/api/images/${session?.user?.id}`;
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-primary-600">
                Study Group Finder
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/study-groups"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/study-groups')
                    ? 'border-primary-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Study Groups
              </Link>
              {status === 'authenticated' && (
                <>
                  <Link
                    href="/study-groups/my-groups"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive('/study-groups/my-groups')
                        ? 'border-primary-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    My Groups
                  </Link>
                  <Link
                    href="/profile"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive('/profile')
                        ? 'border-primary-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/notifications"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive('/notifications')
                        ? 'border-primary-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    Notifications
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {status === 'authenticated' ? (
              <div className="ml-3 relative">
                <div className="flex items-center space-x-4">
                  <Link
                    href="/profile"
                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                  >
                    <div className="flex items-center">
                      <img
                        className="h-8 w-8 rounded-full"
                        src={getProfileImage()}
                        alt="Profile"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `/api/images/${session?.user?.id}`;
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium">{session?.user?.name}</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/signin"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="btn-primary text-sm"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link
            href="/study-groups"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              isActive('/study-groups')
                ? 'bg-primary-50 border-primary-500 text-primary-700'
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
            }`}
          >
            Study Groups
          </Link>
          {status === 'authenticated' && (
            <>
              <Link
                href="/study-groups/my-groups"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  isActive('/study-groups/my-groups')
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                }`}
              >
                My Groups
              </Link>
              <Link
                href="/profile"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  isActive('/profile')
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                }`}
              >
                Profile
              </Link>
              <Link
                href="/notifications"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  isActive('/notifications')
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                }`}
              >
                Notifications
              </Link>
              <button
                onClick={handleSignOut}
                className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              >
                Sign out
              </button>
            </>
          )}
          {status !== 'authenticated' && (
            <>
              <Link
                href="/auth/signin"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  isActive('/auth/signin')
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                }`}
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  isActive('/auth/signup')
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                }`}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}