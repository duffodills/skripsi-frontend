import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { DiaryEntry } from "@/interfaces/api/ListsOfApiInterface";
import { fetchUserDiary } from "lib/api";
import { format } from "date-fns";
import { useRouter } from "next/router";
import { Pencil, Trash, AlignJustify } from "lucide-react";
import EditReviewModal from "@/components/EditReviewModal";
import DeleteReviewConfirmModal from "@/components/DeleteReviewConfirmModal";

export default function DiaryPage() {
  const { user, token } = useAuth();
  const [entries, setEntries] = useState<DiaryEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editEntry, setEditEntry] = useState<DiaryEntry | null>(null);
  const [deleteEntry, setDeleteEntry] = useState<DiaryEntry | null>(null);
  const router = useRouter();

  const reloadDiary = () => {
    if (!user || !token) return;
    fetchUserDiary(user.username, token).then((data) => {
      const sorted = data.sort(
        (a, b) =>
          new Date(b.played_at).getTime() -
          new Date(a.played_at).getTime()
      );
      setEntries(sorted);
    });
  };

  useEffect(() => {
    if (!user || !token) return;
    fetchUserDiary(user.username, token)
      .then((data) => {
        const sorted = data.sort(
          (a, b) =>
            new Date(b.played_at).getTime() -
            new Date(a.played_at).getTime()
        );
        setEntries(sorted);
      })
      .catch(() => setError("Gagal memuat diary"));
  }, [user, token]);

  if (!user || !token) return <p>Belum login</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (entries === null) return <p>Loading…</p>;

  let lastGroup = "";

  return (
    <div className="min-h-screen bg-[#11161D] text-gray-100">
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Diary</h1>

        {/* DESKTOP */}
        <div className="hidden md:block">
          {/* header */}
          <div
            className="bg-gray-800 rounded text-gray-400 uppercase text-sm mb-2 px-3 py-3 grid"
            style={{
              gridTemplateColumns: "6rem 3rem 1fr 7rem 5rem 4rem 6rem",
              gap: "1rem",
            }}
          >
            <div>Month</div>
            <div>Day</div>
            <div>Games</div>
            <div>Released</div>
            <div>Rating</div>
            <div>Review</div>
            <div className="text-center">Edit</div>
          </div>

          {entries.length > 0 ? (
            <table className="w-full text-left">
              <tbody>
                {entries.map((entry) => {
                  const playedDate = new Date(entry.played_at);
                  const groupKey = format(playedDate, "yyyy-MM");
                  const showGroup = groupKey !== lastGroup;
                  lastGroup = groupKey;

                  let releaseYear = "-";
                  if (entry.game.first_release_date) {
                    const d = new Date(entry.game.first_release_date);
                    if (!isNaN(d.getTime())) {
                      releaseYear = d.getFullYear().toString();
                    }
                  }

                  const gameUrl = entry.game.slug
                    ? `/games/${entry.game.slug}`
                    : `/games/${entry.game.igdb_id}`;

                  return (
                    <tr key={entry.id} className="border-none">
                      <td colSpan={7} className="py-2 px-0 align-top">
                        <div
                          className="bg-gray-800 rounded shadow p-3 transition-all grid items-center"
                          style={{
                            gridTemplateColumns:
                              "6rem 3rem 1fr 7rem 5rem 4rem 6rem",
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
                              href={gameUrl}
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
                            <button
                              title="Lihat review"
                              className="hover:text-blue-400"
                              onClick={() =>
                                router.push(`/activity/${entry.id}`)
                              }
                            >
                              <AlignJustify size={18} />
                            </button>
                          </div>
                          <div className="flex gap-2 justify-center">
                            <button
                              className="hover:text-yellow-400"
                              onClick={() => setEditEntry(entry)}
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              className="hover:text-red-500"
                              onClick={() => setDeleteEntry(entry)}
                            >
                              <Trash size={18} />
                            </button>
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
              <span className="text-gray-400 text-lg">
                No Diary Entry
              </span>
            </div>
          )}
        </div>

        {/* MOBILE */}
        <div className="flex flex-col gap-4 md:hidden">
          {entries.length > 0 ? (
            entries.map((entry) => {
              const playedDate = new Date(entry.played_at);
              let releaseYear = "-";
              if (entry.game.first_release_date) {
                const d = new Date(entry.game.first_release_date);
                if (!isNaN(d.getTime())) {
                  releaseYear = d.getFullYear().toString();
                }
              }
              const gameUrl = entry.game.slug
                ? `/games/${entry.game.slug}`
                : `/games/${entry.game.igdb_id}`;

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
                        href={gameUrl}
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
                      <span className="text-gray-400">Released:</span>{" "}
                      {releaseYear}
                    </span>
                    <span>
                      <span className="text-gray-400">Rating:</span>{" "}
                      <span className="text-yellow-400">
                        {"★".repeat(entry.rating)}
                      </span>
                    </span>
                    <span>
                      <span className="text-gray-400">Review:</span>
                      <button
                        title="Lihat review"
                        className="ml-1 hover:text-blue-400"
                        onClick={() =>
                          router.push(`/activity/${entry.id}`)
                        }
                      >
                        <AlignJustify size={18} />
                      </button>
                    </span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      className="hover:text-yellow-400"
                      onClick={() => setEditEntry(entry)}
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      className="hover:text-red-500"
                      onClick={() => setDeleteEntry(entry)}
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-gray-800 rounded shadow p-6 text-center">
              <span className="text-gray-400 text-lg">
                No Diary Entry
              </span>
            </div>
          )}
        </div>
      </div>

      <EditReviewModal
        diary={editEntry}
        isOpen={!!editEntry}
        onClose={() => setEditEntry(null)}
        onSuccess={() => {
          setEditEntry(null);
          reloadDiary();
        }}
      />
      <DeleteReviewConfirmModal
        isOpen={!!deleteEntry}
        onClose={() => setDeleteEntry(null)}
        diaryId={deleteEntry?.id ?? 0}
        gameName={deleteEntry?.game.name ?? ""}
        onDeleted={() => {
          setDeleteEntry(null);
          reloadDiary();
        }}
      />
    </div>
  );
}
