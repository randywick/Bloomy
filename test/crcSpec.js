'use strict';

const chai = require('chai');
const expect = chai.expect;

const crc = require('../lib/hashes/crc');

describe('crc', () => {
  const decoded =  [
    '86f09b30-5ca6-11e5-a1db-a508ea863aeb',
    '87064610-5ca6-11e5-a1db-a508ea863aeb',
    '9963a8c0-5ca6-11e5-a1db-a508ea863aeb',
    '99649320-5ca6-11e5-a1db-a508ea863aeb',
    '996c8260-5ca6-11e5-a1db-a508ea863aeb',
    '996e3011-5ca6-11e5-a1db-a508ea863aeb',
    '996ea540-5ca6-11e5-a1db-a508ea863aeb',
    '996f4180-5ca6-11e5-a1db-a508ea863aeb',
    '996fddc0-5ca6-11e5-a1db-a508ea863aeb'
  ];


  describe('table', () => {
    it('pre-generates a lookup table', () => {
      expect(crc.table).to.be.an.instanceof(Array);
    });
  });


  describe('#hash()', () => {

    it('generates a crc32 hash from a string', () => {
      const test = decoded.map(el => crc.hash(el))
        .filter(el => isNaN(el));

      expect(test.length).to.equal(0);
    });

  });

});