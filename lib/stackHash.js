exports = module.exports = function stackHash(hashName, i, m) {
  return {
    hash: message => {
      const hash = require('./hashes')[hashName];
      return (hash.hash(message) + hash.hash(message) * i) % m
    }
  }
};