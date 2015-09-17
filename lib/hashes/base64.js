exports = module.exports;


/**
 * Encodes the provided value as a base64 number.
 *
 * @param {string|number} decoded - the value to encode
 * @returns {string}
 */
function encode(decoded) {
  return new Buffer(decoded).toString('base64');
}

exports.encode = encode;


/**
 * Decodes a base64 number and returns its utf8 value.
 *
 * @param {string} encoded - the value to decode
 * @returns {string}
 */
function decode(encoded) {
  return new Buffer(encoded, 'base64').toString();
}

exports.decode = decode;