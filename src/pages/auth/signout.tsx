import { useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';

export default function SignOut() {
  const router = useRouter();
  
  useEffect(() => {
    // Sign out and redirect to home page
    const handleSignOut = async () => {
      await signOut({ redirect: false });
      router.push('/');
    };
    
    handleSignOut();
  }, [router]);
  
  return (
    <Layout title="Signing Out | Study Group Finder">
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mb-4"></div>
          <h1 className="text-xl font-medium">Signing out...</h1>
          <p className="text-gray-500 mt-2">You'll be redirected to the home page shortly.</p>
        </div>
      </div>
    </Layout>
  );
} 