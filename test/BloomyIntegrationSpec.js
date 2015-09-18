'use strict';

const Promise = require('bluebird');
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;

const Bloomy = require('../lib/Bloomy');

describe('Bloomy', function() {
  this.timeout(60000000);
  it('gets approximate N', () => {

    const test = (() => {
      const lc = 'abcdefghijklmnopqrstuvwxyz';
      const uc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const alphabet = lc;
      const getKey = () => {
        let len = 8;
        let id = '';
        for (let i = 0; i < len; i++) {
          let pos = Math.floor(Math.random() * alphabet.length);
          id += alphabet[pos];
        }

        return id;
      };

      const _cache = {size: 0};
      function cache(key) {
        if (_cache[key] === true) return;
        _cache[key] = true;
        _cache.size++;
      }

      const bloomy = new Bloomy();
      const targetP = 0.01;
      const volume = 10000;
      bloomy.optimize(volume, targetP);

      let ts = Date.now();
      let prev = 0;
      let rejected = 0;

      for (let i = 0; i < volume; i++) {
        if ((i + 1) % 1000 === 0) {
          const elapsed = Date.now() - ts;
          let change = prev? elapsed - prev : 0;
          if (change >= 0) change = '+' + change;
          prev = elapsed;
          ts = Date.now();

          console.log(`${(i+1)/1000} of ${Math.floor(volume/1000)} chunks in ${elapsed}ms (${change}ms)`);
        }
        const key = getKey();
        if (!!bloomy.testKey(key)) rejected++;
        cache(key);
        bloomy.push(key);
      }

      const approxN = bloomy.approximateN();
      const m = bloomy.getM();
      const k = bloomy.getK();

      const accepted = volume - rejected;
      const fp = _cache.size - accepted;
      const fpRate = fp/_cache.size;

      console.log('---------');
      console.log(`  Actual Volume:  ${volume}`);
      console.log(`      Approx. N:  ${approxN}`);
      console.log(`       Actual N:  ${_cache.size}`);
      console.log(`       Accepted:  ${accepted}`);
      console.log(`       Rejected:  ${rejected}`);
      console.log(`              M:  ${m}`);
      console.log(`              K:  ${k}`);
      console.log(`       Target P:  ${targetP}`);
      console.log(`False Positives:  ${fp}`);
      console.log(`        FP Rate:  ${fpRate}`);
      return approxN;
    })();

    expect(test).to.be.a('number');
  });

});