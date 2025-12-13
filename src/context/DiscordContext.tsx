"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { LanyardData } from "@/types/lanyard";
import { lanyardService } from "@/lib/lanyard";
import { TEAM_MEMBERS } from "@/lib/users";

type DiscordUser = {
  discord_user: {
    avatar: string;
    id: string;
    global_name: string;
    username: string;
    avatar_decoration_data: {
      asset: string;
    } | null;
  };
};

type DiscordContextType = {
  user: DiscordUser | null;
  loading: boolean;
  teamPresences: Record<string, LanyardData>;
  teamLoading: boolean;
};

const DiscordContext = createContext<DiscordContextType>({
  user: null,
  loading: true,
  teamPresences: {},
  teamLoading: true,
});

export function DiscordProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [teamPresences, setTeamPresences] = useState<
    Record<string, LanyardData>
  >({});
  const [teamLoading, setTeamLoading] = useState(true);
  const discordId = "YOUR_DISCORD_ID_HERE";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://api.lanyard.rest/v1/users/${discordId}`
        );
        const json = await response.json();
        if (json.success) {
          setUser(json.data);
        }
      } catch (error) {
        console.error("Discord fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const userIds = TEAM_MEMBERS.map((member) => member.discordId);

    const fetchInitialPresences = async () => {
      const presences: Record<string, LanyardData> = {};

      for (const userId of userIds) {
        const presence = await lanyardService.fetchPresence(userId);
        if (presence) {
          presences[userId] = presence;
        }
      }

      setTeamPresences(presences);
      setTeamLoading(false);
    };

    fetchInitialPresences();

    lanyardService.subscribe(userIds, {
      onPresenceUpdate: (userId, data) => {
        setTeamPresences((prev) => ({
          ...prev,
          [userId]: data,
        }));
      },
      onConnect: () => {
        console.log("Connected to Lanyard");
      },
      onDisconnect: () => {
        console.log("Disconnected from Lanyard");
      },
    });

    return () => {
      lanyardService.disconnect();
    };
  }, []);

  return (
    <DiscordContext.Provider
      value={{ user, loading, teamPresences, teamLoading }}
    >
      {children}
    </DiscordContext.Provider>
  );
}

export function useDiscord() {
  return useContext(DiscordContext);
}
