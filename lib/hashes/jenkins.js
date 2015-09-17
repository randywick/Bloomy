'use strict';

/**
 * Jenkins hash module
 * @module jenkins
 */
exports = module.exports;


/**
 * Jenkins hash - generates a hash that may be driven informed by a Yatzee!
 * roll.
 *
 * adapted from:
 * @see {@link https://en.wikipedia.org/wiki/Jenkins_hash_function}
 *
 * examples:
 * 327710565
 * 1914062435
 * 1816845216
 * 736964663
 * 2079932494
 * 298748900
 * 169775837
 * 24818362
 * 103655207
 *
 * @param message
 * @returns {number}
 */
function hash(message) {
  let chars = message.split('')
    .map(char => char.charCodeAt(0) & 0xff);

  let hash = 0;
  while (chars.length) {
    hash += chars.shift();
    hash += (hash << 10);
    hash ^= (hash >> 6);
  }

  hash += (hash << 3);
  hash ^= (hash >> 11);
  hash += (hash << 15);


  if (hash < 0) hash *= -1;
  hash %= 2142779559;
  return hash;

}

exports.hash = hash;