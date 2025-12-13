import ColorThief from "colorthief";
import { StaticImageData } from "next/image";

type RGB = [number, number, number];
type HSL = [number, number, number];

interface ExtractedColors {
    primary: RGB;
    secondary: RGB;
    tertiary: RGB;
    quaternary: RGB;
    quinary: RGB;
    light: RGB;
    dark: RGB;
    contrast: RGB;
    techBadgeBg: RGB;
    techBadgeText: RGB;
}

class ColorExtractionService {
    private colorThief: ColorThief;
    private cache = new Map<string, ExtractedColors>();

    constructor() {
        this.colorThief = new ColorThief();
    }

    private rgbToHsl([r, g, b]: RGB): HSL {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0, s = 0, l = (max + min) / 2;

        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return [h * 360, s * 100, l * 100];
    }

    private hslToRgb([h, s, l]: HSL): RGB {
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

        if (s === 0) {
            return [l, l, l].map(x => Math.round(x * 255)) as RGB;
        }

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        return [
            hueToRgb(p, q, h + 1 / 3),
            hueToRgb(p, q, h),
            hueToRgb(p, q, h - 1 / 3)
        ].map(x => Math.round(x * 255)) as RGB;
    }

    private adjustColor(color: RGB, lightness: number, saturation: number = 1): RGB {
        const [h, s, l] = this.rgbToHsl(color);
        return this.hslToRgb([
            h,
            Math.min(100, Math.max(0, s * saturation)),
            Math.min(100, Math.max(0, l + lightness))
        ]);
    }

    private normalizeProblematicColors(color: RGB): RGB {
        const [h, s, l] = this.rgbToHsl(color);
        let normalizedH = h;
        let normalizedS = s;

        if (h >= 270 && h <= 330) {
            normalizedH = h < 300 ? 240 : 20;
            normalizedS = Math.min(70, s * 0.8);
        }

        if (h >= 45 && h <= 75 && s > 80) {
            normalizedS = Math.min(65, s * 0.7);
        }

        normalizedS = Math.min(85, Math.max(25, normalizedS));
        const normalizedL = Math.min(75, Math.max(20, l));

        return this.hslToRgb([normalizedH, normalizedS, normalizedL]);
    }

    private getColorScore(color: RGB): number {
        const [, s, l] = this.rgbToHsl(color);
        const normalizedColor = this.normalizeProblematicColors(color);
        const [, normalizedS] = this.rgbToHsl(normalizedColor);
        return (normalizedS / 100) * (1 - Math.abs(l - 50) / 100);
    }

    private createContrastColor(color: RGB, isDark: boolean): RGB {
        const [h, s] = this.rgbToHsl(color);
        if (isDark) {
            return this.hslToRgb([h, Math.min(70, s * 0.8), 92]);
        } else {
            return this.hslToRgb([h, Math.min(80, s * 0.9), 8]);
        }
    }

    private generateVariants(baseColor: RGB, secondaryColor?: RGB, tertiaryColor?: RGB, quaternaryColor?: RGB, quinaryColor?: RGB): ExtractedColors {
        const normalizedColor = this.normalizeProblematicColors(baseColor);
        const [h, s, l] = this.rgbToHsl(normalizedColor);

        const secondary = secondaryColor ? this.normalizeProblematicColors(secondaryColor) :
            this.hslToRgb([(h + 30) % 360, Math.max(25, s * 0.8), Math.min(70, l + 10)]);

        const tertiary = tertiaryColor ? this.normalizeProblematicColors(tertiaryColor) :
            this.hslToRgb([(h - 30 + 360) % 360, Math.max(20, s * 0.7), Math.min(75, l + 15)]);

        const quaternary = quaternaryColor ? this.normalizeProblematicColors(quaternaryColor) :
            this.hslToRgb([(h + 60) % 360, Math.max(30, s * 0.9), Math.min(65, l + 5)]);

        const quinary = quinaryColor ? this.normalizeProblematicColors(quinaryColor) :
            this.hslToRgb([(h - 60 + 360) % 360, Math.max(35, s * 0.85), Math.min(60, l)]);

        const avgH = [normalizedColor, secondary, tertiary].reduce((sum, color, i) => {
            const [colorH] = this.rgbToHsl(color);
            return sum + colorH;
        }, 0) / 3;

        const techBadgeBg = this.hslToRgb([avgH, 60, 20]);
        const techBadgeText = this.hslToRgb([avgH, 40, 85]); return {
            primary: normalizedColor,
            secondary,
            tertiary,
            quaternary,
            quinary,
            light: this.hslToRgb([h, Math.max(30, s * 0.6), Math.min(80, l + 25)]),
            dark: this.hslToRgb([h, Math.min(90, s * 1.1), Math.max(20, l - 25)]),
            contrast: this.createContrastColor(normalizedColor, l < 50),
            techBadgeBg,
            techBadgeText
        };
    } private async loadImage(src: string | StaticImageData): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";

            img.onload = () => resolve(img);
            img.onerror = reject;

            img.src = typeof src === 'string' ? src : src.src;
        });
    }

    async extractColors(
        image: string | StaticImageData,
        projectTitle: string
    ): Promise<ExtractedColors> {
        const cacheKey = `${projectTitle}-${typeof image === 'string' ? image : image.src}`;

        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey)!;
        }

        try {
            const img = await this.loadImage(image);
            const palette = this.colorThief.getPalette(img, 12);

            const scoredColors = palette
                .map(color => ({ color, score: this.getColorScore(color) }))
                .sort((a, b) => b.score - a.score);

            const dominantColor = scoredColors[0]?.color || [64, 128, 255] as RGB;
            const secondaryColor = scoredColors[1]?.color;
            const tertiaryColor = scoredColors[2]?.color;
            const quaternaryColor = scoredColors[3]?.color;
            const quinaryColor = scoredColors[4]?.color;

            const colors = this.generateVariants(dominantColor, secondaryColor, tertiaryColor, quaternaryColor, quinaryColor); this.cache.set(cacheKey, colors);
            return colors;
        } catch {
            const fallbackColors = this.generateVariants([64, 128, 255] as RGB);
            this.cache.set(cacheKey, fallbackColors);
            return fallbackColors;
        }
    }

    formatCssColor(color: RGB, alpha: number = 1): string {
        return alpha === 1
            ? `rgb(${color.join(', ')})`
            : `rgba(${color.join(', ')}, ${alpha})`;
    }

    formatGradientBorder(colors: ExtractedColors, isDark: boolean, alpha: number = 0.6): string {
        const color1 = isDark ? colors.light : colors.secondary;
        const color2 = isDark ? colors.primary : colors.tertiary;
        const color3 = isDark ? colors.secondary : colors.primary;

        return `linear-gradient(135deg, ${this.formatCssColor(color1, alpha)}, ${this.formatCssColor(color2, alpha * 0.7)}, ${this.formatCssColor(color3, alpha * 0.5)})`;
    }

    formatRadialBackground(colors: ExtractedColors, isDark: boolean): string {
        const lightColor = colors.light;
        const primaryColor = colors.primary;
        const darkColor = colors.dark;
        const baseTheme = isDark ? [10, 10, 15] : [250, 250, 255];

        if (isDark) {
            return `radial-gradient(ellipse 200% 150% at bottom right, ${this.formatCssColor(lightColor, 0.45)} 0%, ${this.formatCssColor(primaryColor, 0.35)} 5%, ${this.formatCssColor(darkColor, 0.25)} 12%, ${this.formatCssColor(darkColor, 0.15)} 25%, rgba(${baseTheme.join(', ')}, 0.6) 85%)`;
        } else {
            return `linear-gradient(rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.05)), radial-gradient(ellipse 200% 150% at bottom right, ${this.formatCssColor(lightColor, 0.55)} 0%, ${this.formatCssColor(primaryColor, 0.45)} 6%, ${this.formatCssColor(darkColor, 0.3)} 15%, ${this.formatCssColor(darkColor, 0.2)} 28%, rgba(${baseTheme.join(', ')}, 0.75) 90%)`;
        }
    }

    formatTechBadgeColors(colors: ExtractedColors, isDark: boolean): { background: string; text: string } {
        const [h] = this.rgbToHsl(colors.techBadgeBg);

        if (isDark) {
            const bgColor = this.hslToRgb([h, 70, 18]);
            const textColor = this.hslToRgb([h, 45, 88]);
            return {
                background: this.formatCssColor(bgColor, 0.85),
                text: this.formatCssColor(textColor, 0.95)
            };
        } else {
            const bgColor = this.hslToRgb([h, 55, 25]);
            const textColor = this.hslToRgb([h, 50, 95]);
            return {
                background: this.formatCssColor(bgColor, 0.9),
                text: this.formatCssColor(textColor, 1)
            };
        }
    }

    formatEnhancedBackground(colors: ExtractedColors, isDark: boolean): string {
        const radialBg = this.formatRadialBackground(colors, isDark);
        const gradientBorder = this.formatGradientBorder(colors, isDark, 0.5);

        if (isDark) {
            return `${gradientBorder}, ${radialBg}`;
        } else {
            return `${gradientBorder}, ${radialBg}`;
        }
    } clearCache(): void {
        this.cache.clear();
    }
}

export const colorExtraction = new ColorExtractionService();