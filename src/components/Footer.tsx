"use client";

import type { DragEvent } from "react";
import { DATA } from "@/data/resume";
import { useTheme } from "next-themes";
import Image from "next/image";
import logo_256x256 from "@/assets/aelix/white/logo_256x256.png";
import i_logo_256x256 from "@/assets/aelix/dark/i_logo_256x256.png";
import BlurFade from "@/components/magicui/blur-fade";

const BLUR_FADE_DELAY = 0.04;

export default function Footer() {
  const { resolvedTheme } = useTheme();

  const handleDragStart = (e: DragEvent) => {
    e.preventDefault();
  };

  return (
    <footer
      className="border-t border-border/50 mt-20 pt-8 select-none"
      style={{
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
        userSelect: "none",
      }}
      onDragStart={handleDragStart}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <BlurFade delay={BLUR_FADE_DELAY * 13}>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            onDragStart={handleDragStart}
            draggable={false}
            className="flex items-center gap-3 text-sm font-medium"
            aria-label="nxyy.space"
          >
            {/*<Image
              src={
                (resolvedTheme || "dark") === "dark"
                  ? logo_256x256
                  : i_logo_256x256
              }
              alt="nxyy.space"
              width={24}
              height={24}
              className="w-6 h-6"
              draggable={false}
              onDragStart={handleDragStart}
            />/*/}
            <span>nxyy.space</span>
          </a>
        </BlurFade>

        <BlurFade delay={BLUR_FADE_DELAY * 14}>
          <div className="flex items-center gap-2">
            {Object.entries(DATA.contact.social).map(([name, social], id) => {
              const Icon = social.icon;
              return (
                <BlurFade key={name} delay={BLUR_FADE_DELAY * 14 + id * 0.05}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onDragStart={handleDragStart}
                    draggable={false}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1"
                    aria-label={name}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </a>
                </BlurFade>
              );
            })}
          </div>
        </BlurFade>
      </div>
    </footer>
  );
}
