import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';

export default function AuthError() {
  const router = useRouter();
  const { error } = router.query;
  
  const getErrorMessage = () => {
    switch (error) {
      case 'OAuthSignin':
      case 'OAuthCallback':
      case 'OAuthCreateAccount':
      case 'EmailCreateAccount':
      case 'Callback':
        return 'There was an error with the OAuth sign in. Please try again.';
      case 'CredentialsSignin':
        return 'Invalid email or password. Please try again.';
      case 'SessionRequired':
        return 'Please sign in to access this page.';
      case 'Configuration':
        return 'There is a problem with the server configuration. Please contact support.';
      case 'AccessDenied':
        return 'You do not have permission to access this resource.';
      default:
        return error 
          ? `An error occurred: ${error}` 
          : 'An unknown error occurred. Please try again.';
    }
  };
  
  return (
    <Layout title="Authentication Error | Study Group Finder">
      <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="text-center">
            <svg 
              className="mx-auto h-12 w-12 text-red-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
            
            <h2 className="mt-4 text-center text-3xl font-bold tracking-tight text-gray-900">
              Authentication Error
            </h2>
            
            <p className="mt-4 text-center text-base text-gray-600">
              {getErrorMessage()}
            </p>
          </div>
        </div>
        
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="space-y-4">
            <Link 
              href="/auth/signin" 
              className="flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
            >
              Back to Sign In
            </Link>
            
            <Link 
              href="/" 
              className="flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
} 