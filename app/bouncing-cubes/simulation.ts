import { Application, Container, Graphics } from "pixi.js";
import { createScale, playPiano } from "../audio";
import { MovingGraphics } from "../utils";

const app = new Application();
(async () => {
	await app.init({
		background: "#15171b",
		resizeTo: document.querySelector(".canvas-container") as HTMLElement,
	});
	document.querySelector(".canvas-container")?.appendChild(app.canvas);

	const mainContainer = await main(15, 1, 1200, 800);
	app.stage.addChild(mainContainer);
	mainContainer.x = 15;
	mainContainer.y = 15;
})();

async function main(
	numberOfNotes: number = 15,
	speedFactor: number = 1,
	width: number,
	height: number
) {
	const scales = [
		createScale("F#5", "minor", 15),
		createScale("E5", "major", 15),
		createScale("D5", "major", 15),
		createScale("A5", "major", 15),
	];

	const mainContainer = new Container();

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
	const strokeWidth = 1;
	const padding = 8;

	backgroundBoxContainer.addChild(
		new Graphics()
			.rect(0, 0, width, height)
			.stroke({ color: "#fff4", width: 3 })
	);

	for (let i = 0; i < numberOfNotes; i++) {
		const track = new Graphics()
			.rect(
				-(size / 2) + strokeWidth + padding,
				strokeWidth + padding,
				size - (strokeWidth + padding) * 2,
				height - (strokeWidth + padding) * 2
			)
			.fill("#0000")
			.stroke("#fff3");
		track.width = size - (strokeWidth + padding) * 2;
		track.height = height - (strokeWidth + padding) * 2;
		track.x = size * i + size / 2;
		tracksContainer.addChild(track);

		const trackOverlay = new Graphics()
			.rect(
				-(size / 2) + strokeWidth + padding,
				strokeWidth + padding,
				size - (strokeWidth + padding) * 2,
				height - (strokeWidth + padding) * 2
			)
			.fill("#fff");
		trackOverlay.width = size - (strokeWidth + padding) * 2;
		trackOverlay.height = height - (strokeWidth + padding) * 2;
		trackOverlay.x = size * i + size / 2;
		tracksOverlayContainer.addChild(trackOverlay);

		const block = new MovingGraphics()
			.rect(
				-(size / 2) + strokeWidth + padding,
				-(size / 2) + strokeWidth + padding,
				size - (strokeWidth + padding) * 2,
				size - (strokeWidth + padding) * 2
			)
			.fill("#0000")
			.stroke("#fff");
		block.width = size - (strokeWidth + padding) * 2;
		block.height = size - (strokeWidth + padding) * 2;
		block.x = size * i + size / 2;
		blocksContainer.addChild(block);
	}
	lineContainer.addChild(
		new Graphics().moveTo(0, 0).lineTo(0, 0).stroke("#fff")
	);

	app.ticker.add(() => {
		blocksContainer.children.forEach((cBlock, index) => {
			const block = cBlock as MovingGraphics;

			block.oldY = block.y;
			block.y =
				height -
				size / 2 -
				Math.abs(
					Math.sin(
						(app.ticker.lastTime / 10000) *
							(10 + index * speedFactor * 0.1)
					)
				) *
					(height - size);
			block.oldDeltaY = block.deltaY;
			block.deltaY = block.y - block.oldY;
			if (
				Math.sign(block.deltaY) === -1 &&
				Math.sign(block.oldDeltaY) === 1
			) {
				playPiano(scales[0][index], 0.5);
			}
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
	});

	return mainContainer;
}
