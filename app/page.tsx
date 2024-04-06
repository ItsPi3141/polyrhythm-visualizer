import Image from "next/image";
import Link from "next/link";

export default function Home() {
	return (
		<main className="flex flex-col justify-start items-center bg-[#15171b] w-screen min-h-screen text-white overflow-x-hidden">
			<div className="flex flex-col justify-center items-center gap-4 p-8 h-96 text-center">
				<h1 className="font-extralight text-4xl sm:text-5xl md:text-6xl">
					Polyrhythm Visualizer
				</h1>
				<h2 className="font-light text-md sm:text-xl md:text-2xl">
					Experiment with polyrhythms in a beautiful way
				</h2>
			</div>
			<div className="border-[#2a2c30] mb-8 border-t-2 w-screen" />
			<div className="flex flex-wrap justify-center items-center gap-4 w-screen max-w-5xl">
				{[
					{
						title: "Bouncing Cubes",
						href: "/bouncing-cubes",
						image: "/thumbnails/bouncing_cubes.png",
					},
				].map((e) => (
					<Link
						key={e.title}
						href={e.href}
						className="relative flex flex-col justify-center items-center gap-2 border-[#fff1] border-2 p-2 rounded-lg w-80 h-60 overflow-hidden"
					>
						<div className="w-full h-full overflow-hidden">
							<Image
								className="h-full object-center object-contain"
								src={e.image}
								alt={e.title}
								width={320}
								height={0}
							/>
						</div>
						<div className="flex justify-center items-center pb-2 h-4">
							{e.title}
						</div>
					</Link>
				))}
			</div>
		</main>
	);
}
