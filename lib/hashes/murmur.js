'use strict';


/**
 * Murmur module.  Not quite there yet...
 */
exports = module.exports;


/**
 * @private
 *
 * MurmurHash.  Implementation doesn't appear to be quite working at present.
 * seeing some duplication...
 *
 * @see {@link https://en.wikipedia.org/wiki/MurmurHash}
 * @see {@link https://github.com/garycourt/murmurhash-js/blob/master/murmurhash2_gc.js}
 *
 * Examples:
 * 1786715520
 * 1786715520
 * 1786715520
 * 1545809763
 * 1786715520
 * 1786715520
 * 2114337273
 * 1786715520
 * 749296982
 *
 * @param message
 * @param seed
 * @returns {*}
 */
function hash(message, seed) {
  let chars = message.split('')
    .map(el => el.charCodeAt(0) & 0xff);

  const c1 = 0xcc9e2d51;
  const c2 = 0x1b873593;
  const r1 = 15;
  const r2 = 15;
  const m = 5;
  const n = 0xe6546b64;

  let hash = seed;

  const nBlocks = chars.length / 4;

  for (let i = 0; i < nBlocks; i++) {
    let k = chars[i];
    k *= c1;
    k = (k << r1) | (k >> (32 - r1));
    k *= c2;

    hash ^= k;
    hash = ((hash << r2) | (hash >> (32 - r2))) * m + n;
  }

  const left = chars.length & 3;
  let k1 = 0;


  if (left === 3) {
    k1 ^= chars[chars.length - 3] << 16
  }

  if (left === 2 || left === 3) {
    k1 ^= chars[chars.length - 2]  << 8
  }

  if (left === 1 || left === 2 || left === 3) {
    k1 ^= chars[chars.length -1];

    k1 *= c1;
    k1 = (k1 << r1) | (k1 >> (32 - r1));
    k1 *= c2;
    hash ^= k1;
  }

  hash ^= chars.length;
  hash ^= (hash >> 16);
  hash *= 0x85ebca6b;
  hash ^= (hash >> 13);
  hash *= 0xc2b2ae35;
  hash ^= (hash >> 16);


  console.log(hash);

  return hash;
}

exports.hash = hash;