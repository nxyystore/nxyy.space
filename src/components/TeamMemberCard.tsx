"use client";

import { LanyardData, Activity } from "@/types/lanyard";
import { TeamMember } from "@/lib/users";
import { useTheme } from "next-themes";
import { useEffect, useState, useCallback, useRef } from "react";
import { colorExtraction } from "@/lib/color-extraction";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

import dnd from "@/assets/icons/status/dnd.png";
import idle from "@/assets/icons/status/idle.png";
import offline from "@/assets/icons/status/offline.png";
import online from "@/assets/icons/status/online.png";

interface ColorState {
  readonly background: string;
  readonly color: string;
  readonly enhancedBackground: string;
}

interface ActivityText {
  readonly primary: string;
  readonly secondary: string;
}

interface StatusIcons {
  readonly [key: string]: string;
}

interface TeamMemberCardProps {
  readonly member: TeamMember;
  readonly presence: LanyardData | null;
}

class DiscordService {
  private static readonly STATUS_ICONS: StatusIcons = {
    online: online.src,
    idle: idle.src,
    dnd: dnd.src,
    offline: offline.src,
  };

  public static getStatusIcon(status: string): string {
    return this.STATUS_ICONS[status] || this.STATUS_ICONS.offline;
  }

  public static getPriorityActivity(activities: Activity[]): Activity | null {
    if (!activities?.length) return null;
    return (
      activities.find((a) => a.name === "Spotify") ||
      activities.sort((a, b) => a.name.localeCompare(b.name))[0]
    );
  }

  public static formatActivityText(activity: Activity): ActivityText {
    if (activity.name === "Spotify") {
      const song =
        activity.assets?.large_text || activity.details || "Unknown Song";
      const artist = (activity.state || "Unknown Artist").replace(/;/g, ",");
      return { primary: song, secondary: artist };
    }
    return {
      primary: activity.name,
      secondary: activity.details || activity.state || "",
    };
  }

  public static getAvatarUrl(user: LanyardData["discord_user"]): string {
    return user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`
      : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.id) % 6}.png`;
  }

  public static getAvatarDecorationUrl(asset: string): string {
    return `https://cdn.discordapp.com/avatar-decoration-presets/${asset}.png?size=96`;
  }

  public static getGuildBadgeUrl(guildId: string, badge: string): string {
    return `https://cdn.discordapp.com/guild-tag-badges/${guildId}/${badge}.webp`;
  }

  public static getActivityImageUrl(activity: Activity): string | null {
    if (!activity.assets?.large_image) return null;

    try {
      const { large_image } = activity.assets;

      if (large_image.startsWith("mp:")) {
        return large_image.replace("mp:", "");
      }

      if (large_image.startsWith("spotify:")) {
        return `https://i.scdn.co/image/${large_image.split(":")[1]}`;
      }

      if (activity.application_id) {
        return `https://cdn.discordapp.com/app-assets/${activity.application_id}/${large_image}.png`;
      }

      if (large_image.startsWith("http")) {
        return large_image;
      }

      return null;
    } catch {
      return null;
    }
  }

  public static openUserProfile(userId: string): void {
    window.open(
      `https://discord.com/users/${userId}`,
      "_blank",
      "noopener,noreferrer"
    );
  }
}

interface CardState {
  readonly colors: ColorState | null;
  readonly activityText: ActivityText | null;
  readonly activityImageUrl: string | null;
  readonly key: number;
}

export function TeamMemberCard({ member, presence }: TeamMemberCardProps) {
  const { theme } = useTheme();
  const [cardState, setCardState] = useState<CardState>({
    colors: null,
    activityText: null,
    activityImageUrl: null,
    key: 0,
  });
  const debounceRef = useRef<NodeJS.Timeout>();

  const handleCardClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (!presence?.discord_user?.id) return;
      DiscordService.openUserProfile(presence.discord_user.id);
    },
    [presence?.discord_user?.id]
  );

  const updateCardState = useCallback(
    (
      colors: ColorState,
      activityText: ActivityText | null,
      activityImageUrl: string | null
    ) => {
      setCardState((prev) => ({
        colors,
        activityText,
        activityImageUrl,
        key: prev.key + 1,
      }));
    },
    []
  );

  const processPresenceUpdate = useCallback(async () => {
    if (!presence) return;

    const { discord_user, activities } = presence;
    const priorityActivity = DiscordService.getPriorityActivity(activities);
    const activityText = priorityActivity
      ? DiscordService.formatActivityText(priorityActivity)
      : null;
    const activityImageUrl = priorityActivity
      ? DiscordService.getActivityImageUrl(priorityActivity)
      : null;

    let imageUrl = DiscordService.getAvatarUrl(discord_user);
    let imageId = discord_user.id;

    if (
      priorityActivity?.name === "Spotify" &&
      priorityActivity.assets?.large_image
    ) {
      const spotifyImageUrl =
        DiscordService.getActivityImageUrl(priorityActivity);
      if (spotifyImageUrl) {
        imageUrl = spotifyImageUrl;
        imageId = `spotify-${discord_user.id}`;
      }
    }

    try {
      const colors = await colorExtraction.extractColors(imageUrl, imageId);
      const isDark = theme === "dark";
      const baseColor = isDark ? colors.light : colors.dark;
      const contrastColor = colors.contrast;

      const brightColor = isDark
        ? `rgba(${baseColor.join(",")}, 0.9)`
        : `rgba(${contrastColor.join(",")}, 0.95)`;

      const colorState: ColorState = {
        background: colorExtraction.formatCssColor(baseColor),
        color: brightColor,
        enhancedBackground: colorExtraction.formatEnhancedBackground(
          colors,
          isDark
        ),
      };

      updateCardState(colorState, activityText, activityImageUrl);
    } catch {
      try {
        const avatarUrl = DiscordService.getAvatarUrl(discord_user);
        const fallbackColors = await colorExtraction.extractColors(
          avatarUrl,
          discord_user.id
        );
        const isDark = theme === "dark";
        const baseColor = isDark ? fallbackColors.light : fallbackColors.dark;
        const brightColor = isDark
          ? `rgba(${baseColor.join(",")}, 0.8)`
          : `rgba(${fallbackColors.contrast.join(",")}, 0.9)`;

        const colorState: ColorState = {
          background: colorExtraction.formatCssColor(baseColor),
          color: brightColor,
          enhancedBackground: colorExtraction.formatEnhancedBackground(
            fallbackColors,
            isDark
          ),
        };

        updateCardState(colorState, activityText, activityImageUrl);
      } catch {
        updateCardState(
          {
            background: "rgba(255, 255, 255, 0.1)",
            color: "inherit",
            enhancedBackground:
              "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
          },
          activityText,
          activityImageUrl
        );
      }
    }
  }, [presence, theme, updateCardState]);

  useEffect(() => {
    if (!presence) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      processPresenceUpdate();
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [presence, processPresenceUpdate]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const LoadingSkeleton = () => (
    <motion.div
      className="flex overflow-hidden rounded-xl backdrop-blur-sm relative p-3 h-[72px]"
      style={{
        border: "1.5px solid transparent",
        background: "rgba(255, 255, 255, 0.1)",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3 w-full">
        <motion.div
          className="w-10 h-10 rounded-full bg-muted"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="flex-1 space-y-1">
          <motion.div
            className="h-3 bg-muted rounded"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.2,
            }}
          />
          <motion.div
            className="h-2 bg-muted rounded w-3/4"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.4,
            }}
          />
        </div>
        <motion.div
          className="w-12 h-12 bg-muted rounded flex-shrink-0"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.6,
          }}
        />
      </div>
    </motion.div>
  );

  if (!presence) {
    return <LoadingSkeleton />;
  }

  const { discord_user, discord_status } = presence;

  return (
    <motion.div
      className="flex overflow-hidden rounded-xl backdrop-blur-sm relative p-3 h-[72px] cursor-pointer select-none"
      style={{
        border: "1.5px solid transparent",
        backgroundOrigin: "border-box",
        backgroundClip: "padding-box, border-box",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
      animate={{
        backgroundImage:
          cardState.colors?.enhancedBackground ||
          "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
      }}
      transition={{
        backgroundImage: { duration: 1.2, ease: [0.4, 0, 0.2, 1] },
      }}
      onClick={handleCardClick}
      onDragStart={(e) => e.preventDefault()}
    >
      <div className="flex items-center gap-3 w-full">
        <div className="relative">
          <img
            src={DiscordService.getAvatarUrl(discord_user)}
            alt={`${discord_user.display_name} avatar`}
            className="w-10 h-10 rounded-full object-cover"
            style={{
              boxShadow:
                "0 2px 6px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.1)",
              filter: "brightness(0.92) contrast(1.05)",
            }}
            draggable={false}
          />
          {discord_user.avatar_decoration_data && (
            <img
              src={DiscordService.getAvatarDecorationUrl(
                discord_user.avatar_decoration_data.asset
              )}
              alt="Avatar decoration"
              className="absolute top-1/2 left-1/2 pointer-events-none"
              style={{
                transform: "translate(-50%, -50%) scale(1.2)",
                transformOrigin: "center center",
                objectFit: "contain",
                zIndex: 10,
                filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15))",
              }}
              draggable={false}
            />
          )}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 z-20">
            <Image
              src={DiscordService.getStatusIcon(discord_status)}
              alt={`${discord_status} status`}
              width={12}
              height={12}
              className="w-3 h-3"
              style={{
                filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))",
              }}
              draggable={false}
            />
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <AnimatePresence mode="wait">
              <motion.span
                key={`username-${cardState.key}`}
                className="font-semibold text-sm truncate max-w-[120px]"
                initial={{ opacity: 0, filter: "blur(4px)" }}
                animate={{
                  opacity: 1,
                  filter: "blur(0px)",
                  color: cardState.colors?.color || "inherit",
                }}
                exit={{ opacity: 0, filter: "blur(4px)" }}
                transition={{
                  opacity: { duration: 0.4 },
                  filter: { duration: 0.4 },
                  color: { duration: 1.2, ease: [0.4, 0, 0.2, 1] },
                }}
              >
                {discord_user.display_name ||
                  discord_user.global_name ||
                  discord_user.username}
              </motion.span>
            </AnimatePresence>
            {discord_user.primary_guild?.tag &&
              discord_user.primary_guild?.badge && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/20 flex-shrink-0">
                  <img
                    src={DiscordService.getGuildBadgeUrl(
                      discord_user.primary_guild.identity_guild_id,
                      discord_user.primary_guild.badge
                    )}
                    alt="Guild badge"
                    className="w-2.5 h-2.5 object-contain"
                    draggable={false}
                  />
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={`guild-tag-${cardState.key}`}
                      className="text-xs opacity-80 truncate max-w-[60px]"
                      initial={{ opacity: 0, filter: "blur(2px)" }}
                      animate={{
                        opacity: 0.8,
                        filter: "blur(0px)",
                        color: cardState.colors?.color || "inherit",
                      }}
                      exit={{ opacity: 0, filter: "blur(2px)" }}
                      transition={{
                        opacity: { duration: 0.4 },
                        filter: { duration: 0.4 },
                        color: { duration: 1.2, ease: [0.4, 0, 0.2, 1] },
                      }}
                    >
                      {discord_user.primary_guild.tag}
                    </motion.span>
                  </AnimatePresence>
                </div>
              )}
          </div>

          {cardState.activityText && (
            <div className="mt-0.5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`activity-primary-${cardState.key}`}
                  className="text-xs truncate opacity-90 max-w-[160px]"
                  initial={{ opacity: 0, filter: "blur(2px)" }}
                  animate={{
                    opacity: 0.9,
                    filter: "blur(0px)",
                    color: cardState.colors?.color || "inherit",
                  }}
                  exit={{ opacity: 0, filter: "blur(2px)" }}
                  transition={{
                    opacity: { duration: 0.4 },
                    filter: { duration: 0.4 },
                    color: { duration: 1.2, ease: [0.4, 0, 0.2, 1] },
                  }}
                >
                  {cardState.activityText.primary.length > 20
                    ? `${cardState.activityText.primary.substring(0, 20)}...`
                    : cardState.activityText.primary}
                </motion.div>
              </AnimatePresence>
              {cardState.activityText.secondary && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`activity-secondary-${cardState.key}`}
                    className="text-xs truncate opacity-70 max-w-[160px]"
                    initial={{ opacity: 0, filter: "blur(2px)" }}
                    animate={{
                      opacity: 0.7,
                      filter: "blur(0px)",
                      color: cardState.colors?.color || "inherit",
                    }}
                    exit={{ opacity: 0, filter: "blur(2px)" }}
                    transition={{
                      opacity: { duration: 0.4 },
                      filter: { duration: 0.4 },
                      color: { duration: 1.2, ease: [0.4, 0, 0.2, 1] },
                    }}
                  >
                    {cardState.activityText.secondary.length > 24
                      ? `${cardState.activityText.secondary.substring(
                          0,
                          24
                        )}...`
                      : cardState.activityText.secondary}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          )}
        </div>

        {cardState.activityImageUrl && (
          <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.img
                key={`activity-image-${cardState.key}-${cardState.activityImageUrl}`}
                src={cardState.activityImageUrl}
                alt="Activity"
                className="w-12 h-12 rounded object-cover"
                style={{
                  boxShadow:
                    "0 4px 8px rgba(0, 0, 0, 0.3), 0 6px 20px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                  filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))",
                }}
                initial={{
                  opacity: 0,
                  filter: "blur(4px) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))",
                }}
                animate={{
                  opacity: 1,
                  filter: "blur(0px) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))",
                }}
                exit={{
                  opacity: 0,
                  filter: "blur(4px) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))",
                }}
                transition={{
                  opacity: { duration: 0.4 },
                  filter: { duration: 0.4 },
                }}
                onError={(e) =>
                  ((e.target as HTMLImageElement).style.display = "none")
                }
                draggable={false}
              />
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}
