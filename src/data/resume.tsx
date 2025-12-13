import { Icons } from "@/components/icons";
import { HomeIcon, NotebookIcon } from "lucide-react";

import warm from "@/assets/projects/warm.jpg";
import egirls from "@/assets/projects/egirls.png";

import { FaDiscord, FaGithub, FaTelegram } from "react-icons/fa6";
import { IoIosLink } from "react-icons/io";

export const DATA = {
	name: "Nxyy's Space",
	initials: "nxyy.space",
	url: "https://nxyy.space",
	description:
		"A team of friends and developers building modern, high-performance websites and applications that invokes innovation, design and production-readiness.",
	summary:
		"at [**nxyy.space**](https://nxyy.space), we build modern, high-performance software that invokes innovation, design and production-readiness. From advanced Discord bots to full-stack web applications, we focus on creating seamless, impactful user experiences.",
	avatarUrl: (theme: string) =>
		theme === "dark" ? logo_256x256.src : i_logo_256x256.src,
	skills: [
		{ name: "TypeScript", icon: "typescript" },
		{ name: "JavaScript", icon: "javascript" },
		{ name: "Python", icon: "python" },
		{ name: "Golang", icon: "go" },
		{ name: "Rust", icon: "rust" },
		{ name: "Next.js", icon: "nextjs" },
		{ name: "React", icon: "react" },
		{ name: "TailwindCSS", icon: "tailwind" },
		{ name: "Node.js", icon: "nodejs" },
		{ name: "FastAPI", icon: "fastapi" },
		{ name: "Vite", icon: "vite" },
		{ name: "Zod", icon: "zod" },
		{ name: "Astro", icon: "astro" },
		{ name: "Svelte", icon: "svelte" },
		{ name: "Webpack", icon: "webpack" },
		{ name: "Bun", icon: "bun" },
		{ name: "Elysia", icon: "express" },
		{ name: "VSCode", icon: "vscode" },
		{ name: "Git", icon: "git" },
		{ name: "GitHub", icon: "github" },
		{ name: "Docker", icon: "docker" },
		{ name: "Vercel", icon: "vercel" },
		{ name: "PostgreSQL", icon: "postgresql" },
		{ name: "AWS", icon: "aws" },
		{ name: "Cloudflare", icon: "cloudflare" },
		{ name: "Redis", icon: "redis" },
		{ name: "Kubernetes", icon: "kubernetes" },
    { name: "R2", icon: "r2" },
	],
	navbar: [
		{ href: "/", icon: HomeIcon, label: "Home" },
		{ href: "/blog", icon: NotebookIcon, label: "Blog" },
	],
	contact: {
		social: {
			Discord: {
				name: "Discord",
				url: "https://discord.gg/",
				icon: FaDiscord,
			},
		},
	},

	work: [],
	projects: [
		{
			title: "e-girls",
			href: "https://e-girls.host",
			active: true,
			description: "A image host that's simple, yet elegant to use.",
			technologies: [
				"NextJS",
				"Typescript",
				"PostgreSQL",
				"R2",
				"Bun",
				"TailwindCSS",
			],
			links: [
				{
					type: "Website",
					href: "https://e-girls.host",
					icon: <IoIosLink className="size-3" />,
				},
			],
			image: egirls,
			video: "",
		},
		{
			title: "warm",
			href: "https://warm.lat",
			active: true,
			description: "A bot that has extensive yet half broken features.",
			technologies: [
        "Python",
        "discord.py", 
        "PostgreSQL", 
        "Redis", 
        "R2",
        "FastAPI",
      ],
			links: [
				{
					type: "Website",
					href: "https://warm.lat",
					icon: <IoIosLink className="size-3" />,
				},
			],
			image: warm,
			video: "",
		},
	],
} as const;

