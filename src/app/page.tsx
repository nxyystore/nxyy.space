"use client";

import BlurFade from "@/components/magicui/blur-fade";
import BlurFadeText from "@/components/magicui/blur-fade-text";
import { ProjectCard } from "@/components/project-card";
import { Badge } from "@/components/ui/badge";
import { SparklesText } from "@/components/ui/sparkles-text";
import LanyardAvatar from "@/components/LanyardAvatar";
import Footer from "@/components/Footer";
import { DATA } from "@/data/resume";
import { useColor } from "@/context/ColorContext";
import { useTheme } from "next-themes";
import { TeamMemberCard } from "@/components/TeamMemberCard";
import { TEAM_MEMBERS } from "@/lib/users";
import { useDiscord } from "@/context/DiscordContext";

import Markdown from "react-markdown";

const BLUR_FADE_DELAY = 0.04;

export default function Page() {
  const { palette } = useColor();
  const { theme } = useTheme();
  const { teamPresences } = useDiscord();

  const getThemeBorderStyle = () => {
    const baseBorder =
      theme === "dark" ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.15)";

    if (!palette) {
      return {
        borderColor: baseBorder,
      };
    }

    return {
      borderColor: `rgba(${palette.primary.join(",")}, ${
        theme === "dark" ? "0.5" : "0.4"
      })`,
    };
  };

  return (
    <main className="flex flex-col min-h-[100dvh] space-y-2">
      <section id="hero">
        <div className="mx-auto w-full max-w-2xl space-y-8">
          <div className="gap-2 flex justify-between">
            <div className="flex-col flex flex-1 space-y-1.5">
              <BlurFadeText
                delay={BLUR_FADE_DELAY}
                className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none"
                yOffset={8}
                text={`nxyy.space`}
              />
              <BlurFadeText
                className="max-w-[600px] md:text-xl"
                delay={BLUR_FADE_DELAY}
                text={DATA.description}
              />
              <div className="flex select-none items-center w-full relative">
                <div className="flex gap-0.5">
                  {Object.entries(DATA.contact.social).map(
                    ([name, social], id) => {
                      const Icon = social.icon;
                      return (
                        <BlurFade
                          key={name}
                          delay={BLUR_FADE_DELAY * 2 + id * 0.05}
                        >
                          <a
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-full p-1 hover:bg-muted transition overflow-visible"
                            aria-label={name}
                          >
                            <Icon
                              className="w-5 h-5"
                              style={{ shapeRendering: "geometricPrecision" }}
                            />
                          </a>
                        </BlurFade>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
            <BlurFade delay={BLUR_FADE_DELAY}>
              <LanyardAvatar />
            </BlurFade>
          </div>
        </div>
      </section>
      <section id="about">
        <BlurFade delay={BLUR_FADE_DELAY * 3}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">about us</h2>
          </div>
        </BlurFade>
        <BlurFade delay={BLUR_FADE_DELAY * 4}>
          <Markdown className="prose max-w-full text-pretty font-sans text-sm text-muted-foreground dark:prose-invert">
            {DATA.summary}
          </Markdown>
        </BlurFade>
      </section>
      {/* <section id="skills">
        <div className="flex min-h-0 flex-col gap-y-3">
          <BlurFade delay={BLUR_FADE_DELAY * 9}>
            <h2 className="text-xl font-bold">skills</h2>
          </BlurFade>
          <div className="flex flex-wrap gap-1 select-none">
            {DATA.skills?.map((skill, id) => {
              const icons = require("@/lib/skill-icons");
              const Icon = icons.skillIcons[skill.icon];
              return (
                <BlurFade
                  key={skill.name}
                  delay={BLUR_FADE_DELAY * 10 + id * 0.05}
                >
                  <Badge>
                    {Icon && (
                      <Icon
                        style={{
                          marginRight: 4,
                          verticalAlign: "bottom",
                          width: 14,
                          height: 14,
                          display: "inline-block",
                          overflow: "visible",
                        }}
                      />
                    )}
                    {skill.name}
                  </Badge>
                </BlurFade>
              );
            })}
          </div>
        </div>
      </section> */}
      <section id="projects">
        <div className="space-y-12 w-full py-12">
          <BlurFade delay={BLUR_FADE_DELAY * 11}>
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div
                  className="inline-block rounded-lg bg-foreground text-background px-3 py-1 text-sm border transition-all duration-200"
                  style={getThemeBorderStyle()}
                >
                  Projects
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Check out our work
                </h2>
                <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  We&apos;ve worked on a variety of projects, ranging from small
                  personal endeavors to large-scale applications. Here are some
                  highlights of our recent work.
                </p>
              </div>
            </div>
          </BlurFade>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 max-w-[800px] mx-auto">
            {DATA.projects.map((project, id) => (
              <BlurFade
                key={project.title}
                delay={BLUR_FADE_DELAY * 12 + id * 0.05}
              >
                <ProjectCard
                  href={project.href}
                  key={project.title}
                  title={project.title}
                  description={project.description}
                  // dates={project.dates}
                  tags={project.technologies}
                  image={project.image}
                  video={project.video}
                  links={project.links}
                />
              </BlurFade>
            ))}
          </div>
        </div>
      </section>
      <section id="team">
        <div className="space-y-12 w-full py-12">
          <BlurFade delay={BLUR_FADE_DELAY * 16}>
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  People behind{" "}
                  <SparklesText
                    colors={{
                      first: "#ffffff",
                      second: "#9ca3af",
                    }}
                    sparklesCount={10}
                  >
                    nxyy.space
                  </SparklesText>
                </h2>
                <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Meet the talented individuals who power our innovative
                  solutions and bring ideas to life.
                </p>
              </div>
            </div>
          </BlurFade>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-w-3xl mx-auto">
            {[...TEAM_MEMBERS]
              .sort((a, b) => {
                const aPresence = teamPresences[a.discordId];
                const bPresence = teamPresences[b.discordId];

                if (aPresence && !bPresence) return -1;
                if (!aPresence && bPresence) return 1;

                const aName =
                  aPresence?.discord_user?.display_name ||
                  aPresence?.discord_user?.global_name ||
                  aPresence?.discord_user?.username ||
                  a.name;
                const bName =
                  bPresence?.discord_user?.display_name ||
                  bPresence?.discord_user?.global_name ||
                  bPresence?.discord_user?.username ||
                  b.name;

                return aName.localeCompare(bName);
              })
              .map((member, id) => (
                <BlurFade
                  key={member.id}
                  delay={BLUR_FADE_DELAY * 17 + id * 0.1}
                >
                  <TeamMemberCard
                    member={member}
                    presence={teamPresences[member.discordId] || null}
                  />
                </BlurFade>
              ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
