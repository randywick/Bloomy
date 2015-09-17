'use strict';

const Promise = require('bluebird');
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;

const stackHash = require('../lib/stackHash');

describe('stackHash', () => {

  it('given a `hash`, `i` and `m`, returns a new hash derived from `hash`', () => {
    const test = stackHash('fnv', 2, 100000);
    expect(test).to.be.an.instanceof(Function);
  })

});