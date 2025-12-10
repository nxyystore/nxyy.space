"use client";

import { useEffect, useState } from "react";
import styles from "../styles/Home.module.scss";
import TeamModal from "../components/TeamModal";
import { TeamMember, ProjectStats } from "../types";
import { egirlsStatus, WarmStatus } from "../types/api";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { teamMembers as initialTeamMembers } from "@/lib/constants";
import { useLanyard } from "@/hooks/useLanyard";

const TeamMemberCard = ({
	member,
	onClick,
	index,
}: {
	member: TeamMember;
	onClick: () => void;
	index: number;
}) => {
	const lanyardData = useLanyard(member.id);

	const avatarUrl = lanyardData?.discord_user.avatar
		? `https://cdn.discordapp.com/avatars/${member.id}/${lanyardData.discord_user.avatar}.png?size=1024`
		: "https://cdn.discordapp.com/embed/avatars/0.png";

	return (
		<motion.div
			key={member.name}
			className={styles.teamMember}
			onClick={onClick}
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, amount: 0.5 }}
			transition={{ duration: 0.5, delay: index * 0.1 }}
		>
			<img src={avatarUrl} alt={member.name} />
			<h3>{lanyardData?.discord_user.global_name || member.name}</h3>
			<p>{member.role}</p>
		</motion.div>
	);
};

export default function Home() {
	const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
	const [teamMembers, setTeamMembers] =
		useState<TeamMember[]>(initialTeamMembers);
	const [projectStats, setProjectStats] = useState<ProjectStats>({});

	useEffect(() => {
		const fetchStatus = async () => {
			try {
				const [warmResponse, egirlsResponse] = await Promise.all([
					fetch("/api/warm"),
					fetch("/api/egirls"),
				]);

				const warmData: WarmStatus = await warmResponse.json();
				const egirlsData: egirlsStatus = await egirlsResponse.json();

				setProjectStats({
					"e-girls": {
						users: egirlsData.users,
						used_storage: egirlsData.storageUsedGB,
					},
					warm: { users: warmData.total_users, servers: warmData.total_guilds },
				});
			} catch (error) {
				console.error("Error fetching status:", error);
			}
		};

		fetchStatus();
		const interval = setInterval(fetchStatus, 60000);
		return () => clearInterval(interval);
	}, []);

	const scrollToSection = (sectionId: string) => {
		const element = document.getElementById(sectionId);
		if (element) {
			element.scrollIntoView({ behavior: "smooth" });
		}
	};

	return (
		<div className={styles.container}>
			<Navbar scrollToSection={scrollToSection} />
			<div className={styles.gridBackground} />
			<div className={styles.content}>
				<motion.main
					id="home"
					className={styles.hero}
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<h1>Welcome to nxyy.space</h1>
                    <p>The hub for projects and resources.</p>
				</motion.main>

				<div className={styles.sectionDivider} />

				<section id="projects" className={styles.projects}>
					<h2>Our Projects</h2>
					<div className={styles.projectGrid}>
						<motion.div
							className={styles.projectCard}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							whileHover={{ scale: 1.05 }}
							viewport={{ once: true, amount: 0.5 }}
							transition={{ duration: 0.5, delay: 0.2 }}
						>
							<div className={styles.projectImage}>
								<img src="/images/e-girls.png" className={styles.projectImg} />
							</div>
							<div className={styles.projectContent}>
								<h3>e-girls.host</h3>
								<p>A simple and elegant image host.</p>
								<p>
									Users:{" "}
									{projectStats["e-girls"]?.users?.toLocaleString() ||
										"Loading..."}
								</p>
								<p>
									Used Storage:{" "}
									{projectStats["e-girls"]?.used_storage?.toLocaleString() ||
										"Loading..."}{" "}
									GB
								</p>
								<a href="https://e-girls.host" className={styles.projectLink}>
									Visit Website
								</a>
							</div>
						</motion.div>
						<motion.div
							className={styles.projectCard}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							whileHover={{ scale: 1.05 }}
							viewport={{ once: true, amount: 0.5 }}
							transition={{ duration: 0.5, delay: 0.4 }}
						>
							<div className={styles.projectImage}>
								<img src="/images/warm.jpg" className={styles.projectImg} />
							</div>
							<div className={styles.projectContent}>
								<h3>warm.lat</h3>
								<p>A extensive yet simple Discord bot.</p>
								<p>Servers: {projectStats["warm"]?.servers || "Loading..."}</p>
								<p>Users: {projectStats["warm"]?.users || "Loading..."}</p>
								<a href="https://warm.lat" className={styles.projectLink}>
									Visit Website
								</a>
							</div>
						</motion.div>
					</div>
				</section>

				<div className={styles.sectionDivider} />
				<section id="team" className={styles.team}>
					<h2>Our Team</h2>
					<div className={styles.teamGrid}>
						{teamMembers.map((member, index) => (
							<TeamMemberCard
								key={member.id}
								member={member}
								index={index}
								onClick={() => setSelectedMember(member)}
							/>
						))}
					</div>
				</section>

				<div className={styles.sectionDivider} />

				<section id="contact" className={styles.contact}>
					<h2>Contact Us</h2>
					<p>
						The best way to get in touch is through our{" "}
						<a
							href="https://discord.gg/your-server"
							className={styles.discordLink}
						>
							Discord server
						</a>
						.
					</p>
				</section>
			</div>

			{selectedMember && (
				<TeamModal
					member={selectedMember}
					onClose={() => setSelectedMember(null)}
				/>
			)}
		</div>
	);
}
