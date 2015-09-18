/**
 * CRC32 Module.  Guided by {@see crc32c
 * {@link http://www.hackersdelight.org/hdcodetxt/crc.c.txt}}
 * @module crc
 */

'use strict';


exports = module.exports;


/**
 * Generates a CRC lookup table.
 * @type {Array}
 */
function generateTable() {
  let crc;
  let mask;
  let table = [];

  for (let byte = 0; byte < 255; byte++) {
    crc = byte;

    let bytes = 8;
    while (bytes--) {
      mask = -(crc & 1);
      crc = (crc >> 1) ^ (0xEDB88320 & mask);
    }

    table[byte] = crc;
  }

  return table;
}

exports.table = generateTable;


/**
 * Generates a CRC32 hash using the table generated above.
 *
 * Examples:
 * 479555051
 * 482369338
 * 249186031
 * 514141465
 * 209135036
 * 487501497
 * 238094008
 * 77587164
 * 292570362
 *
 * @param {string} message - the message to hash
 * @returns {number}
 */
function hash(message) {
  const table = generateTable();
  let crc = 0xFFFFFFFF;

  message.split('')
    .map(char => char.charCodeAt(0) & 0xff)
    .forEach(byte => crc = (crc >> 8) ^ table[(crc ^ byte) & 0xff]);

  let hash = ~crc;
  if (hash < 0) hash *= -1;
  hash %= 2142779559;
  return hash;
}

exports.hash = hash;