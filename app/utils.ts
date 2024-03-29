import { Graphics } from "pixi.js";

export class CustomGraphics extends Graphics {
	public oldX: number;
	public oldY: number;
	public oldDeltaY: number;
	public deltaY: number;
	public filterValues: {
		glow: {
			strength: number;
		};
	};
	public filtersObject: any;

	constructor() {
		super();
		this.oldX = 0;
		this.oldY = 0;
		this.oldDeltaY = 0;
		this.deltaY = 0;
		this.filterValues = {
			glow: {
				strength: 0,
			},
		};
		this.filtersObject = {};
	}
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 * https://gist.github.com/mjackson/5311256
 */
export function hslToRgb(h: number, s: number, l: number): number[] {
	var r, g, b;

	if (s == 0) {
		r = g = b = l; // achromatic
	} else {
		const hue2rgb = (p: number, q: number, t: number) => {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		};

		var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		var p = 2 * l - q;

		r = hue2rgb(p, q, h + 1 / 3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1 / 3);
	}
	return [r * 255, g * 255, b * 255];
}
