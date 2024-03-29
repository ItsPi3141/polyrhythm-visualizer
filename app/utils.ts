import { Graphics } from "pixi.js";

export class MovingGraphics extends Graphics {
	public oldX: number;
	public oldY: number;
	public oldDeltaY: number;
	public deltaY: number;

	constructor() {
		super();
		this.oldX = 0;
		this.oldY = 0;
		this.oldDeltaY = 0;
		this.deltaY = 0;
	}
}
