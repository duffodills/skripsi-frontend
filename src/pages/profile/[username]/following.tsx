import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import FollowingList from "@/components/FollowingList";

export default function PublicFollowingPage() {
  const router = useRouter();
  const { isReady, query } = router;
  const { username } = query;

  const [readyUsername, setReadyUsername] = useState<string | null>(null);

  useEffect(() => {
    if (isReady && typeof username === "string") {
      setReadyUsername(username);
    }
  }, [isReady, username]);

  if (!readyUsername) {
    return <div className="p-8 text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#11161D] text-gray-100">
      <h1 className="text-2xl font-semibold p-8">
        {readyUsername}&apos;s Following
      </h1>
      <FollowingList username={readyUsername} />
    </div>
  );
}
