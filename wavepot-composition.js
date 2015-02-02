/**
 *
 * This code is greatly inspired from Likeyn (https://gist.github.com/Likeyn/824f5b3e9278fa0c8745)
 *
 * Work in progress!!!
 *
 */


// Helper functions
function random_element(array) {
    return array[Math.floor(Math.random() * array.length)];
}
function random_between(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function replicate_matrix(matrix, columns) { // requires sylvester.js
    for (i = 0; matrix.dimensions()['cols'] < columns; i++) {
        matrix = matrix.augment(matrix)
    }
    return matrix;
}
function generate_random_binary_matrix(columns, probability) {  // requires sylvester.js
    random_matrix = Matrix.Random(5, columns);
    return random_matrix.map(function (x) {
        return x < probability;
    });
}


function WavepotComposition() {

    var that = this;

    this.bpm = random_between(60, 180);
    this.tuning = 440 * 60 / this.bpm;
    this.scale_name = random_element(Object.keys(scales)); // external file
    this.scale = scales[this.scale_name];

    // Log basic composition info
    this.log = function() {
        console.log("bpm: " + that.bpm + "\n" +
                    "scale: " + that.scale_name);
    };

    // Pick a random note from the scale
    function randomNote(octave) {
        if (octave === undefined) octave = 0;
        random_note = random_element(that.scale) + 12 * octave;
        return random_note;
    }

    // Make a random cord based on a single octave
    function randomCord() {
        min = -2;
        max = 0;
        random_octave = random_between(min, max);
        first_note = randomNote() + random_octave * 12;
        second_note = randomNote() + random_octave * 12;
        third_note = randomNote() + random_octave * 12;
        return [first_note, second_note, third_note];
    }
    // Make a randomized step sequence (5x16 binary matrix)
    function generate_random_step_sequencer(threshold) {
        random_16 = generate_random_binary_matrix(16, threshold);
        random_8 = generate_random_binary_matrix(8, threshold);
        random_4 = generate_random_binary_matrix(4, threshold);
        random_2 = generate_random_binary_matrix(2, threshold);
        combined = random_16
            .add(replicate_matrix(random_8, 16))
            .add(replicate_matrix(random_4, 16))
            .add(replicate_matrix(random_2, 16));
        return combined;
    }
    function randomize(ratio) { // 1 means completely new track

    }
    function toID() {

    }
    function initializeFromID() {

    }
    function rickAstley() {

    }

    this.log();

    // Initialize composition
    var hat_note = 7;
    var kick_note = 2;
    var snare_note = 7;
    var chords = [
        randomCord(),
        randomCord(),
    ];
    var chords_2 = [
        randomCord(),
        randomCord(),
    ];
    var bass_notes = [
        randomNote(-1), randomNote(-1), randomNote(-1), randomNote(-1)
    ];


    // Convert to notes
    var random_matrix = generate_random_step_sequencer(0.1);
    var synth_pattern_1 = random_matrix.elements[0];
    var synth_pattern_2 = random_matrix.elements[1];
    var bass_pattern = random_matrix.elements[2];
    var hat_pattern = random_matrix.elements[3];
    var snare_pattern = random_matrix.elements[4];
    var chords_mapped = chords.map(function (chord) {
        return chord.map(function (n) {
            return note(n);
        });
    });
    var chords_2_mapped = chords_2.map(function (chord) {
        return chord.map(function (n) {
            return note(n);
        });
    });
    var bass_notes_mapped = bass_notes.map(function (n) {
        return note(n);
    });
    var hat_mapped = note(hat_note, 6);
    var kick_mapped = note(kick_note, -1);
    var snare_mapped = note(snare_note, -1);



    this.dsp = function(t, f) {
        t *= that.bpm / 60;

        var noise = Noise();

        // Rythm synth
        var c1 = sequence(2, chords_mapped, t);
        var c2 = sequence(2, chords_2_mapped, t);
        var synth_osc_1 =
                tri(c1[0], t)
                + tri(c1[1], t)
                + tri(c1[2], t)
            ;
        var synth_osc_2 =
                tri(c2[0], t)
                + tri(c2[1], t)
                + tri(c2[2], t)
            ;
        var synth = sequence(1 / 2, synth_pattern_1, t) * env(1, synth_osc_1, 1, 1, t)
            + sequence(1 / 4, synth_pattern_2, t) * env(1 / 16, synth_osc_2, 0, 0, t);

        // Bass
        var basseq = sequence(1, bass_notes_mapped, t);
        var bass_osc = 0.7 * tri(basseq, t);
        var bass = sequence(1 / 16, bass_pattern, t) * env(1, bass_osc, 0, 0, t);

        // Drums
        var kick_osc = 1.0 * sin(kick_mapped, t);
        var kick = env(1 / 2, kick_osc, 10, 10, t);
        var hat_osc = 0.2 * tri(hat_mapped, t) + 0.4 * noise;
        var hat = sequence(1 / 4, hat_pattern, t) * env(1 / 4, hat_osc, 87, 18, t);
        var snare_osc = 0.7 * sin(snare_mapped, t) + 0.3 * noise;
        var snare = sequence(1 / 4, snare_pattern, t) * env(1 / 4, snare_osc, 14, 11, t);

        return (
              0.2 * synth
            + 0.3 * hat
            + 0.8 * kick
            + 0.6 * snare
            + 0.3 * bass
            );
    }

    function sequence(measure, seq, t) {
        return seq[(t / measure / 2 | 0) % seq.length];
    }

    function env(measure, x, y, z, t) {
        var ts = t / 2 % measure;
        return Math.sin(x * (Math.exp(-ts * y))) * Math.exp(-ts * z);
    }

    function note(n, octave) {
        if (octave === undefined) octave = 0;
        return Math.pow(2, (
            n + 12 - 33 + (12 * (octave || 0))
            ) / 12) * that.tuning; // A4 tuning
    }

    function Noise() {
        return Math.random() * 2 - 1;
    }

    function sin(x, t) {
        return Math.sin(2 * Math.PI * t * x);
    }

    function tri(x, t) {
        return Math.abs(1 - (2 * t * x) % 2) * 2 - 1;
    }
}
