exports = module.exports = function stackHash(hashName, i) {
  return {
    hash: message => {
      const hash = require('./hashes')[hashName];
      return (hash.hash(message) + hash.hash(message) * i)
    }
  }
};