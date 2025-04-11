import { ReactNode, useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export default function Layout({ 
  children, 
  title = 'Study Group Finder | Connect and Learn Together',
  description = 'Connect with fellow students and form study groups' 
}: LayoutProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  
  // Check for unread notifications
  useEffect(() => {
    if (status === 'authenticated') {
      // In a real app, we would fetch from the API
      // For now, set a random number for demo purposes
      setUnreadNotifications(Math.floor(Math.random() * 5));
    }
  }, [status]);
  
  const isActive = (path: string) => router.pathname === path || router.pathname.startsWith(`${path}/`);
  
  const toggleMenu = () => setIsOpen(!isOpen);
  
  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    await signOut({ redirect: false });
    router.push('/');
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="font-bold text-xl text-primary-600">
                  Study Group Finder
                </Link>
              </div>
              
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/') 
                      ? 'border-primary-500 text-gray-900' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Home
                </Link>
                
                <Link
                  href="/study-groups"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/study-groups') 
                      ? 'border-primary-500 text-gray-900' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Find Groups
                </Link>
                
                {session && (
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
                      href="/notifications"
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isActive('/notifications') 
                          ? 'border-primary-500 text-gray-900' 
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      Notifications
                      {unreadNotifications > 0 && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {unreadNotifications}
                        </span>
                      )}
                    </Link>
                  </>
                )}
              </div>
            </div>
            
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {status === 'authenticated' ? (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/profile"
                    className="text-sm font-medium text-gray-700 hover:text-primary-600 flex items-center"
                  >
                    {session.user.image && (
                      <img
                        className="h-8 w-8 rounded-full mr-2"
                        src={session.user.image}
                        alt={session.user.name || ''}
                      />
                    )}
                    {session.user.name || 'Profile'}
                  </Link>
                  
                  <button
                    onClick={handleSignOut}
                    className="text-sm font-medium text-gray-700 hover:text-primary-600"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/auth/signin"
                    className="text-sm font-medium text-gray-700 hover:text-primary-600"
                  >
                    Sign in
                  </Link>
                  
                  <Link
                    href="/auth/signup"
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
            
            <div className="flex items-center sm:hidden">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
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
              href="/"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/') 
                  ? 'bg-primary-50 border-primary-500 text-primary-700' 
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
              }`}
            >
              Home
            </Link>
            
            <Link
              href="/study-groups"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/study-groups') 
                  ? 'bg-primary-50 border-primary-500 text-primary-700' 
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
              }`}
            >
              Find Groups
            </Link>
            
            {session && (
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
                  href="/notifications"
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive('/notifications') 
                      ? 'bg-primary-50 border-primary-500 text-primary-700' 
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                  }`}
                >
                  Notifications
                  {unreadNotifications > 0 && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {unreadNotifications}
                    </span>
                  )}
                </Link>
              </>
            )}
            
            {!session ? (
              <>
                <Link
                  href="/auth/signin"
                  className="block pl-3 pr-4 py-2 border-l-4 text-base font-medium border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                >
                  Sign in
                </Link>
                
                <Link
                  href="/auth/signup"
                  className="block pl-3 pr-4 py-2 border-l-4 text-base font-medium border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                >
                  Sign up
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/profile"
                  className="block pl-3 pr-4 py-2 border-l-4 text-base font-medium border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                >
                  Profile
                </Link>
                
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left pl-3 pr-4 py-2 border-l-4 text-base font-medium border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                >
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
      
      <main className="flex-grow bg-gray-50">
        {children}
      </main>
      
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex justify-center md:justify-start space-x-6">
              <Link href="/" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Home</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2L2 12h3v8h14v-8h3L12 2zm0 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
                </svg>
              </Link>
              
              <a href="https://github.com" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
            
            <div className="mt-4 md:mt-0">
              <p className="text-center md:text-right text-base text-gray-400">
                &copy; {new Date().getFullYear()} Study Group Finder. All rights reserved.
              </p>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Platform</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <Link href="/study-groups" className="text-base text-gray-500 hover:text-gray-900">
                    Find Groups
                  </Link>
                </li>
                <li>
                  <Link href="/study-groups/create" className="text-base text-gray-500 hover:text-gray-900">
                    Create a Group
                  </Link>
                </li>
                <li>
                  <Link href="/events" className="text-base text-gray-500 hover:text-gray-900">
                    Events
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Support</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <Link href="/faq" className="text-base text-gray-500 hover:text-gray-900">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-base text-gray-500 hover:text-gray-900">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="text-base text-gray-500 hover:text-gray-900">
                    Help Center
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <Link href="/privacy" className="text-base text-gray-500 hover:text-gray-900">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-base text-gray-500 hover:text-gray-900">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Company</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <Link href="/about" className="text-base text-gray-500 hover:text-gray-900">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-base text-gray-500 hover:text-gray-900">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="text-base text-gray-500 hover:text-gray-900">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 