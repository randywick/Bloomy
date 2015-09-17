'use strict';

const BitSet = require('bit-set');
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


function Bloomy(options) {
  this.m = (options && options.m)? options.m : DEFAULT_M;

  this.hashes = [];
  this.k = (options && options.k)? options.k : DEFAULT_K;
  this.setK(this.k);

  this.bitSet = new BitSet();
}


Bloomy.prototype.setK = function(k) {
  this.k = k;
  this.hashes = [];
  for (let i = 0; i < k; i++) {
    if (i < HASH_ORDER.length) {
      this.hashes.push(hashes[HASH_ORDER[i]]);
      continue;
    }

    this.hashes.push(
      stackHash('fnv', i - (HASH_ORDER.length - 1), this.m)
    );
  }

  return true;
};


Bloomy.prototype.setM = function(m) {
  this.m = m;
  return true;
};


Bloomy.prototype.showHashes = function() {
  return this.hashes;
};


Bloomy.prototype.getHashes = function(test) {
  const hashes = this.hashes.map(hash => hash.hash(test));
  console.log(test, hashes);
  return hashes;
};


Bloomy.prototype.set = function(key) {
  const hashes = this.getHashes(key);
  hashes.forEach(hash => this.bitSet.set(hash));
  return true;
};


Bloomy.prototype.test = function(key) {
  let hashes = this.getHashes(key);
  hashes = hashes.map(hash => this.bitSet.get(hash));
  console.log(key, hashes);
  hashes = hashes.filter(el => el === 0);
  return hashes.length === 0;
};


exports = module.exports = Bloomy;