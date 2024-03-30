import { Poppins } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";
import { generateMetadata } from "./utils";

const poppins = Poppins({ subsets: ["latin"], weight: ["200", "400", "700"] });

export const metadata: Metadata = generateMetadata({
	title: "Polyrhythm Visualizer",
	description: "Experiment with polyrhythms in a beautiful way",
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={poppins.className}>{children}</body>
		</html>
	);
}
