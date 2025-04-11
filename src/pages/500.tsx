import Link from 'next/link';
import Layout from '@/components/layout/Layout';

export default function Custom500() {
  return (
    <Layout title="Server Error | Study Group Finder">
      <div className="flex min-h-[80vh] flex-col items-center justify-center text-center px-4">
        <h1 className="text-6xl font-bold text-red-600 mb-4">500</h1>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Server Error</h2>
        <p className="text-lg text-gray-600 max-w-lg mb-8">
          Sorry, something went wrong on our server. We're working to fix the issue.
        </p>
        <div className="flex space-x-4">
          <Link 
            href="/" 
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Go to Home
          </Link>
          <button 
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Try Again
          </button>
        </div>
      </div>
    </Layout>
  );
} 