// pages/profile/[username]/activity/[id].tsx

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { DiaryComment, DiaryEntry } from "@/interfaces/api/ListsOfApiInterface";
import {
  fetchDiaryDetail,
  fetchDiaryComments,
  postDiaryComment,
  likeDiary,
  unlikeDiary,
} from "lib/api";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function formatRelease(dateStr?: string) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function PublicDiaryDetailPage() {
  const router = useRouter();
  const { username, id } = router.query as { username?: string; id?: string };
  const { token } = useAuth();

  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [comments, setComments] = useState<DiaryComment[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);

  useEffect(() => {
    if (!router.isReady || !id || Array.isArray(id) || !username) return;
    const diaryId = parseInt(id as string);

    fetchDiaryDetail(username, diaryId, token ?? undefined)
      .then((data) => {
        setEntry(data);
        setIsLiked(data.is_liked ?? false);
        setLikesCount(data.likes_count ?? 0);
      })
      .catch(() => {
        setError("Gagal mengambil detail review");
      });

    fetchDiaryComments(diaryId, token ?? undefined)
      .then((data) => {
        setComments(data);
      })
      .catch(() => {
        setComments([]);
      });
  }, [id, router.isReady, username, token]);

  useEffect(() => {
    if (entry) {
      setIsLiked(entry.is_liked ?? false);
      setLikesCount(entry.likes_count ?? 0);
    }
  }, [entry]);

  const handleLike = async () => {
    if (!entry || !token) return;
    setLikeLoading(true);
    try {
      if (isLiked) {
        await unlikeDiary(entry.id, token);
        setIsLiked(false);
        setLikesCount((c) => Math.max(0, c - 1));
      } else {
        await likeDiary(entry.id, token);
        setIsLiked(true);
        setLikesCount((c) => c + 1);
      }
      setError(null);
    } catch (e: any) {
      if (e?.response?.status === 409) {
        setError("Kamu sudah memberi like pada diary ini.");
        setIsLiked(true);
      } else {
        setError("Gagal memproses like");
      }
    } finally {
      setLikeLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!entry || !token || !commentInput.trim()) return;
    try {
      await postDiaryComment(entry.id, commentInput, token);
      setCommentInput("");
      const updatedComments = await fetchDiaryComments(entry.id, token ?? undefined);
      setComments(updatedComments);
      setError(null);
    } catch (e) {
      setError("Gagal mengirim komentar");
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#11161D] text-gray-100 p-6">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => {
            setError(null);
            router.reload();
          }}
          className="mt-4 px-4 py-2 rounded bg-blue-600 text-white"
        >
          Reload
        </button>
      </div>
    );
  }
  if (!entry) {
    return (
      <div className="min-h-screen bg-[#11161D] text-gray-100 p-6">
        <p>Loading diary…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#11161D] text-gray-100 px-2 py-4 sm:px-6">
      <div className="max-w-3xl mx-auto w-full px-0">
        <button
          onClick={() => router.back()}
          className="mb-3 sm:mb-4 flex items-center gap-2 text-gray-300 hover:text-white transition"
        >
          <span className="text-2xl">&#8592;</span>
          <span className="text-base font-medium">Back</span>
        </button>
        <div className="flex flex-row items-start gap-6 mb-8 bg-[#222B37] rounded-2xl p-8 shadow-lg w-full">
          <div className="w-32 aspect-[3/4] flex-shrink-0">
            <img
              src={entry.game?.cover_url}
              alt={entry.game?.name || "Game"}
              className="w-full h-full object-cover rounded"
              style={{ display: "block" }}
            />
          </div>
          <div className="flex-1 w-full">
            <div className="text-sm text-gray-400 mb-1 flex items-center gap-3">
              <span className="font-semibold text-base sm:text-lg text-white">
                {entry.game?.name}
              </span>
              {entry.game?.first_release_date && (
                <span className="text-xs text-gray-500">
                  Released: {formatRelease(entry.game.first_release_date)}
                </span>
              )}
            </div>
            <div className="mb-1 sm:mb-2 text-xs text-gray-400 flex items-center gap-3">
              <span>
                Status: <b className="capitalize text-white">{entry.status}</b>
              </span>
              {entry.is_replay &&
                entry.replay_count &&
                entry.replay_count > 1 && (
                  <span>
                    Replay: <b className="text-white">{entry.replay_count}</b>x
                  </span>
                )}
            </div>
            <h2 className="text font-bold mb-1">
              Review by {username}
            </h2>
            <p className="text-yellow-400 text-lg mb-1">
              {"★".repeat(entry.rating)}
            </p>
            {entry.review && entry.review.trim() !== "" && (
              <p className="italic text-base sm:text-lg mb-2 sm:mb-3">
                “{entry.review}”
              </p>
            )}
            <p className="mt-1 text-xs sm:text-sm">
              Played on <strong>{entry.platform}</strong>
              {entry.played_at && (
                <span className="ml-2 text-xs text-gray-500">
                  ({formatRelease(entry.played_at)})
                </span>
              )}
            </p>
            {/* LIKE BUTTON */}
            {token && (
              <button
                onClick={handleLike}
                disabled={likeLoading}
                className={`mt-3 flex items-center gap-2 px-3 py-1 rounded-lg ${
                  isLiked
                    ? "bg-pink-600 hover:bg-pink-700"
                    : "bg-gray-700 hover:bg-gray-600"
                } transition-all`}
              >
                {isLiked ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="white"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                    />
                  </svg>
                )}
                <span>{likesCount}</span>
              </button>
            )}
          </div>
        </div>
        {entry.review && entry.review.trim() !== "" && (
          <>
            {token && (
              <div className="mb-5 sm:mb-6">
                <textarea
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Comment your reply…"
                  className="w-full p-3 rounded text-white bg-[#2C3440] resize-none min-h-[64px] text-sm"
                />
                <div className="flex justify-end mt-2 gap-2">
                  <button
                    onClick={() => setCommentInput("")}
                    className="text-sm px-3 py-1 border rounded border-gray-500 hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="bg-blue-500 px-3 py-1 rounded hover:bg-blue-600 text-white text-sm"
                  >
                    Submit
                  </button>
                </div>
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold mb-2">Comments :</h3>
              {comments.length === 0 && (
                <p className="text-gray-400 italic">No comments yet.</p>
              )}
              {comments.map((c) => (
                <div
                  key={c.id}
                  className="mb-3 sm:mb-4 flex items-start gap-2 sm:gap-3 bg-[#222B37] rounded-lg p-3 sm:p-4"
                >
                  <img
                    src={
                      c.user?.profile_picture_url
                        ? c.user.profile_picture_url
                        : "/avatars/default.jpg"
                    }
                    alt={c.user?.username}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover mt-1"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-base m-0">
                        {c.user?.username || "Unknown User"}
                      </p>
                      <span className="text-xs text-gray-400 mt-0.5">
                        {c.created_at ? formatDate(c.created_at) : ""}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm">
                      {c.content || "(No comment)"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
