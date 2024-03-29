"use client";
import React from "react";

export default class FallingCubes extends React.Component {
	componentDidMount() {}
	render() {
		return (
			<main className="flex bg-[#15171b] w-screen h-screen">
				{/* Config menu */}
				<div className="border-[#2a2c30] bg-[#15171b] border-r-2 w-60">
					<p>f</p>
				</div>

				{/* Canvas */}
				<div className="w-[calc(100vw-240px)] canvas-container">
					<button
						type="button"
						onClick={(e) => {
							require("./simulation.ts");
							const element = e.target as HTMLButtonElement;
							element.remove();
						}}
					>
						Start
					</button>
				</div>
			</main>
		);
	}
}
