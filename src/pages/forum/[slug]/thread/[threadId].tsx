import { GetServerSideProps } from "next";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import {
  getGameBySlug,
  fetchThreadById,
  createForumReply,
  likeThread,
  unlikeThread,
} from "lib/api";
import { ForumThread, Reply } from "@/interfaces/api/ListsOfApiInterface";

interface Game {
  slug: string;
  name: string;
  cover: string;
}
interface Props {
  game: Game;
  thread: ForumThread & { replies: Reply[]; likes_count?: number; is_liked?: boolean };
}

export const getServerSideProps: GetServerSideProps<Props, { slug: string; threadId: string }> = async ({ params }) => {
  if (!params) return { notFound: true };

  const { slug, threadId } = params;
  const tid = parseInt(threadId, 10);
  if (isNaN(tid)) return { notFound: true };

  try {
    const game = await getGameBySlug(slug);
    const thread = await fetchThreadById(slug, tid);
    return { props: { game, thread } };
  } catch (error) {
    console.error("Error loading thread detail:", error);
    return { notFound: true };
  }
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return (
    d.toLocaleString(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    })
  );
}

export default function ThreadReplyPage({ game, thread }: Props) {
  const router = useRouter();
  const { isAuthenticated, token, loading: authLoading } = useAuth();

  const [likeLoading, setLikeLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(thread.is_liked ?? false);
  const [likesCount, setLikesCount] = useState(thread.likes_count ?? 0);

  useEffect(() => {
    if (!token || !thread.id) return;
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/forum/${thread.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-API-KEY": process.env.NEXT_PUBLIC_API_KEY || "",
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setIsLiked(data.data?.data?.is_liked ?? false);
        setLikesCount(data.data?.data?.likes_count ?? 0);
      });
  }, [token, thread.id]);


  const [replies, setReplies] = useState<Reply[]>(thread.replies || []);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hydration fix
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const handleLike = async () => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setLikeLoading(true);
    try {
      if (isLiked) {
        await unlikeThread(thread.id, token!);
        setIsLiked(false);
        setLikesCount((c) => Math.max(0, c - 1));
      } else {
        await likeThread(thread.id, token!);
        setIsLiked(true);
        setLikesCount((c) => c + 1);
      }
    } catch (e: any) {
      // Optionally show error
    } finally {
      setLikeLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const newReply = await createForumReply(thread.id, { content }, token!);
      setReplies((prev) => [...prev, newReply]);
      setContent("");
    } catch (e: any) {
      setError(e.message || "Failed to post reply");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#11161D] text-white">
      <main className="container mx-auto p-4 flex gap-6">
        {/* Left column */}
        <div className="flex-1 space-y-6">
          <h1 className="text-2xl font-bold">Discussion</h1>
          {/* Original thread */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-4xl font-semibold">{thread.title}</h2>
            {/* Thread creator */}
            <div className="flex items-center gap-2 mb-3 mt-2">
              <img
                src={thread.user.profile_picture_url ?? "/avatars/default.jpg"}
                alt={thread.user.username}
                className="w-7 h-7 rounded-full"
              />
              <span className="text-gray-300 text-base">
                by <span className="font-medium">{thread.user.username}</span>
              </span>
              {hydrated && (
                <span className="text-xs text-gray-400 ml-2">
                  {formatDate(thread.created_at)}
                </span>
              )}
            </div>
            <p className="mt-2 text-gray-200">{thread.content}</p>
            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={likeLoading}
              className={`mt-4 flex items-center gap-2 px-3 py-1 rounded-lg ${
                isLiked ? "bg-pink-600 hover:bg-pink-700" : "bg-gray-700 hover:bg-gray-600"
              } transition-all`}
            >
              {isLiked ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>
              )}
              <span>{likesCount} {likesCount === 1 ? "Like" : "Likes"}</span>
            </button>
          </div>

          {/* Replies */}
          <div className="space-y-4">
            {replies.length === 0 && <p className="text-gray-400">No replies yet.</p>}
            {replies.map((r) => (
              <div key={r.id} className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <img
                    src={r.user.profile_picture_url}
                    alt={r.user.username}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-white">{r.user.username}</p>
                    {hydrated && (
                      <p className="text-xs text-gray-400">
                        {formatDate(r.created_at)}
                      </p>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-gray-200">{r.content}</p>
              </div>
            ))}
          </div>

          {/* Reply form */}
          <textarea
            rows={4}
            className="w-full bg-gray-700 text-white p-3 rounded-md resize-none"
            placeholder="Comment your reply…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          {error && <p className="text-red-400">{error}</p>}
          <div className="flex justify-end gap-2">
            <button
              onClick={() => router.back()}
              disabled={loading}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || authLoading}
              className={`px-4 py-2 rounded text-white ${
                loading || authLoading
                  ? "bg-gray-500"
                  : "bg-blue-600 hover:bg-blue-500"
              }`}
            >
              {loading ? "Submitting…" : "Submit"}
            </button>
          </div>
        </div>

        {/* Right column: cover */}
        <div className="hidden lg:block w-1/4">
          <img src={game.cover} alt={game.name} className="rounded-lg shadow-lg" />
        </div>
      </main>
    </div>
  );
}
