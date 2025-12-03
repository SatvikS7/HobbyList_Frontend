import React from 'react';
import { type UserSummaryDto } from '../types';
import { followService } from '../services/followService';
import { useNavigate } from 'react-router-dom';

interface UserDiscoveryItemProps {
  user: UserSummaryDto;
  mode?: 'follow' | 'request' | 'none';
  onRefresh?: () => void;
  onModalClose?: () => void;
}

const UserDiscoveryItem: React.FC<UserDiscoveryItemProps> = ({ user, mode = 'follow', onRefresh, onModalClose }) => {
  const navigate = useNavigate();

  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await followService.followUser(user.id);
      onRefresh?.();
    } catch (error) {
      console.error('Failed to follow user:', error);
    }
  };

  const handleAccept = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await followService.acceptRequest(user.id);
      onRefresh?.();
    } catch (error) {
      console.error('Failed to accept request:', error);
    }
  };

  const handleReject = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await followService.rejectRequest(user.id);
      onRefresh?.();
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  };

  const handleProfileClick = () => {
    onModalClose?.();
    navigate(`/profile-page?userId=${user.id}`);
  };

  return (
    <div 
        className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
        onClick={handleProfileClick}
    >
      <div className="flex items-center gap-4">
        <img
          src={user.profileUrl || "src/assets/default-avatar.png"}
          alt={`${user.displayName}'s avatar`}
          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
        />
        <div>
          <h3 className="font-semibold text-gray-900">{user.displayName}</h3>
          <div className="flex flex-wrap gap-1 mt-1">
            {user.hobbies.slice(0, 3).map((hobby, index) => (
              <span
                key={index}
                className="text-xs px-2 py-0.5 bg-[#f5e6c8] text-[#785c16] rounded-full"
              >
                {hobby}
              </span>
            ))}
            {user.hobbies.length > 3 && (
              <span className="text-xs text-gray-500 self-center">
                +{user.hobbies.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>
      
      {mode === 'follow' ? (
        <button
          onClick={handleFollow}
          className="px-4 py-1.5 bg-[#b99547] text-white text-sm font-medium rounded-md hover:bg-[#a07f36] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b99547]"
        >
          Follow
        </button>
      ) : mode === 'request' ? (
        <div className="flex gap-2">
          <button
            onClick={handleReject}
            className="px-4 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
          >
            Reject
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-1.5 bg-[#b99547] text-white text-sm font-medium rounded-md hover:bg-[#a07f36] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b99547]"
          >
            Accept
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default UserDiscoveryItem;
