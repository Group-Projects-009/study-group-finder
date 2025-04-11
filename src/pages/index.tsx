import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';

export default function Home() {
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';

  return (
    <Layout title="Study Group Finder | Connect and Learn Together">
      {/* Hero Section */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
                Find Your Perfect <span className="text-primary-600">Study Group</span>
              </h1>
              <p className="mt-4 text-xl text-gray-500">
                Connect with fellow students, form study groups, and collaborate to achieve academic success.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link href="/study-groups" className="btn-primary text-center py-3 px-6">
                  Find a Group
                </Link>
                {!isAuthenticated && (
                  <Link href="/auth/signup" className="btn-secondary text-center py-3 px-6">
                    Sign Up Free
                  </Link>
                )}
              </div>
            </div>
            <div className="mt-10 lg:mt-0">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80" 
                alt="Students studying together" 
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">How It Works</h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Join study groups that fit your schedule and learning goals.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="inline-flex items-center justify-center rounded-md bg-primary-100 p-3 text-primary-600 mb-4">
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900">Find a Group</h3>
              <p className="mt-2 text-gray-500">
                Search for study groups based on subject, location, or schedule. Find the perfect match for your learning needs.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="inline-flex items-center justify-center rounded-md bg-primary-100 p-3 text-primary-600 mb-4">
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900">Join or Create</h3>
              <p className="mt-2 text-gray-500">
                Join existing groups or create your own. Invite classmates and set up regular study sessions that work for everyone.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="inline-flex items-center justify-center rounded-md bg-primary-100 p-3 text-primary-600 mb-4">
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900">Collaborate</h3>
              <p className="mt-2 text-gray-500">
                Share resources, discuss topics, and work together to improve understanding and academic performance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Groups */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Featured Study Groups</h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Join these popular study groups or browse all available options.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Sample Study Group Cards */}
            {[
              {
                id: 1,
                name: 'Calculus Crew',
                subject: 'Mathematics',
                members: 8,
                image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1632&q=80',
                tags: ['Calculus', 'Mathematics'],
              },
              {
                id: 2,
                name: 'Physics Forum',
                subject: 'Physics',
                members: 12,
                image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
                tags: ['Physics', 'Mechanics', 'Thermodynamics'],
              },
              {
                id: 3,
                name: 'Computer Science Hub',
                subject: 'Computer Science',
                members: 15,
                image: 'https://images.unsplash.com/photo-1623479322729-28b25c16b011?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
                tags: ['Programming', 'Algorithms', 'Data Structures'],
              }
            ].map((group) => (
              <div key={group.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-md flex flex-col">
                <div className="h-48 overflow-hidden">
                  <img src={group.image} alt={group.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-semibold text-gray-900">{group.name}</h3>
                  <p className="text-gray-500">{group.subject} • {group.members} members</p>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    {group.tags.map((tag, index) => (
                      <span key={index} className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="mt-auto pt-4">
                    <Link href={`/study-groups/${group.id}`} className="btn-secondary w-full text-center">
                      View Group
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/study-groups" className="btn-primary py-3 px-8">
              Browse All Groups
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold">
            Ready to boost your learning?
          </h2>
          <p className="mt-4 text-xl text-primary-100 max-w-2xl mx-auto">
            Join Study Group Finder today and connect with motivated students who share your academic goals.
          </p>
          <div className="mt-8">
            {isAuthenticated ? (
              <Link href="/study-groups/create" className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-white hover:bg-gray-50 md:text-lg">
                Create Your Group
              </Link>
            ) : (
              <Link href="/auth/signup" className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-white hover:bg-gray-50 md:text-lg">
                Get Started for Free
              </Link>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
} 