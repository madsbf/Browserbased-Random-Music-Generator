/**
 *
 * Never gonna give you up - Rick Astley
 *
 * Code originally by Likeyn: https://gist.github.com/Likeyn/824f5b3e9278fa0c8745
 *
 * */

var chords = [
  [10, 14, 17],
  [9, 12, 16],
];
var chords_2 = [
  [12, 16, 19],
  [14, 17, 21],
];
var bass_notes = [
  10, 12, 9, 14
];
var bpm = 220;
rick_astley_16 = $M([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
]);

rick_astley_8 = $M([
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
]);

rick_astley_4 = $M([
    [1, 1, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 1, 0]
]);

rick_astley_2 = $M([
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 1],
    [0, 0]
]);
pattern_16_repeat = rick_astley_16;
pattern_8_repeat = double_matrix(rick_astley_8, 1);
pattern_4_repeat = double_matrix(rick_astley_4, 2);
pattern_2_repeat = double_matrix(rick_astley_2, 3);
combined = pattern_16_repeat.add(pattern_8_repeat).add(pattern_4_repeat).add(pattern_2_repeat);
var random_matrix = combined;

