'use strict';

const chai = require('chai');
const expect = chai.expect;

const fnv = require('../lib/hashes/fnv');

describe('fnv', () => {

  describe('#hash()', () => {
    const data =  [
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

    it('calculates a hash from a given string', () => {
      const tests = data.map(el => fnv.hash(el))
        .filter((val, i) => !(!isNaN(val) && data[i] !== val));

      expect(tests.length).to.equal(0);
    })
  })

});