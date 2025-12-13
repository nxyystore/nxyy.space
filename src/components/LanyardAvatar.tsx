"use client";

import { useColor } from "@/context/ColorContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DATA } from "@/data/resume";
import { useTheme } from "next-themes";

export default function LanyardAvatar() {
  const { theme } = useTheme();
  const avatarUrl = DATA.avatarUrl(theme || "light");

  return (
    <div style={{ transform: "translateY(6px)" }}>
      <Avatar className="size-28">
        <AvatarImage alt={DATA.name} src={avatarUrl} />
        <AvatarFallback>{DATA.initials}</AvatarFallback>
      </Avatar>
    </div>
  );
}
