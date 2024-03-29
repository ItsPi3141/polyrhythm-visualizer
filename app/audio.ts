import { Sampler, loaded } from "tone";

const pianoUrls: Record<string, string> = {
	A0: "A0.mp3",
	C8: "C8.mp3",
};
["A", "C", "D#", "F#"].forEach((note) => {
	Array.from(Array(7), (e, i) => (e = (i + 1).toString())).forEach(
		(octave) => {
			pianoUrls[`${note}${octave}`] = `${note.replace(
				"#",
				"s"
			)}${octave}.mp3`;
		}
	);
});

const piano: Sampler = new Sampler({
	urls: pianoUrls,
	release: 1,
	baseUrl: "/audio/salamander/",
}).toDestination();

var tonesLoaded: boolean = false;
loaded().then(() => (tonesLoaded = true));

export function playPiano(
	notes: string | string[] | number | number[],
	duration: string | number
) {
	if (!tonesLoaded) return;
	piano.triggerAttackRelease(notes, duration);
}

export const scales = {
	minor: [1, 3, 4, 6, 8, 9, 11],
	major: [1, 3, 5, 6, 8, 10, 12],
};
export const notes = Array.from(
	Array(8),
	(e, o) =>
		(e = [
			"C",
			"C#",
			"D",
			"D#",
			"E",
			"F",
			"F#",
			"G",
			"G#",
			"A",
			"A#",
			"B",
		].map((n) => (n = n + o)))
).flat();
export function createScale(
	tonic: string,
	key: "major" | "minor",
	length: number
) {
	const nDegrees = [];
	const degrees = key === "major" ? scales.major : scales.minor;
	for (let i = 0; i < length; i++) {
		nDegrees.push(
			degrees[i % degrees.length] + 12 * Math.floor(i / degrees.length)
		);
	}
	const tonicIndex = notes.indexOf(tonic) - 1; // tonic is degree 1 on the scale, so we have to offset it by -1
	const scale = nDegrees.map((n) => notes[n + tonicIndex]);
	console.log(scale);
	return scale;
}
