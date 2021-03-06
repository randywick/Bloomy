'use strict';

const BitSet = require('bit-set');
const debug = require('util').debuglog('bloomy');
const hashFunctions = require('./hashes');
const stackHash = require('./stackHash');


const through = require('through2');
const Transform = require('stream').Transform;
const util = require('util');
util.inherits(Bloomy, Transform);


const DEFAULT_CACHE = 1000;
const DEFAULTS = {
  k: 7,
  m: 220705,
  p: 0.01,
  n: 10000
};

const HASH_ORDER = [
  'fnv',
  'jenkins',
  'pearson16',
  'crc'
];

const BLOOMY_STATE = {
  CREATED: 1,
  READY: 2,
  IMMUTABLE: 4
};


/**
 * Bloomy - bloom filter.  Accepts an optional options argument, which may
 * contain one or more of the following properties:
 *
 * - {number} n     - estimated count of all elements.  Defaults to 10000
 * - {number} m     - size of bit vector (how many positions to reserve).
 *                    Defaults to 220705.
 * - {number} p     - acceptable probability of false positive.  Defaults
 *                    to 0.01
 * - {number} k     - number of hash functions to apply.  Defaults to 7.
 * - {number} cache - number of element/hash pairs to cache in memory. This can
 *                    provide a substantial speed increase if duplicate elements
 *                    are likely to exist closely in proximity to each other.
 *                    (example: IP addresses from an access log).  Defaults
 *                    to 1000 pairs.
 *
 * Default values for N and P are arbitrary, with defaults for M and K
 * calculated by Bloomy#optimizeM() and Bloomy#optimizeK(), respectively.
 *
 * @param {object} [opts]
 * @constructor
 */
function Bloomy(opts) {
  Transform.call(this);

  this._streams = {
    union: [],
    intersect: [],
    diff: []
  };

  this._state = BLOOMY_STATE.CREATED;
  this._bitSet = new BitSet();

  this._cacheLimit = opts && opts.cache? opts.cache : DEFAULT_CACHE;
  this._cache = new Map();
  this._cacheOrder = [];

  this._k = 0;
  this._m = 0;
  this._n = 0;
  this._p = 0;

  ['k', 'm', 'n', 'p'].forEach(prop => {
    const set = this[`set${prop.toUpperCase()}`].bind(this);
    const value = !!opts && (!!opts[prop] || !!opts[prop.toUpperCase()])
      ? opts[prop] || opts[prop.toUpperCase()]
      : DEFAULTS[prop];

    set(value);
  });

  if (!opts || !opts.n || !opts.p) return;
  if (!opts.m) this.setM(Bloomy.optimizeM(this._n, this._p));
  if (!opts.k) this.setK(Bloomy.optimizeK(this._m, this._n));
}

/**
 * Calculates the optimal number of hashes K, given M and N
 *
 * @see {@link https://en.wikipedia.org/wiki/Bloom_filter#Optimal_number_of_hash_functions}
 *
 * @param {number} m - the bit vector size
 * @param {number} n - the anticipated number of elements
 * @returns {number}
 */
Bloomy.optimizeK = function(m, n) {
  const k = Math.ceil((m/n) * Math.log10(2));
  debug('optimizeK', k);
  return k;
};


/**
 * Calculates the optimal bit vector size M, given N and P.
 *
 * @see {@link https://en.wikipedia.org/wiki/Bloom_filter#Optimal_number_of_hash_functions}
 *
 * @param {number} n - the anticipated number of elements
 * @param {number} p - the target probability of returning a false positive
 * @returns {number}
 */
Bloomy.optimizeM = function(n, p) {
  const m = Math.ceil(-((n * Math.log10(p)) / (Math.pow(Math.log10(2), 2))));
  debug('optimizeN', m);
  return m;
};


// Expose hasherinos
Bloomy.hashFunctions = hashFunctions;


/**
 * Node Transform stream implementation
 *
 * @param data
 * @param enc
 * @param cb
 * @private
 */
Bloomy.prototype._transform = function(data, enc, cb) {
  const key = data.toString();

  if (!this.testKey(key)) {
    this._streams.union.forEach(stream => stream.write(data));
    this.add(key);
  }

  this.push(data);

  cb();
};


/**
 * Creates and returns a transform stream that discards data
 * not matching the Bloomy instance's bit vector.  Unlike the inherited
 * stream, this stream has no effect upon the bit vector.
 *
 * @returns {Transform}
 */
Bloomy.prototype.createIntersectStream = function() {
  const stream = through((chunk, enc, callback) => {
    const key = chunk.toString();
    if (this.testKey(key)) {
      //noinspection JSUnresolvedFunction
      stream.push(chunk);
    }
    callback();
  });

  return stream;
};


/**
 * Creates and returns a transform stream that discards data
 * matching the Bloomy instance's bit vector.  Unlike the inherited
 * stream, this stream has no effect upon the bit vector.
 *
 * @returns {Transform}
 */
Bloomy.prototype.createDiffStream = function() {
  const stream = through((chunk, enc, callback) => {
    const key = chunk.toString();
    if (!this.testKey(key)) {
      //noinspection JSUnresolvedFunction
      stream.push(chunk);
    }

    callback();
  });

  return stream;
};


/**
 * Creates and returns a transform stream that discards data
 * not matching the Bloomy instance's bit vector.  Union streams additionally
 * receive events from the interaction stream.
 *
 * @returns {Transform}
 */
Bloomy.prototype.createUnionStream = function() {
  const stream = through((chunk, enc, callback) => {
    const key = chunk.toString();
    if (!this.testKey(key)) {
      //noinspection JSUnresolvedFunction
      stream.push(chunk);
    }

    callback();
  });

  return stream;
};


/**
 * Validates properties and applies (or removes) the ready flag.
 *
 * @returns {Bloomy}
 * @private
 */
Bloomy.prototype._checkReady = function() {
  const props = ['k', 'm', 'n', 'p'];

  const ready = props.filter(prop => {
      const exists = typeof this[`_${prop}`] !== 'undefined';
      const isValid = this[`_${prop}`] > 0;
      return exists && isValid;
    }).length === props.length;

  if (ready) {
    this._state |= BLOOMY_STATE.READY;
    return this;
  }

  this._state ^= BLOOMY_STATE.READY;
  return this;
};


/**
 * Generic internal property setter, with protection against changing
 * properties after immutable flag is present.
 *
 * @param {string} prop - the property name that should be changed
 * @param {*}       val - the new property value
 * @returns {Bloomy}
 * @private
 */
Bloomy.prototype._setProp = function(prop, val) {
  if (this._state & BLOOMY_STATE.IMMUTABLE) {
    throw new Error(`Attempt to modify ${prop.toUpperCase()} while immutable`);
  }

  this[`_${prop}`] = val;
  this._checkReady();

  return this;
};


/**
 * Getter for K
 *
 * @returns {number}
 */
Bloomy.prototype.getK = function() {
  debug('getK', this._k);
  return this._k;
};


/**
 * Attempts to set the number of hashes K.  This method is only available
 * until the first key has been stored.
 * FIXME: this is about setting K, not defining hashes - move that logic
 *
 * @param {number} k - the number of hashes used
 * @returns {Bloomy}
 */
Bloomy.prototype.setK = function(k) {
  this._setProp('k', k);

  this._hashes = [];
  let primaryHashes = HASH_ORDER.slice();

  while (k--) {
    if (!!primaryHashes.length) {
      const name = primaryHashes.shift();
      this._hashes.push(hashFunctions[name]);
      continue;
    }

    this._hashes.push(stackHash('fnv', k));
  }

  return this;
};


/**
 * Getter for M
 *
 * @returns {number}
 */
Bloomy.prototype.getM = function() {
  debug('getM', this._m);
  return this._m;
};


/**
 * Attempts to set the bit vector size M.  This method is only available
 * until the first key has been stored.
 *
 * @param {number} m - the bit vector size
 * @returns {Bloomy}
 */
Bloomy.prototype.setM = function(m) {
  this._setProp('m', m);
  return this;
};


/**
 * Getter for N
 *
 * @returns {number}
 */
Bloomy.prototype.getN = function() {
  debug('getN', this._n);
  return this._n;
};


/**
 * Attempts to set the anticipated volume N.  This method is only available
 * until the first key has been stored.
 *
 * @param {number} n - the anticipated number of elements
 * @returns {Bloomy}
 */
Bloomy.prototype.setN = function(n) {
  this._setProp('n', n);
  return this;
};


/**
 * Getter for P
 *
 * @returns {number}
 */
Bloomy.prototype.getP = function() {
  debug('getP', this._p);
  return this._p;
};


/**
 * Attempts to set the target false positive probability P.  This method is
 * only available until the first key has been stored.
 *
 * @param {number} p - the target probability of returning a false positive
 * @returns {Bloomy}
 */
Bloomy.prototype.setP = function(p) {
  this._setProp('p', p);
  return this;
};


/**
 * Attempts to optimize K and M values in order to achieve maximum efficiency.
 *
 * @param {number} n - the anticipated number of elements
 * @param {number} p - the target probability of returning a false positive
 * @returns {Bloomy}
 */
Bloomy.prototype.optimize = function(n, p) {
  const m = Bloomy.optimizeM(n, p);
  const k = Bloomy.optimizeK(m, n);

  this.setM(m);
  this.setK(k);

  debug(`optimize {m: ${m}, k:${k}}`);
  return this;
};


/**
 * Returns the array of hash functions created for this instance
 *
 * @returns {Array}
 */
Bloomy.prototype.showHashes = function() {
  debug('showHashes', this._hashes);
  return this._hashes;
};


/**
 * Calculates and returns hashes for `key`.  If caching is enabled, this will
 * first attempt to resolve `key` from the cache.  If the cache does not
 * contain hashes for `key`, they will be pushed to cache, potentially shifting
 * an existing cache value.
 *
 * @param {string} key - the key to be hashed
 * @returns {Array}
 */
Bloomy.prototype.hash = function(key) {
  const cache = this._cache;
  const cacheLimit = this._cacheLimit;
  const order = this._cacheOrder;

  if (cache.has(key)) {
    debug('getHashes - cached', key, cache.get(key));
    return cache.get(key);
  }

  const hashes = this._hashes.map(hash => hash.hash(key) % this._m);

  if (!!cacheLimit) {
    cache.set(key, hashes);
    order.push(key);
    if (cache.size >= cacheLimit) cache.delete(order.shift());
  }

  debug('getHashes', key, hashes);
  return hashes;
};


/**
 * Pushes hashes for `key` to the bit vector
 *
 * @param {string} key - the key to record
 * @returns {boolean}
 */
Bloomy.prototype.add = function(key) {
  const hashes = this.hash(key);
  hashes.forEach(hash => this._bitSet.set(hash));
  this._state |= BLOOMY_STATE.IMMUTABLE;
  return true;
};


/**
 * Tests whether a single bit is set in the bit set.  This function provides
 * the test for Bloomy.prototype.testKey
 *
 * @param {BitSet} bitSet    - the bit set to test against
 * @param {number} position  - the bit position to test
 * @returns {number}
 */
function testBit(bitSet, position) {
  //noinspection JSUnresolvedFunction
  const bit = bitSet.get(position)? 1 : 0;

  debug('testBit', bit);
  return bit;
}


/**
 * Tests a key's hash values against the bit vector.  Returns true if all
 * bit vector positions are set, or false if one or more bit vector positions.
 * is unset.
 *
 * A result of true means the key probably matches an already-observed element.
 * A result of false is guaranteed to be unique among observed elements.
 *
 * @param {string} key - the key to test
 * @returns {boolean}
 */
Bloomy.prototype.testKey = function(key) {
  const hashes = this.hash(key);
  const bits = hashes.map(hash => testBit(this._bitSet, hash));
  const filtered = bits.filter(el => el === 0);

  debug('testKey', key, hashes, bits, filtered);
  return filtered.length === 0;
};


/**
 * Returns the approximate cardinality of observed values.
 * @see {@link https://en.wikipedia.org/wiki/Bloom_filter#Approximating_the_number_of_items_in_a_Bloom_filter}
 *
 * FIXME: this is resulting is very low approximations.
 *
 * @returns {number}
 */
Bloomy.prototype.approximateN = function() {
  console.log(`${this._bitSet.cardinality()} bits set`);
  const X = this._bitSet.cardinality();
  const numerator = this._m * Math.log10(1 - (X / this._m));
  const denominator = this._k;
  const n = -(numerator / denominator);

  debug('approximateN', n);
  return n;
};


exports = module.exports = Bloomy;