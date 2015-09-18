'use strict';

const BitSet = require('bit-set');
const debug = require('util').debuglog('bloomy');
const hashes = require('./hashes');
const stackHash = require('./stackHash');

const DEFAULT_K = 7;
const DEFAULT_M = 50000;


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


function Bloomy(options) {
  this._state = BLOOMY_STATE.CREATED;
  this.bitSet = new BitSet();

  const m = (options && options.m)? options.m : DEFAULT_M;
  this.setM(m);

  const k = (options && options.k)? options.k : DEFAULT_K;
  this.setK(k);

  this._useCache = true;
  this._cacheLimit = 1000;
  this._cache = new Map();
  this._cacheOrder = [];
}

/**
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
 * Calculates the optimal bit vector size, given N and P.
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
 *
 * @param {number} k - the number of hashes used
 * @returns {Bloomy}
 */
Bloomy.prototype.setK = function(k) {
  if (this._state & BLOOMY_STATE.IMMUTABLE) {
    throw new Error('Attempt to modify immutable property M');
  }

  this._k = k;
  this._hashes = [];

  for (let i = 0; i < k; i++) {
    if (i < HASH_ORDER.length) {
      this._hashes.push(hashes[HASH_ORDER[i]]);
      continue;
    }

    this._hashes.push(
      stackHash('fnv', i - HASH_ORDER.length)
    );
  }

  if (this._m && this._k) {
    this._state |= BLOOMY_STATE.READY;
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
  if (this._state & BLOOMY_STATE.IMMUTABLE) {
    throw new Error('Attempt to modify immutable property M');
  }

  this._m = m;

  if (this._m && this._k) {
    this._state |= BLOOMY_STATE.READY;
  }

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
  debug(`{m: ${m}, k:${k}}`);

  return this
    .setM(m)
    .setK(k);
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
Bloomy.prototype.getHashes = function(key) {
  const cache = this._cache;
  const useCache = this._useCache;
  const cacheLimit = this._cacheLimit;
  const order = this._cacheOrder;

  if (this._useCache === true && cache.has(key)) {
    debug('getHashes - cached', key, cache.get(key));
    return cache.get(key);
  }

  const hashes = this._hashes.map(hash => hash.hash(key) % this._m);


  if (useCache === true) {
    cache.set(key, hashes);
    order.push(key);
    if (cache.size >= cacheLimit) cache.delete(order.shift());
  }

  debug('getHashes', key, hashes);
  return hashes;
};


/**
 * Sets bit set positions corresponding to `key`'s hashes.
 *
 * @param {string} key - the key to record
 * @returns {boolean}
 */
Bloomy.prototype.set = function(key) {

  const hashes = this.getHashes(key);

  hashes.forEach(hash => this.bitSet.set(hash));

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
  let hashes = this.getHashes(key);
  let bits = hashes.map(hash => testBit(this.bitSet, hash));
  let filtered = bits.filter(el => el === 0);

  //if (filtered.length !== 0) {
  //  console.log(bits);
  //}0);

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
  console.log(`${this.bitSet.cardinality()} bits set`);
  const X = this.bitSet.cardinality();
  const num = this._m * Math.log10(1-(X/this._m));
  const denom = this._k;
  const n = -(num/denom);

  debug('approximateN', n);
  return n;
};


exports = module.exports = Bloomy;