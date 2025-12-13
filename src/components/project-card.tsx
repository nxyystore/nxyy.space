"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { colorExtraction } from "@/lib/color-extraction";
import { skillIcons } from "@/lib/skill-icons";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import Markdown from "react-markdown";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface Props {
  title: string;
  href?: string;
  description: string;
  dates?: string | null;
  tags: readonly string[];
  link?: string;
  image?: string | StaticImageData;
  video?: string;
  links?: readonly {
    icon: React.ReactNode;
    type: string;
    href: string;
  }[];
  className?: string;
}

export function ProjectCard({
  title,
  href,
  description,
  dates = null,
  tags,
  link,
  image,
  video,
  links,
  className,
}: Props) {
  const { theme } = useTheme();
  const [projectColors, setProjectColors] = useState<{
    background: string;
    color: string;
    enhancedBackground: string;
    techBadgeBackground: string;
    techBadgeText: string;
    websiteButtonText: string;
  } | null>(null);

  useEffect(() => {
    if (image) {
      colorExtraction.extractColors(image, title).then((colors) => {
        const isDark = theme === "dark";
        const baseColor = isDark ? colors.light : colors.dark;
        const lightTextColor = colors.light;
        const techBadgeColors = colorExtraction.formatTechBadgeColors(
          colors,
          isDark
        );

        setProjectColors({
          background: colorExtraction.formatCssColor(baseColor),
          color: colorExtraction.formatCssColor(lightTextColor),
          enhancedBackground: colorExtraction.formatEnhancedBackground(
            colors,
            isDark
          ),
          techBadgeBackground: techBadgeColors.background,
          techBadgeText: techBadgeColors.text,
          websiteButtonText: isDark
            ? colorExtraction.formatCssColor(colors.contrast)
            : colorExtraction.formatCssColor([20, 20, 20]),
        });
      });
    }
  }, [image, title, theme]);

  return (
    <Card
      className={
        "flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300 ease-out h-full backdrop-blur-sm relative"
      }
      style={
        projectColors
          ? {
              border: "1.5px solid transparent",
              backgroundImage: projectColors.enhancedBackground,
              backgroundOrigin: "border-box",
              backgroundClip: "padding-box, border-box",
            }
          : {
              background: "rgba(255, 255, 255, 0.5)",
            }
      }
    >
      <Link
        href={href || "#"}
        className={cn("block cursor-pointer", className)}
      >
        {video && (
          <video
            src={video}
            autoPlay
            loop
            muted
            playsInline
            className="pointer-events-none mx-auto h-40 w-full object-cover object-top" // needed because random black line at bottom of video
          />
        )}
        {image && (
          <div
            className="relative h-40 w-full overflow-hidden select-none"
            style={{
              WebkitUserSelect: "none",
              MozUserSelect: "none",
              msUserSelect: "none",
              userSelect: "none",
            }}
            onDragStart={(e) => {
              e.preventDefault();
            }}
          >
            <Image
              src={image}
              alt={title}
              fill
              className={`object-cover ${
                typeof image === "object" && image.width > image.height
                  ? "object-top"
                  : typeof image === "object" && image.height > image.width
                  ? "object-center"
                  : "object-center"
              }`}
            />
          </div>
        )}
      </Link>
      <CardHeader className="px-2">
        <div className="space-y-1">
          <CardTitle
            className="mt-1 text-base font-semibold"
            style={
              projectColors
                ? {
                    color: projectColors.techBadgeText,
                  }
                : {}
            }
          >
            {title}
          </CardTitle>
          {dates && (
            <time
              className="font-sans text-xs opacity-80"
              style={
                projectColors
                  ? {
                      color: projectColors.techBadgeText,
                    }
                  : {}
              }
            >
              {dates}
            </time>
          )}
          <div className="hidden font-sans text-xs underline print:visible">
            {link?.replace("https://", "").replace("www.", "").replace("/", "")}
          </div>
          <div
            className="text-pretty font-sans text-xs opacity-75"
            style={
              projectColors
                ? {
                    color: projectColors.techBadgeText,
                  }
                : {}
            }
          >
            <Markdown className="prose-sm prose-neutral dark:prose-invert max-w-none [&>p]:m-0">
              {description}
            </Markdown>
          </div>
        </div>
      </CardHeader>
      <CardContent className="mt-auto flex flex-col px-2 select-none">
        {tags && tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {[...tags]
              .sort((a, b) => {
                const aHasIcon = !!skillIcons[a.toLowerCase()];
                const bHasIcon = !!skillIcons[b.toLowerCase()];

                if (aHasIcon && !bHasIcon) return -1;
                if (!aHasIcon && bHasIcon) return 1;
                return a.localeCompare(b);
              })
              .map((tag) => {
                const IconComponent = skillIcons[tag.toLowerCase()];
                return (
                  <Badge
                    className="px-1 py-0 text-[10px] border-0 flex items-center gap-1"
                    variant="secondary"
                    key={tag}
                    style={
                      projectColors
                        ? {
                            backgroundColor: projectColors.techBadgeBackground,
                            color: projectColors.techBadgeText,
                          }
                        : {}
                    }
                  >
                    {IconComponent && (
                      <IconComponent className="w-2.5 h-2.5 flex-shrink-0" />
                    )}
                    <span className="truncate">{tag}</span>
                  </Badge>
                );
              })}
          </div>
        )}
      </CardContent>
      <CardFooter className="px-2 pb-2">
        {links && links.length > 0 && (
          <div
            className="flex flex-row flex-wrap items-start gap-1 select-none"
            style={{
              WebkitUserSelect: "none",
              MozUserSelect: "none",
              msUserSelect: "none",
              userSelect: "none",
            }}
            onDragStart={(e) => {
              e.preventDefault();
            }}
          >
            {links?.map((link, idx) => {
              const isWebsite = link.type.toLowerCase() === "website";
              return (
                <Link href={link?.href} key={idx} target="_blank">
                  <Badge
                    key={idx}
                    className={cn(
                      "flex gap-2 px-2 py-1 text-[10px] transition-all duration-200",
                      isWebsite && projectColors
                        ? "border-0 hover:opacity-90"
                        : ""
                    )}
                    style={
                      isWebsite && projectColors
                        ? {
                            backgroundColor: projectColors.background,
                            color: projectColors.websiteButtonText,
                          }
                        : {}
                    }
                  >
                    {link.icon}
                    {link.type}
                  </Badge>
                </Link>
              );
            })}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
