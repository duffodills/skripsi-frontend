// pages/profile/[username]/activity/index.tsx

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { format } from "date-fns";
import { AlignJustify } from "lucide-react";
import { DiaryEntry } from "@/interfaces/api/ListsOfApiInterface";
import { fetchUserDiary } from "lib/api";
import { useAuth } from "@/context/AuthContext"; // opsional jika kamu ingin fetch diary privat

export default function PublicDiaryPage() {
  const router = useRouter();
  const { username } = router.query as { username?: string };
  const { token } = useAuth(); // <-- opsional, hapus jika diary selalu public

  const [entries, setEntries] = useState<DiaryEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;
    fetchUserDiary(username, token ?? undefined)
      .then((data) => {
        const sorted = data.sort(
          (a, b) =>
            new Date(b.played_at).getTime() - new Date(a.played_at).getTime()
        );
        setEntries(sorted);
      })
      .catch(() => setError("Gagal memuat diary"));
  }, [username, token]);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!username) return <p>Loading username...</p>;
  if (entries === null) return <p>Loading diary...</p>;

  let lastGroup = "";

  return (
    <div className="min-h-screen bg-[#11161D] text-gray-100">
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">{username}&apos;s Diary</h1>

        {/* DESKTOP */}
        <div className="hidden md:block">
          <div
            className="bg-gray-800 rounded text-gray-400 uppercase text-sm mb-2 px-3 py-3 grid"
            style={{
              gridTemplateColumns: "6rem 3rem 1fr 7rem 5rem 4rem",
              gap: "1rem",
            }}
          >
            <div>Month</div>
            <div>Day</div>
            <div>Games</div>
            <div>Released</div>
            <div>Rating</div>
            <div>Review</div>
          </div>

          {entries.length > 0 ? (
            <table className="w-full text-left">
              <tbody>
                {entries.map((entry) => {
                  const playedDate = new Date(entry.played_at);
                  const groupKey = format(playedDate, "yyyy-MM");
                  const showGroup = groupKey !== lastGroup;
                  lastGroup = groupKey;

                  const releaseYear = entry.game.first_release_date
                    ? new Date(entry.game.first_release_date).getFullYear().toString()
                    : "-";

                  const detailUrl = `/profile/${username}/activity/${entry.id}`;

                  return (
                    <tr key={entry.id} className="border-none">
                      <td colSpan={6} className="py-2 px-0 align-top">
                        <div
                          className="bg-gray-800 rounded shadow p-3 transition-all grid items-center"
                          style={{
                            gridTemplateColumns: "6rem 3rem 1fr 7rem 5rem 4rem",
                            gap: "1rem",
                          }}
                        >
                          <div className="text-blue-300 font-bold text-left">
                            {showGroup && (
                              <>
                                {format(playedDate, "LLL").toUpperCase()}
                                <br />
                                <span className="text-xs">
                                  {format(playedDate, "yyyy")}
                                </span>
                              </>
                            )}
                          </div>
                          <div className="text-center">
                            {format(playedDate, "dd")}
                          </div>
                          <div className="flex items-center gap-2 min-w-[120px]">
                            <img
                              src={entry.game.cover_url}
                              alt={entry.game.name}
                              className="w-10 aspect-[3/4] object-cover rounded"
                            />
                            <Link
                              href={detailUrl}
                              className="font-semibold hover:text-blue-400 transition"
                              title={entry.game.name}
                            >
                              {entry.game.name}
                            </Link>
                          </div>
                          <div className="text-center">{releaseYear}</div>
                          <div className="text-yellow-400 text-center">
                            {"★".repeat(entry.rating)}
                          </div>
                          <div className="flex gap-2 justify-center">
                            <Link
                              href={detailUrl}
                              className="hover:text-blue-400"
                              title="Lihat review"
                            >
                              <AlignJustify size={18} />
                            </Link>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="bg-gray-800 rounded shadow h-60 flex items-center justify-center">
              <span className="text-gray-400 text-lg">No Diary Entry</span>
            </div>
          )}
        </div>

        {/* MOBILE */}
        <div className="flex flex-col gap-4 md:hidden">
          {entries.length > 0 ? (
            entries.map((entry) => {
              const playedDate = new Date(entry.played_at);
              const releaseYear = entry.game.first_release_date
                ? new Date(entry.game.first_release_date).getFullYear().toString()
                : "-";
              const detailUrl = `/profile/${username}/activity/${entry.id}`;

              return (
                <div
                  key={entry.id}
                  className="bg-gray-800 rounded-xl shadow p-4 flex flex-col gap-2"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={entry.game.cover_url}
                      alt={entry.game.name}
                      className="w-12 aspect-[3/4] object-cover rounded"
                    />
                    <div>
                      <Link
                        href={detailUrl}
                        className="font-bold hover:text-blue-400 transition"
                        title={entry.game.name}
                      >
                        {entry.game.name}
                      </Link>
                      <div className="text-sm text-gray-400">
                        {format(playedDate, "dd LLL yyyy")}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap text-sm gap-2">
                    <span>
                      <span className="text-gray-400">Released:</span> {releaseYear}
                    </span>
                    <span>
                      <span className="text-gray-400">Rating:</span>{" "}
                      <span className="text-yellow-400">
                        {"★".repeat(entry.rating)}
                      </span>
                    </span>
                    <span>
                      <span className="text-gray-400">Review:</span>{" "}
                      <button
                        onClick={() => router.push(detailUrl)}
                        className="ml-1 hover:text-blue-400"
                        title="Lihat review"
                      >
                        <AlignJustify size={18} />
                      </button>
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-gray-800 rounded shadow p-6 text-center">
              <span className="text-gray-400 text-lg">No Diary Entry</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
