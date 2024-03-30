import { Application, Container, Graphics } from "pixi.js";
import { createScale, createTonicTriad, playSynth } from "../audio";
import { CustomGraphics, hslToRgb } from "../utils";
import { ColorGradientFilter, GlowFilter } from "pixi-filters";

const backgroundColor = "#15171b";

let globals: Record<string, any> = {
	speedOffset: 1,
};

export function setGlobals(value: object) {
	globals = { ...globals, ...value };
}

const app = new Application();
(async () => {
	await app.init({
		background: backgroundColor,
		resizeTo: document.querySelector(".canvas-container") as HTMLElement,
		antialias: true,
		// WebGL
		useBackBuffer: true,
	});
	document.querySelector(".canvas-container")?.appendChild(app.canvas);

	const positionWrapper = new Container();
	const mainContainer = await main(15, 1200, 800);
	positionWrapper.addChild(mainContainer);
	app.stage.addChild(positionWrapper);
	app.ticker.add(() => {
		let scaleFactor = 1;
		if (app.canvas.width < 1200 || app.canvas.height < 800)
			scaleFactor = Math.min(
				app.canvas.width / (1200 + 50),
				app.canvas.height / (800 + 50)
			);
		positionWrapper.scale.set(scaleFactor);
		positionWrapper.position.set(
			app.canvas.width / 2,
			app.canvas.height / 2
		);
	});
})();

let hue = 0;
async function main(numberOfNotes: number = 15, width: number, height: number) {
	const scales = [
		createScale("F#2", "minor", 15),
		createScale("E2", "minor", 15),
		createScale("D2", "major", 15),
		createScale("C2", "minor", 15),
	];
	const triads = [
		createTonicTriad("F#3", "minor"),
		createTonicTriad("E3", "minor"),
		createTonicTriad("D3", "major"),
		createTonicTriad("C3", "minor"),
	];
	let chordProgression = 0;

	const mainContainer = new Container();
	mainContainer.x = -width / 2;
	mainContainer.y = -height / 2;

	const backgroundBoxContainer = new Container();
	mainContainer.addChild(backgroundBoxContainer);

	const tracksContainer = new Container();
	mainContainer.addChild(tracksContainer);

	const tracksOverlayContainer = new Container();
	mainContainer.addChild(tracksOverlayContainer);
	tracksOverlayContainer.alpha = 0.1;

	const lineContainer = new Container();
	mainContainer.addChild(lineContainer);

	const blocksContainer = new Container();
	mainContainer.addChild(blocksContainer);

	const size = width / numberOfNotes;
	const strokeWidth = 4;
	const padding = 8;

	const largeFrame = new CustomGraphics()
		.rect(0, 0, width, height)
		.stroke({ color: "#fff4", width: 4 });
	let largeFrameGlowStrength = 0;
	largeFrame.filtersObject["glow"] = new GlowFilter({
		distance: 25,
		quality: 0.5,
		outerStrength: largeFrameGlowStrength,
		innerStrength: largeFrameGlowStrength,
		color: `hsl(${hue}, 100%, 90%)`,
	});
	largeFrame.filters = [largeFrame.filtersObject["glow"]];

	backgroundBoxContainer.addChild(largeFrame);

	for (let i = 0; i < numberOfNotes; i++) {
		const track = new CustomGraphics()
			.rect(
				-(size / 2) + strokeWidth + padding,
				-2.5,
				size - (strokeWidth + padding) * 2,
				5
			)
			.fill("#fff");
		track.width = size - (strokeWidth + padding) * 2;
		track.height = 5;
		track.x = size * i + size / 2;
		track.y = height - (strokeWidth + padding + 2.5);
		track.alpha = 0.2;
		tracksContainer.addChild(track);

		const trackOverlay = new CustomGraphics()
			.rect(
				-(size / 2) + strokeWidth + padding,
				strokeWidth + padding,
				size - (strokeWidth + padding) * 2,
				height - (strokeWidth + padding) * 2
			)
			.fill(backgroundColor);

		trackOverlay.width = size - (strokeWidth + padding) * 2;
		trackOverlay.height = height - (strokeWidth + padding) * 2;
		trackOverlay.x = size * i + size / 2;
		trackOverlay.alpha = 0;
		trackOverlay.filtersObject["colorGradient"] = new ColorGradientFilter({
			type: ColorGradientFilter.LINEAR,
			stops: [0, 1].map((e) => {
				return {
					color: `#${hslToRgb(hue / 360, 1, 0.9)
						.map((e) => Math.floor(e).toString(16).padStart(2, "0"))
						.join("")}`,
					offset: e,
					alpha: 1 - e,
				};
			}),
			replace: true,
			alpha: 1,
			angle: 0,
		});
		trackOverlay.filters = [trackOverlay.filtersObject["colorGradient"]];
		tracksOverlayContainer.addChild(trackOverlay);

		const block = new CustomGraphics()
			.rect(
				-(size / 2) + strokeWidth + padding,
				-(size / 2) + strokeWidth + padding,
				size - (strokeWidth + padding) * 2,
				size - (strokeWidth + padding) * 2
			)
			.fill("#0000")
			.stroke({ color: "#fff", width: strokeWidth });
		block.width = size - (strokeWidth + padding) * 2;
		block.height = size - (strokeWidth + padding) * 2;
		block.x = size * i + size / 2;
		block.alpha = 0.5;
		block.filtersObject["glow"] = new GlowFilter({
			distance: 25,
			quality: 0.5,
			outerStrength: block.filterValues.glow.strength / 2,
			innerStrength: block.filterValues.glow.strength,
			color: `hsl(${hue}, 100%, 90%)`,
		});
		block.filters = [block.filtersObject["glow"]];
		blocksContainer.addChild(block);
	}
	lineContainer.addChild(
		new Graphics().moveTo(0, 0).lineTo(0, 0).stroke("#fff")
	);

	var firstTickTime: number = 0;
	app.ticker.add(() => {
		let queuedNotes: string[] = [];
		hue = (hue + 0.2) % 360;
		if (firstTickTime === 0) firstTickTime = app.ticker.lastTime;
		blocksContainer.children.forEach((cBlock, index) => {
			const block = cBlock as CustomGraphics;

			block.oldY = block.y;
			block.y =
				height -
				size / 2 -
				Math.abs(
					Math.sin(
						(app.ticker.lastTime / 10000) *
							(10 + index * globals.speedOffset * 0.1)
					)
				) *
					(height - size);
			block.oldDeltaY = block.deltaY;
			block.deltaY = block.y - block.oldY;
			const trackOverlay = tracksOverlayContainer.children[
				index
			] as CustomGraphics;
			const track = tracksContainer.children[index] as CustomGraphics;
			if (
				Math.sign(block.deltaY) === -1 &&
				Math.sign(block.oldDeltaY) === 1 &&
				app.ticker.lastTime - firstTickTime > 100
			) {
				block.filterValues.glow.strength = 20;
				trackOverlay.alpha = 1;
				track.alpha = 1;
				if (index === 0) {
					chordProgression = (chordProgression + 0.25) % 4; // chord changes when the tonic has played 4 times
				}
				if (chordProgression % 1 === 0 && index === 0) {
					playSynth(
						[
							triads[Math.floor(chordProgression)],
							scales[Math.floor(chordProgression)][index],
						].flat(),
						1,
						true
					);
					largeFrameGlowStrength = 25;
				} else {
					// playSynth(
					// 	scales[Math.floor(chordProgression)][index],
					// 	0.5,
					// 	false
					// );
					queuedNotes.push(
						scales[Math.floor(chordProgression)][index]
					);
				}
			}

			block.tint = `hsl(${hue}, 100%, 90%)`;
			block.filterValues.glow.strength /= 1.03;
			block.filtersObject["glow"].outerStrength =
				block.filterValues.glow.strength / 2;
			block.filtersObject["glow"].innerStrength =
				block.filterValues.glow.strength;
			block.filtersObject["glow"].color = `hsl(${hue}, 100%, 90%)`;

			largeFrameGlowStrength /= 1.001;
			largeFrame.filtersObject["glow"].outerStrength =
				largeFrameGlowStrength;
			largeFrame.filtersObject["glow"].innerStrength =
				largeFrameGlowStrength;
			largeFrame.filtersObject["glow"].color = `hsl(${hue}, 100%, 90%)`;

			trackOverlay.alpha /= 1.03;
			trackOverlay.filtersObject["colorGradient"].stops = [0, 1].map(
				(e) => {
					return {
						color: `#${hslToRgb(hue / 360, 1, 0.9)
							.map((e) =>
								Math.floor(e).toString(16).padStart(2, "0")
							)
							.join("")}`,
						offset: e,
						alpha: 1 - e,
					};
				}
			);

			if (track.alpha > 0.2) track.alpha /= 1.03;
		});
		const line = lineContainer.children[0] as Graphics;
		line.clear();
		line.moveTo(
			blocksContainer.children[0].x,
			blocksContainer.children[0].y
		);
		for (let i = 1; i < numberOfNotes; i++) {
			line.lineTo(
				blocksContainer.children[i].x,
				blocksContainer.children[i].y
			);
		}
		line.stroke("#fff4");
		playSynth(queuedNotes, 0.5, false);
	});

	return mainContainer;
}
