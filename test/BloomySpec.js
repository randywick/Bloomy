'use strict';

const Promise = require('bluebird');
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;

const Bloomy = require('../lib/Bloomy');

describe('index', () => {
  const bloomy = new Bloomy();

  describe('new Bloomy()', () => {

    it('returns a new instance of Bloomy with default options', () => {
      expect(bloomy).to.be.an.instanceof(Bloomy);
    });

    it('returns K - the number of hash functions used', () => {
      expect(bloomy.k).to.be.a('number');
    });

    it('returns M - the instance capacity', () => {
      expect(bloomy.m).to.be.a('number');
    });

    it('sets K', () => {
      //expect(bloomy.setK(5)).to.equal(true);
    });

    it('sets M', () => {
      expect(bloomy.setM(100000)).to.equal(true);
    });

    it('retrieves a list of active hashes', () => {
      expect(bloomy.showHashes()).to.be.an.instanceof(Array);
    });

    it('given a test value, returns all hashes', () => {
      expect(bloomy.getHashes('foo')).to.be.an.instanceof(Array);
    });

    it('sets all bits for a key', () => {
      const tests = [
        bloomy.set('foo'),
        bloomy.set('bar'),
        bloomy.set('baz')
      ];

      const completed = tests.filter(el => !el);
      expect(completed.length).to.equal(0);
    });

    it('tests a key for existence', () => {
      expect(bloomy.test('foo')).to.equal(true);
      expect(bloomy.test('fizz')).to.equal(false);
    })

  });

});