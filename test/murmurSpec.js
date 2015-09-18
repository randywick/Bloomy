'use strict';

const chai = require('chai');
const expect = chai.expect;

const murmur = require('../lib/hashes/murmur');

describe('murmur', () => {

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

    it('returns a hash given a message and seed', () => {
      const test = data.map(el => murmur.hash(el, 1337))
        .filter(el => /[0-9a-f]/i.testKey(el));

      expect(test.length).to.equal(0);
    });
  });

});