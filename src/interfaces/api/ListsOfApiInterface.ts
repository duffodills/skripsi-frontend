export interface LoginResponse{
  token: string;
  username: string;
  profile_picture_url?: string;
}

export interface CreateDiaryBody {
  game_id: number;
  platform: string; // e.g. "PC", "Playstation5", etc.
  status: "completed" | "in-progress" | "dropped";
  rating: number; // 1–5
  review: string;
  played_at: string; // ISO date, e.g. "2024-04-15"
  liked: boolean;
}

export interface UpdateDiaryBody {
  platform: string;
  status: "completed" | "in-progress" | "dropped";
  rating: number;
  review: string;
  played_at: string;  // format: 'YYYY-MM-DD'
  liked: boolean;
}

export interface ForumThread {
  id: number;
  title: string;
  author: string;
  content: string;
  replies_count: number;
  user: {
    id: number;
    username: string;
    profile_picture_url: string;
  };
  // add any other fields your backend returns
}

export interface FetchForumThreadsBySlugOpts {
  slug: string;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: string;
}

export interface NewReplyBody {
  content: string;
}



export interface Reply {
  id: number;
  content: string;
  created_at: string;
  user: {
    id: number;
    username: string;
    profile_picture_url: string;
  };
}

export interface CreateThreadBody {
  title: string;
  content: string;
}

export interface ForumThread { 
  id: number;
  title: string;
  content: string;
  user_id: number;
  game_local_id: number;
  created_at: string;
  updated_at: string;
  likes_count: number;
  replies_count: number;
}

export interface GameLocal {
  id: number;
  igdb_id: number;
  slug: string;
  name: string;
  cover_url: string;
  // …any other fields…
}

export interface UserList {
  id: number;
  name: string;
  slug: string;
  description: string;
  // games: GameLocal[];
  username: string;
  items: {
    id: number;
    game_list_id: number;
    game_local_id: number;
    game: {
      id: number;
      igdb_id: number;
      name: string;
      cover_url: string;
      slug: string;
    };
  }[];
}

export interface CreateListBody {
  name: string;
  description: string;
  game_ids: number[];
}

// src/interfaces/api/ListsOfApiInterface.ts
export interface FollowingUser {
  id: number
  username: string
  firstname: string
  lastname: string
  profile_picture: string | null
  profile_picture_url: string | null
}

export interface FollowerUser {
  id: number
  username: string
  firstname: string
  lastname: string
  profile_picture: string | null
  profile_picture_url: string | null
}

export interface ProfileResponse {
  id: number
  email: string | null 
  username: string
  firstname: string
  lastname: string
  bio: string | null
  profile_picture: string | null
  profile_picture_url: string | null 
  follower_count: number
  following_count: number
  game_list_count: number
  diary_count: number
  wishlist_count: number
  played_game_count: number
  favorites: {
    id: number 
    igdb_id: number
    name: string
    slug?: string
    cover_url: string
  }[]
  recently_played: {
    game : {
      id: number
    igdb_id: number
    name: string
    // slug?: string
    cover_url: string
    }
  }[]
  game_list_preview: {
    id: number
    igdb_id: number
    name: string
    slug?: string
    cover: string
  }[]
  // kalau ada properti lain (misal lists), tambahkan juga di sini
}

export interface SearchForum{
  id: number,
  name: string,
  slug: string,
  cover: string
}

export interface DiaryDetail {
  id: number;
  platform: string;
  rating: number;           // 1–5
  review: string;
  play_duration: number;    // jam bermain, e.g. 97
  game: {
    igdb_id: number;
    name: string;
    cover_url: string;
  };
  user: {
    id: number;
    username: string;
  };
  comments: {
    id: number;
    content: string;
    user: { username: string };
  }[];
}

// interfaces/DiaryEntry.ts

export interface DiaryEntry {
  id: number;
  played_at: string;
  platform?: string;
  status?: string;
  rating: number;
  review: string | null;
  replay_count?: number;
  liked?: number;
  likes_count?: number;
  is_liked: boolean;
  is_replay?: number;
  game: {
    igdb_id: number;
    name: string;
    slug: string;
    cover_url: string;
    first_release_date?: string;
  };
}


export interface ActivityDetail {
  id: number
  played_at: string
  platform: string
  rating: number
  review: string | null
  game: {
    igdb_id: number
    name: string
    cover_url: string
  }
  comments: {
    id: number
    content: string
    user: { username: string }
  }[]
}

export interface DiaryComment {
  id: number;
  content: string;
  created_at: string;
  user?: {
    id: number;
    username: string;
    profile_picture_url: string | null;
  };
}

export interface WishlistItem {
  game_list_id: number;
  game_local_id: number;
  igdb_id: number;
  name: string;
  cover_url: string;
  first_release_year: string;
}

export interface GameList {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  games_count?: number;
  created_at: string;
  updated_at: string;
  items: {
    game: {
      igdb_id: number;
    };
  }[];
}

