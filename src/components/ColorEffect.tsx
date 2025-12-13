"use client";

import { useColor } from "@/context/ColorContext";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

type ColorPalette = {
  primary: [number, number, number];
  secondary: [number, number, number];
  accent: [number, number, number];
  background: [number, number, number];
};

export default function ColorEffect() {
  const { palette } = useColor();
  const { theme } = useTheme();

  const getGradientStyle = (colors: ColorPalette) => {
    const { primary, secondary, accent } = colors;
    const isLight = theme === "light";
    const primaryOpacity = isLight ? 0.25 : 0.12;
    const secondaryOpacity = isLight ? 0.18 : 0.08;
    const accentOpacity = isLight ? 0.12 : 0.05;

    const transparentColor = isLight ? "rgba(255,255,255,0)" : "rgba(0,0,0,0)";

    return `
      radial-gradient(
        200% 200% at 50% -20%,
        rgba(${primary.join(",")},${primaryOpacity}) 0%,
        rgba(${primary.join(",")},${primaryOpacity * 0.7}) 20%,
        rgba(${primary.join(",")},${primaryOpacity * 0.3}) 40%,
        ${transparentColor} 60%
      ),
      radial-gradient(
        180% 180% at 15% 50%,
        rgba(${secondary.join(",")},${secondaryOpacity}) 0%,
        rgba(${secondary.join(",")},${secondaryOpacity * 0.6}) 30%,
        rgba(${secondary.join(",")},${secondaryOpacity * 0.2}) 50%,
        ${transparentColor} 70%
      ),
      radial-gradient(
        160% 160% at 85% 50%,
        rgba(${accent.join(",")},${accentOpacity}) 0%,
        rgba(${accent.join(",")},${accentOpacity * 0.7}) 25%,
        rgba(${accent.join(",")},${accentOpacity * 0.3}) 45%,
        ${transparentColor} 65%
      )
    `;
  };

  const defaultColors: ColorPalette = {
    primary: [32, 32, 35],
    secondary: [28, 28, 30],
    accent: [35, 35, 40],
    background: [18, 18, 20],
  };

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none -z-10 backdrop-blur-[100px]"
      animate={{
        background: palette
          ? getGradientStyle(palette)
          : getGradientStyle(defaultColors),
      }}
      initial={false}
      transition={{
        duration: 1.2,
        ease: [0.32, 0.72, 0, 1],
      }}
    />
  );
}
