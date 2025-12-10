"use client";

import { useState } from "react";
import styles from "../styles/Navbar.module.scss";
import { motion } from "framer-motion";

interface NavbarProps {
	scrollToSection: (sectionId: string) => void;
}

const Navbar = ({ scrollToSection }: NavbarProps) => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	return (
		<>
			<motion.nav
				className={`${styles.nav} ${isMenuOpen ? styles.menuOpen : ""}`}
				initial={{ y: -100, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.5 }}
			>
				<div className={styles.logo}>nxyy.space</div>
				<button
					className={styles.menuButton}
					onClick={toggleMenu}
					aria-label="nav"
				>
					<span className={styles.menuIcon}></span>
				</button>
				<div className={`${styles.links} ${isMenuOpen ? styles.active : ""}`}>
					<a
						onClick={() => {
							scrollToSection("home");
							setIsMenuOpen(false);
						}}
					>
						Home
					</a>
					<a
						onClick={() => {
							scrollToSection("projects");
							setIsMenuOpen(false);
						}}
					>
						Projects
					</a>
					<a
						onClick={() => {
							scrollToSection("team");
							setIsMenuOpen(false);
						}}
					>
						Team
					</a>
					<a
						onClick={() => {
							scrollToSection("contact");
							setIsMenuOpen(false);
						}}
					>
						Contact
					</a>
				</div>
			</motion.nav>
			<div
				className={`${styles.overlay} ${isMenuOpen ? styles.active : ""}`}
				onClick={() => setIsMenuOpen(false)}
			/>
		</>
	);
};

export default Navbar;
