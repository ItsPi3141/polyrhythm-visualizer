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
	baseUrl: "/audio/salamander",
}).toDestination();

var tonesLoaded: boolean = false;
loaded().then(() => (tonesLoaded = true));

export function playPiano(
	notes: string | string[] | number | number[],
	duration: string | number
) {
	piano.triggerAttackRelease(notes, duration);
}
