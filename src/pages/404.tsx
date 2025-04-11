import Link from 'next/link';
import Layout from '@/components/layout/Layout';

export default function Custom404() {
  return (
    <Layout title="Page Not Found | Study Group Finder">
      <div className="flex min-h-[80vh] flex-col items-center justify-center text-center px-4">
        <h1 className="text-6xl font-bold text-primary-600 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h2>
        <p className="text-lg text-gray-600 max-w-lg mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or never existed.
        </p>
        <div className="flex space-x-4">
          <Link 
            href="/" 
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Go to Home
          </Link>
          <Link 
            href="/study-groups" 
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Browse Study Groups
          </Link>
        </div>
      </div>
    </Layout>
  );
} 