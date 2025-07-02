import { useRef } from "react";
import GameCard from "@/components/Gamecard";
import { Game } from "@/interfaces/Game";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

type GameListProps = {
  games: Game[];
};

export default function GameList({ games }: GameListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -clientWidth : clientWidth,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative">
      {/* Button Kiri */}
      <button
        className="hidden md:flex absolute left-2 top-1/2 z-10 -translate-y-1/2 bg-[#222c3c]/80 text-white rounded-full p-2 hover:bg-blue-500 transition"
        onClick={() => scroll("left")}
        aria-label="Scroll left"
        style={{ pointerEvents: "auto" }}
        type="button"
      >
        <ChevronLeftIcon className="h-8 w-8" />
      </button>

      {/* Button Kanan */}
      <button
        className="hidden md:flex absolute right-2 top-1/2 z-10 -translate-y-1/2 bg-[#222c3c]/80 text-white rounded-full p-2 hover:bg-blue-500 transition"
        onClick={() => scroll("right")}
        aria-label="Scroll right"
        style={{ pointerEvents: "auto" }}
        type="button"
      >
        <ChevronRightIcon className="h-8 w-8" />
      </button>

      {/* SCROLLABLE LIST */}
      <div ref={scrollRef} className="overflow-x-auto hide-scrollbar">
        <div className="flex gap-4 w-fit px-2">
          {games.map((game) => (
            <div key={game.igdb_id} className="flex-shrink-0 w-[200px]">
              <GameCard
                key={game.slug}
                slug={game.slug}
                name={game.name}
                cover={game.cover}
                href={`/games/${game.slug}`}
                game={game}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
