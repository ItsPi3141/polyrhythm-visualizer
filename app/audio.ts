import { Destination, FMSynth, PolySynth, Reverb, loaded } from "tone";

const tConsole = console as any;
const customWarn = (...args: any[]) => {
	if (args[0].includes("Max polyphony exceeded. Note dropped."))
		isThrottling = true;
	return tConsole.oldWarn(...args);
};
tConsole.oldWarn = tConsole.warn;
tConsole.warn = customWarn;

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
let synth: PolySynth = new PolySynth(FMSynth, {
	harmonicity: 2,
	modulationIndex: 1,
	oscillator: {
		type: "fattriangle",
	},
	envelope: {
		attack: 0.001,
		decay: 0.2,
		sustain: 0.1,
		release: 1,
	},
	modulation: {
		type: "square",
	},
	modulationEnvelope: {
		attack: 0.001,
		decay: 0.2,
		sustain: 0,
		release: 5,
	},
}).toDestination();
synth.maxPolyphony = 32;
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
		volume: -15,
	},
	envelope: {
		attack: 0.001,
		decay: 2000,
		sustain: 0.8,
		release: 20,
		attackCurve: "step",
		decayCurve: "linear",
	},
	modulation: {
		type: "square",
	},
	modulationEnvelope: {
		attack: 0.002,
		decay: 2000,
		sustain: 0.9,
		release: 1,
		attackCurve: "step",
	},
}).toDestination();

const fillSynth: PolySynth = new PolySynth(FMSynth, {
	harmonicity: 8,
	modulationIndex: 1,
	oscillator: {
		type: "triangle",
		volume: -25,
	},
	envelope: {
		attack: 0.001,
		decay: 2000,
		sustain: 0.8,
		release: 20,
		attackCurve: "step",
		decayCurve: "linear",
	},
	modulation: {
		type: "square",
	},
	modulationEnvelope: {
		attack: 0.002,
		decay: 2000,
		sustain: 0.9,
		release: 1,
		attackCurve: "step",
	},
}).toDestination();

const lowReverb = new Reverb(0.4);
const highReverb = new Reverb(15);

synth.chain(lowReverb, Destination);
backgroundSynth.chain(highReverb, Destination);
// reverbPiano.connect(new Reverb(69).toDestination());
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
let isThrottling = false;
let lastNoteHit = Date.now();
let queuedNotes: string[] = [];
let consecutiveSmallQueue = 0;
export function playSynth(
	notes: string | string[] | number | number[],
	duration: string | number,
	reverb: boolean = false
) {
	if (!tonesLoaded) return;
	try {
		reverb
			? (backgroundSynth.triggerAttackRelease(notes, duration),
			  fillSynth.triggerAttackRelease(
					notes,
					typeof duration === "number" ? duration * 10 : 10
			  ))
			: (() => {
					if (isThrottling) {
						if (lastNoteHit + 50 < Date.now()) {
							lastNoteHit = Date.now();
							synth.triggerAttackRelease(
								queuedNotes.slice(0, 1),
								0.25
							);
							if (queuedNotes.length <= 2)
								consecutiveSmallQueue++;
							else consecutiveSmallQueue = 0;
							if (consecutiveSmallQueue >= 5) {
								consecutiveSmallQueue = 0;
								isThrottling = false;
							}
							queuedNotes = [];
						} else {
							typeof notes === "string"
								? queuedNotes.push(notes)
								: (queuedNotes = queuedNotes.concat(
										notes as string[]
								  ));
						}
					} else {
						synth.triggerAttackRelease(notes, duration);
					}
			  })();
	} catch {}
}

export const scales = {
	// minor: [1, 3, 4, 6, 8, 9, 11],
	// major: [1, 3, 5, 6, 8, 10, 12],
	minor: [1, 4, 8],
	major: [1, 5, 8],
};
export const tonicTriads = {
	minor: [1, 4, 8],
	major: [1, 5, 8],
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
