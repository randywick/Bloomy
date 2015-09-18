'use strict';

const Promise = require('bluebird');
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;



const Bloomy = require('../lib/Bloomy');

describe('Bloomy', () => {

  it('calculates an optimal value for K, given M and N', () => {
    const m = 220705;
    const n = 10000;
    expect(Bloomy.optimizeK(m, n)).to.be.a('number');
  });

  it('calculates an optimal value for M, given N and P', () => {
    const n = 10000;
    const p = 0.01;
    expect(Bloomy.optimizeM(n, p)).to.be.a('number');
  })

});

describe ('Bloomy.prototype', function() {
  this.timeout(600000);
  const bloomy = new Bloomy();

  it('returns a new instance of Bloomy with default options', () => {
    expect(bloomy).to.be.an.instanceof(Bloomy);
  });

  it('returns K - the number of hash functions used', () => {
    expect(bloomy.getK()).to.be.a('number');
  });

  it('returns M - the instance capacity', () => {
    expect(bloomy.getM()).to.be.a('number');
  });

  it('sets K', () => {
    expect(bloomy.setK(5)).to.be.an.instanceof(Bloomy);
  });

  it('sets M', () => {
    expect(bloomy.setM(100000)).to.be.an.instanceof(Bloomy);
  });

  it('optimizes K and M, given N and P', () => {
    expect(bloomy.optimize(10000, 0.00001)).to.be.an.instanceof(Bloomy);
  });

  it('retrieves a list of active _hashes', () => {
    expect(bloomy.showHashes()).to.be.an.instanceof(Array);
  });

  it('given a testKey value, returns all _hashes', () => {
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
    expect(bloomy.testKey('foo')).to.equal(true);
    expect(bloomy.testKey('fizz')).to.equal(false);
  });

  it('prevents modification of K and M after first observation', () => {
    expect(() => bloomy.setK(1)).to.throw(Error);
    expect(() => bloomy.setM(1000)).to.throw(Error);
  });

});