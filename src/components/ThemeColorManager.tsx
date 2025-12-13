"use client";

import { useColor } from "@/context/ColorContext";
import { useEffect } from "react";

export default function ThemeColorManager() {
  const { palette } = useColor();

  useEffect(() => {
    let themeColorMeta = document.querySelector(
      'meta[name="theme-color"]'
    ) as HTMLMetaElement | null;
    let safariThemeColorMeta = document.querySelector(
      'meta[name="apple-mobile-web-app-status-bar-style"]'
    ) as HTMLMetaElement | null;
    let appleMobileWebAppCapableMeta = document.querySelector(
      'meta[name="apple-mobile-web-app-capable"]'
    ) as HTMLMetaElement | null;

    if (!themeColorMeta) {
      themeColorMeta = document.createElement("meta");
      themeColorMeta.name = "theme-color";
      document.head.appendChild(themeColorMeta);
    }

    if (!safariThemeColorMeta) {
      safariThemeColorMeta = document.createElement("meta");
      safariThemeColorMeta.name = "apple-mobile-web-app-status-bar-style";
      document.head.appendChild(safariThemeColorMeta);
    }

    if (!appleMobileWebAppCapableMeta) {
      appleMobileWebAppCapableMeta = document.createElement("meta");
      appleMobileWebAppCapableMeta.name = "apple-mobile-web-app-capable";
      appleMobileWebAppCapableMeta.content = "yes";
      document.head.appendChild(appleMobileWebAppCapableMeta);
    }

    let color: string;
    if (palette?.accent) {
      const [r, g, b] = palette.accent;
      color = `rgb(${r}, ${g}, ${b})`;
    } else {
      color = "#18181A";
    }

    themeColorMeta.content = color;
    safariThemeColorMeta.content = color;
  }, [palette]);

  return null;
}
