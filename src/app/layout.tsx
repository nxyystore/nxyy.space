import "../styles/fonts.scss";
import "../styles/globals.scss";

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}

export const metadata = {
    title: "nxyy.space",
    description: "friends projects and stuff",
};