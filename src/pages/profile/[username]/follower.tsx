import { useRouter } from "next/router";
import FollowerList from "@/components/FollowerList";

export default function PublicFollowerPage() {
  const { username } = useRouter().query as { username: string };

  return (
    <div className="min-h-screen bg-[#11161D] text-gray-100">
      <h1 className="text-2xl font-semibold p-8">{username}&apos;s Follower</h1>
      <FollowerList username={username} />
    </div>
  );
}
