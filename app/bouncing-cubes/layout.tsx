import { Metadata } from "next";
import RootLayout from "../layout";
import { generateMetadata } from "../utils";

export const metadata: Metadata = generateMetadata({
	title: "Bouncing Cubes - Polyrhythm Visualizer",
	description: "Experiment with polyrhythms in a beautiful way",
});

export default RootLayout;
