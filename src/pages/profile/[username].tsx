import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchUserProfile, fetchUserFollowing } from "lib/api";
import { ProfileResponse } from "@/interfaces/api/ListsOfApiInterface";
import { Game } from "@/interfaces/Game";
import Link from "next/link";
import FollowButton from "@/components/FollowButton";

export default function PublicProfilePage() {
  const router = useRouter();
  const { isReady, query } = router;
  const { username: targetUsername } = query as { username: string };
  const { token, user } = useAuth();

  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

useEffect(() => {
  if (!isReady || typeof targetUsername !== "string") return;

  setLoading(true);

  fetchUserProfile(targetUsername, token)
    .then((data) => {
      setProfile(data);
      if (user && user.username !== targetUsername && token) {
        fetchUserFollowing(user.username, token).then((list) =>
          setIsFollowing(list.some((u) => u.id === data.id))
        );
      }
    })
    .catch((err) => {
      console.error("Failed to fetch profile", err);
      router.replace("/404");
    })
    .finally(() => setLoading(false));
}, [isReady, targetUsername, token, user]);


  if (loading || !profile) return <div className="p-8 text-white">Loading...</div>;

  const isOwn = user?.username === profile.username;

  const mapToGame = (item: any): Game => ({
    id: item.id,
    igdb_id: item.igdb_id ?? item.id,
    name: item.name,
    slug: item.slug,
    cover: item.cover ?? item.cover_url ?? "",
    href: `/games/${item.slug ?? item.igdb_id}`,
    rating_count: 0,
  });

  return (
    <div className="min-h-screen bg-[#11161D] text-gray-100 p-4 sm:p-6 md:p-8">
      <div className="flex flex-col md:flex-row justify-between gap-6 mb-12">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 rounded-full bg-gray-700 overflow-hidden">
            <img
              src={profile.profile_picture_url ?? "/avatars/default.jpg"}
              alt={profile.username}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/avatars/default.jpg";
              }}
            />
          </div>
          <div>
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-semibold">{profile.username}</div>
              {!isOwn && token && (
                <FollowButton
                  userId={profile.id}
                  token={token}
                  initialFollowing={isFollowing}
                  onChange={(now) =>
                    setProfile((prev) =>
                      prev ? { ...prev, follower_count: prev.follower_count + (now ? 1 : -1) } : prev
                    )
                  }
                />
              )}
            </div>
            <p className="mt-2 text-gray-400 max-w-md">{profile.bio ?? ""}</p>
          </div>
        </div>

        <div className="flex flex-wrap md:space-x-8 gap-4 md:gap-y-0 mt-4 md:mt-0">
          <Stat label="Games" value={profile.played_game_count} />
          <Link href={`/profile/${profile.username}/activity`}>
            <Stat label="Review" value={profile.diary_count} />
          </Link>
          <Link href={`/profile/${profile.username}/following`}>
            <Stat label="Following" value={profile.following_count} />
          </Link>
          <Link href={`/profile/${profile.username}/follower`}>
            <Stat label="Followers" value={profile.follower_count} />
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 flex flex-col gap-12">
          <Section title="FAVORITES GAMES">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {profile.favorites.map((item) => {
                const game = mapToGame(item);
                return (
                  <Link key={game.id} href={game.href}>
                    <img
                      src={game.cover}
                      alt={game.name}
                      className="w-full aspect-[3/4] object-cover rounded-md shadow-md transition-transform hover:scale-105"
                    />
                  </Link>
                );
              })}
            </div>
          </Section>

          <Section title="RECENTLY PLAYED">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {profile.recently_played.map((item) => {
                const game = mapToGame(item);
                return (
                  <Link key={game.id} href={game.href}>
                    <img
                      src={game.cover}
                      alt={game.name}
                      className="w-full aspect-[3/4] object-cover rounded-md shadow-md transition-transform hover:scale-105"
                    />
                  </Link>
                );
              })}
            </div>
          </Section>
        </div>

        <div className="flex flex-col gap-4">
          <Section title="GAMELIST">
            <div className="flex gap-2 flex-wrap">
              {profile.game_list_preview.map((item) => (
                <Link key={item.id} href={`/lists`}>
                  <img
                    src={item.cover}
                    alt={item.name}
                    className="w-[100px] md:w-[120px] aspect-[2/3] object-cover rounded-md shadow-md"
                  />
                </Link>
              ))}
            </div>
          </Section>

          <Link href={`/profile/${profile.username}/activity`}>
            <div className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm text-center">
              Go to {profile.username}&apos;s Diary
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center w-24">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}
