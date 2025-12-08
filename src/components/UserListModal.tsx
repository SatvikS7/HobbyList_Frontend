import React, { useEffect, useState } from 'react';
import { type UserSummaryDto } from '../types';
import { followService } from '../services/followService';
import UserDiscoveryItem from './UserDiscoveryItem';

interface UserListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'followers' | 'following';
  userId: number;
}

const UserListModal: React.FC<UserListModalProps> = ({ isOpen, onClose, title, type, userId }) => {
  const [users, setUsers] = useState<UserSummaryDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUsers();
    }
  }, [isOpen, userId, type]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let data;
      if (type === 'followers') {
        data = await followService.getFollowers(userId);
      } else {
        data = await followService.getFollowing(userId);
      }
      
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        console.warn("Unexpected data format:", data);
        setUsers([]);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 w-full h-full backdrop-blur-lg bg-black/20 flex justify-center items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >

      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white">
          <h3 className="text-lg font-medium text-gray-900" id="modal-title">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b99547] rounded-md p-1"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#b99547]"></div>
            </div>
          ) : users && users.length > 0 ? (
            <div className="space-y-2">
              {users.map((user) => (
                <UserDiscoveryItem key={user.id} user={user} mode="none" onModalClose={onClose} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">No users found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserListModal;
