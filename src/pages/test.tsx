import Layout from '@/components/layout/Layout';

export default function TestPage() {
  return (
    <Layout title="Test Page">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold">Test Page</h1>
        <p className="mt-4">This is a test page to verify the server is working correctly.</p>
      </div>
    </Layout>
  );
} 