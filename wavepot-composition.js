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
function mask(base_matrix, mask, new_matrix) {
    for (x = 0; x <= base_matrix.rows(); x++) {
        for (y = 0; y <= base_matrix.cols(); y++) {
            if (mask.e(x+1,y+1)) {
                base_matrix.elements[x][y] = new_matrix.elements[x][y];
            }
        }
    }
}
function random_standard_normal() {
	return (Math.random()*2-1)+(Math.random()*2-1)+(Math.random()*2-1);
}
function random_normal(mean, stdev) {
	return random_standard_normal()*stdev+mean;
}


function WavepotComposition() {

    var that = this;

    var scales = {
        'major': [0, 2, 4, 5, 7, 9, 11],
        'minor': [0, 2, 3, 5, 7, 8, 10],
        'ionian': [0, 2, 4, 5, 7, 9, 11],
        'aeolian': [0, 2, 3, 5, 7, 8, 10],
        'dorian': [0, 2, 3, 5, 7, 9, 10],
        'mixolydian': [0, 2, 4, 5, 7, 9, 10],
        'lydian': [0, 2, 4, 6, 7, 9, 11],
        'phrygian': [0, 1, 3, 5, 7, 8, 10],
        'locrian': [0, 1, 3, 5, 6, 8, 10],
        'diminished': [0, 1, 3, 4, 6, 7, 9, 10],
        'whole half': [0, 2, 3, 5, 6, 8, 9, 11],
        'whole tone': [0, 2, 4, 6, 8, 10],
        'minor blues': [0, 3, 5, 6, 7, 10],
        'minor pentatonic': [0, 3, 5, 7, 10],
        'major pentatonic': [0, 2, 4, 7, 9],
        'harmonic minor': [0, 2, 3, 5, 7, 8, 11],
        'melodic minor': [0, 2, 3, 5, 7, 9, 11],
        'super locrian': [0, 1, 3, 4, 6, 8, 10],
        'bhairav': [0, 1, 4, 5, 7, 8, 11],
        'hungarian minor': [0, 2, 3, 6, 7, 8, 11],
        'minor gypsy': [0, 1, 4, 5, 7, 8, 10],
        'hirojoshi': [0, 2, 3, 7, 8],
        'in sen': [0, 1, 5, 7, 10],
        'iwato': [0, 1, 5, 6, 10],
        'kumoi': [0, 2, 3, 7, 9],
        'pelog': [0, 1, 3, 4, 7, 8],
        'spanish': [0, 1, 3, 4, 5, 6, 8, 10],
        'ion aeol': [0, 2, 3, 4, 5, 7, 8, 9, 10, 11]
    };

    // Log basic composition info
    this.log = function() {
        console.log("bpm: " + that.bpm + "\n" +
                    "scale: " + that.scale_name + "\n" +
                    "chord: " + that.chords);
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
        var matrix_16 = generate_random_binary_matrix(16, threshold);
        var matrix_8 = generate_random_binary_matrix(8, threshold);
        var matrix_4 = generate_random_binary_matrix(4, threshold);
        var matrix_2 = generate_random_binary_matrix(2, threshold);
        var matrices = [matrix_2, matrix_4, matrix_8, matrix_16];
        return matrices;
    }
    this.randomize = function(ratio) {

        // Change the song by a ratio between 0 and 1. 1 means completely new track and 0 means no change at all.

        // Randomize stepsequencer
        // How: Make a new song and mix the two songs by using a random bit-matrix as mask.
        matrices = generate_random_step_sequencer(this.step_sequencer_threshold);
        var new_matrix_2 = matrices[0];
        var new_matrix_4 = matrices[1];
        var new_matrix_8 = matrices[2];
        var new_matrix_16 = matrices[3];
        var mask_2 = generate_random_binary_matrix(2, ratio);
        var mask_4 = generate_random_binary_matrix(4, ratio);
        var mask_8 = generate_random_binary_matrix(8, ratio);
        var mask_16 = generate_random_binary_matrix(16, ratio);
        mask(this.matrix_2, mask_2, new_matrix_2);
        mask(this.matrix_4, mask_4, new_matrix_4);
        mask(this.matrix_8, mask_8, new_matrix_8);
        mask(this.matrix_16, mask_16, new_matrix_16);

        // Randomize bpm
        // How: Find new value and make weighted average
        var new_bpm = random_between(60, 180);
        this.bpm = this.bpm * (1-ratio) + new_bpm * ratio;

        // Randomize chords
        // How:
        //      1. Switch scale  with probability <ratio>
        //      2. Move nodes that are inconsistent with the new scale either up or down (with equal probability)
        //      3. Change each node with probability <ratio>
        // Change scale
        if (Math.random() < ratio) {
            this.scale_name = random_element(Object.keys(scales));
            this.scale = scales[this.scale_name];
        }
        delta = Math.round(Math.random())*2-1; // -1 or 1
        // Change chords and nodes or adjusting nodes to fit to scale
        for (var chord_no=0; chord_no < this.chords.length; chord_no++) {
            if (Math.random() < ratio) {
                // Change chord
                this.chords[chord_no] = randomCord();
            } else {
                // Adjust to scale if needed
                for (var node_no=0; node_no < this.chords[chord_no].length; node_no++) {
                    while (!(this.scale.indexOf(((this.chords[chord_no][node_no]%12)+12)%12) > -1)) {
                        this.chords[chord_no][node_no] += delta;
                    }
                }
            }
        }
        for (var chord_no=0; chord_no < this.chords_2.length; chord_no++) {
            if (Math.random() < ratio) {
                this.chords_2[chord_no] = randomCord();
            }
        }
        for (var node_no=0; node_no < this.bass_notes.length; node_no++) {
            if (Math.random() < ratio) {
                this.bass_notes[node_no] = randomNote();
            }
        }
        this.log();
        compile_sound();
    }
    function toID() {
        // TODO: Implement
    }
    function initializeFromID() {
        // TODO: Implement
    }
    this.rickAstley = function() {
        // Change song to Never gonna give you up - Rick Astley
        // The code is originally produced by Likeyn: https://gist.github.com/Likeyn/824f5b3e9278fa0c8745
        that.bpm = 110;
        that.scale_name = 'mixolydian';
        that.chords = [
          [10, 14, 17],
          [9, 12, 16],
        ];
        that.chords_2 = [
          [12, 16, 19],
          [14, 17, 21],
        ];
        that.bass_notes = [
          10, 12, 9, 14
        ];
        that.matrix_16 = $M([
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ]);
        that.matrix_8 = $M([
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 1, 1, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ]);
        that.matrix_4 = $M([
            [1, 1, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 1, 0]
        ]);
        that.matrix_2 = $M([
            [0, 0],
            [0, 0],
            [0, 0],
            [0, 1],
            [0, 0]
        ]);
        compile_sound();
        that.log();
    };

    // Initialize composition
    this.bpm = random_between(60, 180);
    this.tuning = 440 * 60 / this.bpm;
    this.scale_name = random_element(Object.keys(scales));
    this.scale = scales[this.scale_name];

    this.chords = [
        randomCord(),
        randomCord(),
    ];
    this.chords_2 = [
        randomCord(),
        randomCord(),
    ];
    this.bass_notes = [
        randomNote(),
        randomNote(),
        randomNote(),
        randomNote()
    ];
    this.step_sequencer_threshold = random_normal(0.1, 0.05);
    matrices = generate_random_step_sequencer(this.step_sequencer_threshold);
    this.matrix_2 = matrices[0];
    this.matrix_4 = matrices[1];
    this.matrix_8 = matrices[2];
    this.matrix_16 = matrices[3];

    this.log();
    compile_sound();

    function compile_sound() {
        that.hat_note = 7;
        that.kick_note = 2;
        that.snare_note = 7;
        // Convert to notes

        that.combined = that.matrix_16
                .add(replicate_matrix(that.matrix_8, 16))
                .add(replicate_matrix(that.matrix_4, 16))
                .add(replicate_matrix(that.matrix_2, 16));
        that.synth_pattern_1 = that.combined.elements[0];
        that.synth_pattern_2 = that.combined.elements[1];
        that.bass_pattern = that.combined.elements[2];
        that.hat_pattern = that.combined.elements[3];
        that.snare_pattern = that.combined.elements[4];
        that.chords_mapped = that.chords.map(function (chord) {
            return chord.map(function (n) {
                return note(n);
            });
        });
        that.chords_2_mapped = that.chords_2.map(function (chord) {
            return chord.map(function (n) {
                return note(n);
            });
        });
        that.bass_notes_mapped = that.bass_notes.map(function (n) {
            return note(n);
        });
        that.hat_mapped = note(that.hat_note, 6);
        that.kick_mapped = note(that.kick_note, -1);
        that.snare_mapped = note(that.snare_note, -1);
    }

    this.dsp = function(t, f) {
        t *= that.bpm / 60;

        var noise = Noise();

        // Rythm synth
        var c1 = sequence(2, that.chords_mapped, t);
        var c2 = sequence(2, that.chords_2_mapped, t);
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
        var synth = sequence(1 / 2, that.synth_pattern_1, t) * env(1, synth_osc_1, 1, 1, t)
            + sequence(1 / 4, that.synth_pattern_2, t) * env(1 / 16, synth_osc_2, 0, 0, t);

        // Bass
        var basseq = sequence(1, that.bass_notes_mapped, t);
        var bass_osc = 0.7 * tri(basseq, t);
        var bass = sequence(1 / 16, that.bass_pattern, t) * env(1, bass_osc, 0, 0, t);

        // Drums
        var kick_osc = 1.0 * sin(that.kick_mapped, t);
        var kick = env(1 / 2, kick_osc, 10, 10, t);
        var hat_osc = 0.2 * tri(that.hat_mapped, t) + 0.4 * noise;
        var hat = sequence(1 / 4, that.hat_pattern, t) * env(1 / 4, hat_osc, 87, 18, t);
        var snare_osc = 0.7 * sin(that.snare_mapped, t) + 0.3 * noise;
        var snare = sequence(1 / 4, that.snare_pattern, t) * env(1 / 4, snare_osc, 14, 11, t);

        return (
              0.2 * synth
            + 0.3 * hat
            + 0.8 * kick
            + 0.4 * snare
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
        octave = octave || 0;
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
