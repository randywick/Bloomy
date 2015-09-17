'use strict';

const chai = require('chai');
const expect = chai.expect;

const pearson16 = require('../lib/hashes/pearson16');

describe('pearson16', () => {

  describe('table', () => {
    it('generates the lookup table', () => {
      expect(pearson16.table).to.be.an.instanceof(Array);
    });
  });


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

    it('generates a 64-bit hash', () => {
      const test = data.map(el => pearson16.hash(el))
        .filter(el => /[^0-9A-F]/i.test(el));

      expect(test.length).to.equal(0);
    })
  })

});