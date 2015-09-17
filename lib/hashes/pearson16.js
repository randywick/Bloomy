'use strict';

/**
 * Pearson hash module
 * @module pearson16
 */
exports = module.exports;


/**
 * Generates a new table.  Not necessary as a capture is below.
 */
const table = (() => {
  let table = [];
  let remaining = 256;
  while (remaining--) {
    table.push(Math.floor(Math.random() * 256));
  }

  //console.log(table);
  return table;
})();

exports.table = table;


/**
 * Generates a 16-character hash from a series of 8-bit Pearson hashes.
 * @see {@link https://en.wikipedia.org/wiki/Pearson_hashing}
 *
 * Examples:
 * 020042c7c7c7c742
 * 14fac74114c742c7
 * c750fa0075fac714
 * c7020202420242c7
 * 000075c70000c7c7
 * 92c742c7fa424142
 * c71475c7c7009242
 * 0292c702c7c702c7
 * 4200754200140050
 *
 * (sliced in half)
 * 2098220
 * 21998708
 * 208998304
 * 208674848
 * 1884
 * 153908268
 * 208750428
 * 2698352
 * 69207892
 *
 * @param message
 * @returns {string}
 */
function hash(message) {
  let chars = message.split('')
    .map(char => char.charCodeAt(0) & 0xff);

  const T = [
    // pre-generated from table above
    190, 236, 9, 52, 126, 208, 88, 224, 230, 78, 88, 230, 113, 158, 9, 62,       //  1
    98, 119, 151, 65, 131, 171, 252, 51, 234, 180, 95, 112, 152, 102, 64, 162,   //  2
    122, 80, 145, 46, 113, 215, 189, 227, 98, 122, 20, 167, 32, 245, 132, 85,    //  3
    243, 209, 16, 243, 207, 201, 55, 187, 108, 65, 161, 109, 86, 129, 32, 1,     //  4
    125, 123, 95, 142, 44, 117, 186, 72, 111, 42, 24, 227, 164, 239, 101, 1,     //  5
    124, 201, 228, 131, 139, 171, 64, 140, 6, 204, 17, 199, 15, 202, 0, 103,     //  6
    195, 39, 161, 255, 159, 192, 163, 243, 150, 16, 91, 72, 99, 253, 31, 228,    //  7
    237, 231, 190, 66, 17, 170, 128, 52, 65, 193, 183, 15, 187, 37, 21, 81,      //  8
    1, 80, 65, 223, 172, 153, 51, 20, 142, 117, 2, 233, 0, 93, 223, 179,         //  9
    59, 170, 35, 170, 144, 53, 60, 81, 144, 39, 170, 237, 228, 51, 80, 200,      // 10
    17, 28, 21, 251, 116, 131, 43, 21, 102, 168, 160, 94, 77, 229, 16, 12,       // 11
    217, 153, 212, 254, 71, 46, 183, 44, 28, 154, 25, 43, 26, 207, 142, 234,     // 12
    111, 223, 244, 131, 13, 140, 201, 188, 63, 253, 146, 59, 41, 60, 61, 236,    // 13
    143, 240, 192, 166, 198, 199, 0, 5, 152, 148, 232, 33, 64, 178, 39, 1,       // 14
    159, 250, 147, 62, 147, 143, 63, 59, 152, 132, 184, 109, 207, 144, 197, 235, // 15
    113, 54, 223, 73, 34, 34, 169, 232, 1, 227, 208, 43, 189, 146, 91, 232       // 16
  ];

  let hex = [];

  for (let position = 0; position < 8; position++) {
    let char = T[(chars[0] + position) % 256];
    for (let i = 1; i < chars.length; i++) {
      char = T[char ^ chars[i]];
    }
    hex[position] = char;
  }

  let hash = hex
    .map(n => n.toString(16))
    .map(n => n.length === 1? '0' + n : n)
    .join('');

  hash = hash.substr(0, 7);
  hash = parseInt(hash, 16);
  if (hash < 0) hash *= -1;
  hash %= 2142779559;
  return hash;

}

exports.hash = hash;