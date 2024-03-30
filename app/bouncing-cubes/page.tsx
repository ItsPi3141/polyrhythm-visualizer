"use client";
import { Play20Regular } from "@fluentui/react-icons";
import React, { FormEvent } from "react";

export default class FallingCubes extends React.Component {
	constructor(props: any) {
		super(props);
		this.state = {
			initialized: false,
			ready: false,
			setGlobals: () => {},
			speedOffset: 1,
		};
	}
	componentDidMount() {}
	render() {
		return (
			<main className="flex bg-[#15171b] w-screen h-screen text-white">
				{/* Config menu */}
				<div className="flex flex-col gap-2 border-[#2a2c30] bg-[#15171b] p-4 border-r-2 w-60">
					{[
						{
							title: "Speed offset",
							type: "number",
							default: 1,
							min: -10,
							max: 10,
							oninput: (event: FormEvent<HTMLInputElement>) => {
								if (!(this.state as any).initialized)
									return this.setState({
										speedOffset: (
											event?.target as HTMLInputElement
										).value,
									});
								if (!(this.state as any).ready) {
									this.setState({ ready: true });
									const sg =
										require("./simulation.ts").setGlobals;
									this.setState({
										setGlobals: sg,
									});
									sg({
										speedOffset: (
											event?.target as HTMLInputElement
										).value,
									});
								} else {
									(this.state as any).setGlobals({
										speedOffset: (
											event?.target as HTMLInputElement
										).value,
									});
								}
							},
						},
					].map((e, i) => (
						<div className="flex flex-col gap-1" key={i}>
							<p>{e.title}</p>
							<input
								className="bg-[#fff1] py-1 pl-2 rounded-lg outline-none"
								type={e.type}
								defaultValue={e.default}
								min={e.min || -Infinity}
								max={e.max || Infinity}
								onInput={e.oninput || (() => {})}
							/>
						</div>
					))}
				</div>

				{/* Canvas */}
				<div className="flex justify-center items-center w-[calc(100vw-240px)] canvas-container">
					<button
						className="flex items-center gap-2 bg-[#fff1] hover:bg-[#fff2] px-6 py-3 rounded-full text-xl transition-all"
						type="button"
						onClick={(e) => {
							const s = require("./simulation.ts");
							s.setGlobals({
								speedOffset: (this.state as any).speedOffset,
							});
							this.setState({ initialized: true });
							const element = e.target as HTMLButtonElement;
							element.remove();
						}}
					>
						<Play20Regular />
						Start
					</button>
				</div>
			</main>
		);
	}
}
