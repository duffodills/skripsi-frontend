import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchUserFollowing } from "lib/api";
import { FollowingUser } from "@/interfaces/api/ListsOfApiInterface";
import Link from "next/link";

interface FollowingListProps {
  username?: string;
}

export default function FollowingList({ username }: FollowingListProps) {
  const { user, token } = useAuth();
  const [list, setList] = useState<FollowingUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    fetchUserFollowing(username, token ?? null)
      .then(setList)
      .catch((err) => console.error("Failed to fetch following:", err))
      .finally(() => setLoading(false));
  }, [username, token]);


  if (loading) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="px-8 pb-12 flex flex-col gap-4">
      {list.map((profile) => (
        <Link
          key={profile.id}
          href={`/profile/${profile.username}`}
          className="flex items-center gap-4 bg-[#1C1F26] hover:bg-[#2B2F38] rounded-md px-4 py-3 transition"
        >
          <img
              src={profile.profile_picture_url ?? "/avatars/default.jpg"}
              alt={profile.username}
              className="w-12 h-12 rounded-full"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/avatars/default.jpg";
              }}
          />
          <div>
            <div className="text-white font-medium">{profile.username}</div>
            <div className="text-sm text-gray-400">
              {profile.firstname} {profile.lastname}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
