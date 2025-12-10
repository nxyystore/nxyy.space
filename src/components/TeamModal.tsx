import React from "react";
import styles from "../styles/TeamModal.module.scss";
import { TeamMember } from "../types";
import { useLanyard } from "@/hooks/useLanyard";

interface TeamModalProps {
	member: TeamMember;
	onClose: () => void;
}

const TeamModal: React.FC<TeamModalProps> = ({ member, onClose }) => {
	const lanyardData = useLanyard(member.id);

	const avatarUrl = lanyardData?.discord_user.avatar
		? `https://cdn.discordapp.com/avatars/${member.id}/${lanyardData.discord_user.avatar}.png?size=1024`
		: "https://cdn.discordapp.com/embed/avatars/0.png";

	return (
		<div className={styles.modalOverlay} onClick={onClose}>
			<div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
				<button className={styles.closeButton} onClick={onClose}>
					&times;
				</button>
				<img src={avatarUrl} alt={member.name} className={styles.avatar} />
				<h2>{lanyardData?.discord_user.global_name || member.name}</h2>
				<p className={styles.username}>
					@{lanyardData?.discord_user.username || member.name}
				</p>
				<p className={styles.role}>{member.role}</p>
				<p className={styles.info}>{member.info}</p>
				<div className={styles.links}>
					{member.website && (
						<a href={member.website} target="_blank" rel="noopener noreferrer">
							Website
						</a>
					)}
					<a
						href={`https://discord.com/users/${member.id}`}
						target="_blank"
						rel="noopener noreferrer"
					>
						Discord
					</a>
				</div>
			</div>
		</div>
	);
};

export default TeamModal;
