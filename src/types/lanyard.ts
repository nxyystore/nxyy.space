export interface LanyardData {
  discord_user: {
    id: string;
    username: string;
    global_name: string;
    display_name: string;
    avatar: string;
    avatar_decoration_data: {
      asset: string;
    } | null;
    primary_guild: {
      tag: string | null;
      identity_guild_id: string;
      badge: string | null;
      identity_enabled: boolean;
    };
  };
  discord_status: "online" | "dnd" | "idle" | "offline";
  listening_to_spotify: boolean;
  spotify?: {
    track_id: string;
    timestamps: {
      start: number;
      end: number;
    };
    song: string;
    artist: string;
    album_art_url: string;
    album: string;
  };
  activities: Activity[];
}

export interface LanyardResponse {
  data: LanyardData;
  success: boolean;
}

export interface LanyardWebSocketMessage {
  op: number;
  d: LanyardData | { user_ids: string[] } | null;
  t: string | null;
}

export interface Activity {
  id: string;
  name: string;
  type: number;
  state?: string;
  details?: string;
  timestamps?: {
    start?: number;
    end?: number;
  };
  assets?: {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
  };
  application_id?: string;
}
