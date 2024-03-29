import {
	FMSynth,
	FeedbackDelay,
	PolySynth,
	Reverb,
	Sampler,
	loaded,
} from "tone";

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

// const piano: Sampler = new Sampler({
// 	urls: pianoUrls,
// 	release: 1,
// 	baseUrl: "/audio/salamander/",
// }).toDestination();
const synth: PolySynth = new PolySynth(FMSynth, {
	harmonicity: 99,
	modulationIndex: 1,
	oscillator: {
		type: "fattriangle",
	},
	envelope: {
		attack: 0.0001,
		decay: 0.2,
		sustain: 0.1,
		release: 1,
	},
	modulation: {
		type: "square",
	},
	modulationEnvelope: {
		attack: 0.0001,
		decay: 0.2,
		sustain: 0,
		release: 0.2,
	},
}).toDestination();
synth.maxPolyphony = 15;
// const reverbPiano: Sampler = new Sampler({
// 	urls: pianoUrls,
// 	release: 1,
// 	baseUrl: "/audio/salamander/",
// }).toDestination();
const backgroundSynth: PolySynth = new PolySynth(FMSynth, {
	harmonicity: 8,
	modulationIndex: 1,
	oscillator: {
		type: "triangle",
	},
	envelope: {
		attack: 0.001,
		decay: 0.2,
		sustain: 0.1,
		release: 10,
	},
	modulation: {
		type: "square",
	},
	modulationEnvelope: {
		attack: 0.002,
		decay: 0.2,
		sustain: 0,
		release: 0.2,
	},
}).toDestination();
synth.connect(new Reverb(15).toDestination());
backgroundSynth.connect(new Reverb(69).toDestination());
var tonesLoaded: boolean = false;
loaded().then(() => (tonesLoaded = true));

// export function playPiano(
// 	notes: string | string[] | number | number[],
// 	duration: string | number,
// 	reverb: boolean = false
// ) {
// 	if (!tonesLoaded) return;
// 	try {
// 		reverb
// 			? reverbPiano.triggerAttackRelease(notes, duration)
// 			: piano.triggerAttackRelease(notes, duration);
// 	} catch {}
// }
export function playSynth(
	notes: string | string[] | number | number[],
	duration: string | number,
	reverb: boolean = false
) {
	if (!tonesLoaded) return;
	try {
		reverb
			? backgroundSynth.triggerAttackRelease(notes, duration)
			: synth.triggerAttackRelease(notes, duration);
	} catch {}
}

export const scales = {
	minor: [1, 3, 4, 6, 8, 9, 11],
	major: [1, 3, 5, 6, 8, 10, 12],
};
export const tonicTriads = {
	minor: [1, 3, 8],
	major: [1, 4, 8],
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
	return nDegrees.map((n) => notes[n + tonicIndex]);
}
export function createTonicTriad(root: string, key: "major" | "minor") {
	const degrees = key === "major" ? tonicTriads.major : tonicTriads.minor;
	return degrees.map((e) => notes[e + notes.indexOf(root) - 1]); // root is degree 1 on the scale, so we have to offset it by -1
}
