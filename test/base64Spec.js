'use strict';

const chai = require('chai');
const expect = chai.expect;

const base64 = require('../lib/hashes/base64');

describe('base64', () => {
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

  const encoded = [
    'ODZmMDliMzAtNWNhNi0xMWU1LWExZGItYTUwOGVhODYzYWVi',
    'ODcwNjQ2MTAtNWNhNi0xMWU1LWExZGItYTUwOGVhODYzYWVi',
    'OTk2M2E4YzAtNWNhNi0xMWU1LWExZGItYTUwOGVhODYzYWVi',
    'OTk2NDkzMjAtNWNhNi0xMWU1LWExZGItYTUwOGVhODYzYWVi',
    'OTk2YzgyNjAtNWNhNi0xMWU1LWExZGItYTUwOGVhODYzYWVi',
    'OTk2ZTMwMTEtNWNhNi0xMWU1LWExZGItYTUwOGVhODYzYWVi',
    'OTk2ZWE1NDAtNWNhNi0xMWU1LWExZGItYTUwOGVhODYzYWVi',
    'OTk2ZjQxODAtNWNhNi0xMWU1LWExZGItYTUwOGVhODYzYWVi',
    'OTk2ZmRkYzAtNWNhNi0xMWU1LWExZGItYTUwOGVhODYzYWVi'
  ];

  describe('#encode()', () => {

    it('returns a base-64 encoded string', () => {
      const test = decoded.map(el => base64.encode(el))
        .filter(val => /[^a-zA-Z0-9+/=]/.test(val));

      expect(test.length).to.equal(0);
    });
  });


  describe('#decode()', () => {

    it('decodes a base-64 encoded string', () => {
      const test = encoded.map(el => base64.decode(el))
        .filter(val => decoded.indexOf(val) === -1);

      expect(test.length).to.equal(0);
    });
  });

});