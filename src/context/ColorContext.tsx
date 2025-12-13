"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import type { ColorPalette } from "@/types/colors";
import ColorThief from "colorthief";
import { DATA } from "@/data/resume";
import { useTheme } from "next-themes";

type ColorContextType = {
  palette: ColorPalette | null;
  setPalette: (palette: ColorPalette | null) => void;
};

const ColorContext = createContext<ColorContextType | undefined>(undefined);

const hslToRgb = (hsl: [number, number, number]): [number, number, number] => {
  let [h, s, l] = hsl;
  h /= 360;
  s /= 100;
  l /= 100;

  const hueToRgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  if (s === 0)
    return [l, l, l].map((x) => Math.round(x * 255)) as [
      number,
      number,
      number
    ];

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return [
    hueToRgb(p, q, h + 1 / 3),
    hueToRgb(p, q, h),
    hueToRgb(p, q, h - 1 / 3),
  ].map((x) => Math.round(x * 255)) as [number, number, number];
};

const rgbToHsl = (rgb: [number, number, number]): [number, number, number] => {
  let [r, g, b] = rgb.map((x) => x / 255);
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h =
      max === r
        ? (g - b) / d + (g < b ? 6 : 0)
        : max === g
        ? (b - r) / d + 2
        : (r - g) / d + 4;
    h /= 6;
  }

  return [h * 360, s * 100, l * 100];
};

const enhanceColor = (
  color: [number, number, number],
  { saturation = 1.4, lightness = -15 } = {}
): [number, number, number] => {
  const [h, s, l] = rgbToHsl(color);
  return hslToRgb([
    h,
    Math.min(100, s * saturation),
    Math.max(15, Math.min(65, l + lightness)),
  ]);
};

export function ColorProvider({ children }: { children: React.ReactNode }) {
  const [palette, setPalette] = useState<ColorPalette | null>(null);
  const { theme } = useTheme();
  const imgRef = useRef<HTMLImageElement | null>(null);
  const avatarImgRef = useRef<HTMLImageElement | null>(null);
  const colorThief = useRef<ColorThief>(new ColorThief());

  useEffect(() => {
    const extractColors = (img: HTMLImageElement) => {
      try {
        if (img.complete && img.naturalWidth > 0) {
          const rawColors = colorThief.current.getPalette(img, 12);
          const sortedColors = rawColors
            .map((color) => ({
              color,
              score: (() => {
                const [, s, l] = rgbToHsl(color);
                return (s / 100) * (1 - Math.abs(l - 50) / 100);
              })(),
            }))
            .sort((a, b) => b.score - a.score);

          const primaryColor = sortedColors[0]?.color || [128, 128, 128];
          const secondaryColor = sortedColors[1]?.color ||
            sortedColors[0]?.color || [100, 100, 100];
          const accentColor = sortedColors[2]?.color ||
            sortedColors[1]?.color ||
            sortedColors[0]?.color || [80, 80, 80];

          setPalette({
            primary: enhanceColor(primaryColor, {
              saturation: 1.6,
              lightness: -15,
            }),
            secondary: enhanceColor(secondaryColor, {
              saturation: 1.4,
              lightness: -10,
            }),
            accent: enhanceColor(accentColor, {
              saturation: 1.8,
              lightness: -5,
            }),
            background: enhanceColor(primaryColor, {
              saturation: 1.0,
              lightness: -25,
            }),
          });
        }
      } catch (error) {
        console.error("bitch:", error);
      }
    };

    const loadImage = (url: string) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = url;

      const handleLoad = () => setTimeout(() => extractColors(img), 100);
      if (img.complete) handleLoad();
      else img.addEventListener("load", handleLoad);

      return () => img.removeEventListener("load", handleLoad);
    };

    const avatarUrl = DATA.avatarUrl(theme || "light");
    const cleanup = loadImage(avatarUrl);

    return () => cleanup?.();
  }, [theme]);

  return (
    <ColorContext.Provider value={{ palette, setPalette }}>
      {children}
    </ColorContext.Provider>
  );
}

export function useColor() {
  const context = useContext(ColorContext);
  if (!context) throw new Error("useColor must be used within a ColorProvider");
  return context;
}
