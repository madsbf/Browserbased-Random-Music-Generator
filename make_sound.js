
// Thanks to:
// https://gist.github.com/Likeyn/824f5b3e9278fa0c8745
// https://github.com/possan/wavepot-runtime
// math.js


var bpm = random_between(60, 180);
console.log(bpm);

var tuning = 440;
var transpose = 12;

var scale_names = Object.keys(scales);
var scale_name = pick_random_element(scale_names);
console.log(scale_name);
var scale = scales[scale_name];


// Constants
var tau = 2 * Math.PI;


// Adjust tuning to bpm
tuning *= 60 / bpm;

// Chords and notes
var hat_note = note(7, 6);
var kick_note = note(2, -1);
var snare_note = note(7, -1);

function pick_random_element(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function randomNote(scale) {
    random_note = pick_random_element(scale);
    return random_note;
}

/// scales, volume of drums, wave_form, volume, bpm

function random_between(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomCord(scale) {
    min = -1;
    max = 1;
    random_octave = random_between(min, max);
    first = randomNote(scale) + random_octave * 12;
    second = randomNote(scale) + random_octave * 12;
    third = randomNote(scale) + random_octave * 12;
    return [first, second, third];
}

var chords = [
  randomCord(scale),
  randomCord(scale),
];
console.log(chords);
var chords_2 = [
  randomCord(scale),
  randomCord(scale),
];
var bass_notes = [
  randomNote(scale), randomNote(scale), randomNote(scale), randomNote(scale)
];






function double_matrix(matrix, no_times) {
    for (i = 0; i < no_times; i++) {
        matrix = matrix.augment(matrix)
    }
    return matrix;
}

function generate_random_binary_matrix(columns, probability) {
    random_matrix = Matrix.Random(5, columns);
    return random_matrix.map(function(x) { return x < probability;});
}

function generate_random_track(threshold) {
    random_16 = generate_random_binary_matrix(16, threshold);
    random_8 = generate_random_binary_matrix(8, threshold);
    random_4 = generate_random_binary_matrix(4, threshold);
    random_2 = generate_random_binary_matrix(2, threshold);
    pattern_16_repeat = random_16;
    pattern_8_repeat = double_matrix(random_8, 1);
    pattern_4_repeat = double_matrix(random_4, 2);
    pattern_2_repeat = double_matrix(random_2, 3);
    combined = pattern_16_repeat.add(pattern_8_repeat).add(pattern_4_repeat).add(pattern_2_repeat);
    return combined;
}

var random_matrix = generate_random_track(0.1);

var synth_pattern_1 = random_matrix.elements[0];//pattern_16[0];
var synth_pattern_2 = random_matrix.elements[1];
var bass_pattern = random_matrix.elements[2];
var hat_pattern = random_matrix.elements[3];
var snare_pattern = random_matrix.elements[4];

var chords_mapped = chords.map(function(chord){
  return chord.map(function(n){
    return note(n);
  });
});
var chords_2_mapped = chords_2.map(function(chord){
  return chord.map(function(n){
    return note(n);
  });
});
var bass_notes_mapped = bass_notes.map(function(n){
    return note(n);
});

function dsp(t, f) {
  t *= bpm / 120;

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
  var synth = sequence(1/2, synth_pattern_1, t) * env(1, synth_osc_1, 1, 1, t)
  + sequence(1/4, synth_pattern_2, t) * env(1/16, synth_osc_2, 0, 0, t);

  // Bass
  var basseq = sequence(1, bass_notes_mapped, t);
  var bass_osc = 0.7 * tri(basseq, t);
  var bass = sequence(1/16, bass_pattern, t) * env(1, bass_osc, 0, 0, t);

  // Drums
  var kick_osc = 1.0 * sin(kick_note, t);
  var kick = env(1/2, kick_osc, 10, 10, t);
  var hat_osc = 0.2 * tri(hat_note, t) + 0.4 * noise;
  var hat = sequence(1/4, hat_pattern, t) * env(1/4, hat_osc, 87, 18, t);
  var snare_osc = 0.7 * sin(snare_note, t) + 0.3 * noise;
  var snare = sequence(1/4, snare_pattern, t) * env(1/4, snare_osc, 14, 11, t);

  return 1 * (
    0.2 * synth
  + 0.3 * hat
  + 0.8 * kick
  + 0.6 * snare
  + 0.3 * bass
  );
}

function sequence(measure, seq, t){
  return seq[(t / measure / 2 | 0) % seq.length];
}
function env(measure, x, y, z, t){
  var ts = t / 2 % measure;
  return Math.sin(x * (Math.exp(-ts * y))) * Math.exp(-ts * z);
}
function note(n, octave) {
  return Math.pow(2, (
    n + transpose - 33 + (12 * (octave || 0))
  ) / 12) * tuning; // A4 tuning
}

function Noise() { return Math.random() * 2 - 1; }
function sin(x, t) { return Math.sin(tau * t * x); }
function tri(x, t) { return Math.abs(1 - (2 * t * x) % 2) * 2 - 1; }
