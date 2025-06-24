// components/UserCard.tsx
import React from 'react';
import Link from 'next/link';
import { ProfileResponse } from '@/interfaces/api/ListsOfApiInterface';
const UserCard: React.FC<{ user: ProfileResponse }> = ({ user }) => (
  <Link href={`/profile/${user.username}`}>
    <div className="flex items-center space-x-4 w-full p-3 bg-[#1C1F26] hover:bg-[#2B2F38] rounded-lg transition gap-5 mb-2">
      <div className='rounded-full bg-slate-200 flex-shrink-0'>
      <img
          src={user.profile_picture_url ?? "/avatars/default.jpg"}
          alt={user.username}
          className="w-12 h-12 rounded-full"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/avatars/default.jpg";
          }}
      />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate text-white">{user.username}</p>
        {user.bio && <p className="text-sm text-gray-400 truncate">{user.bio}</p>}
      </div>
    </div>
  </Link>
);

export default UserCard;