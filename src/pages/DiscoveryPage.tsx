import { useState, useEffect } from 'react';
import UserDiscoveryItem from '../components/UserDiscoveryItem';
import { type UserSummaryDto } from '../types';
import { userService } from '../services/userService';

const DiscoveryPage = () => {
  const [activeTab, setActiveTab] = useState<'people' | 'hobbies'>('people');
  const [users, setUsers] = useState<UserSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedUsers = await userService.getDiscoveryUsers();
        console.log(fetchedUsers);
        setUsers(fetchedUsers);
      } catch (err) {
        console.error('Failed to fetch discovery users:', err);
        setError('Failed to load users. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    console.log(users);
  }, [users]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 mt-16">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden min-h-[600px]">
          {/* Header & Tabs */}
          <div className="border-b border-gray-200">
            <div className="px-6 py-4">
              <h1 className="text-2xl font-bold text-gray-900">Discovery</h1>
              <p className="text-gray-500 text-sm mt-1">Find new people and hobbies to follow</p>
            </div>
            
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('people')}
                className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'people'
                    ? "border-[#b99547] text-[#b99547]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Discover People
              </button>
              <button
                onClick={() => setActiveTab('hobbies')}
                className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'hobbies'
                    ? "border-[#b99547] text-[#b99547]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Discover Hobbies
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'people' ? (
              <>
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b99547]"></div>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="bg-red-100 p-4 rounded-full mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">{error}</h3>
                  </div>
                ) : users.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <p className="text-gray-500">No users to discover at the moment.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {users.map(user => (
                      <UserDiscoveryItem key={user.id} user={user} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="bg-[#f5e6c8] p-4 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#b99547]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Hobby Discovery Coming Soon</h3>
                <p className="text-gray-500 mt-2 max-w-sm">
                  We're working on a way for you to explore new hobbies and interests. Check back later!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscoveryPage;
