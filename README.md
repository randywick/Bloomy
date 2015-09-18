# Bloomy
A JavaScript Bloom Filter.

## Use
```javascript
const Bloomy = require('bloomy');
const bloomy = new Bloomy();
bloomy.set('foo');
bloomy.test('bar');
```

## About
**Bloomy** is a work-in-progress bloom filter designed for speed and simplicity.
Bloomy uses FNV, Jenkins, Pearson16, and CRC hashes, while supplementing any
additional K requirements satisfied by [derived FNV](http://willwhim.wpengine.com/2011/09/03/producing-n-hash-functions-by-hashing-only-once/)
.  Included hashes will be optimized over time to ensure optimally
normalized distribution and blazing fast execution time.

##### Bloom Filter
Bloomy is a fast and efficient multi-algorithm bloom filter implementation
written in JavaScript for Node.js 4.0.0.  By default, Bloomy is optimized for
a set containing 10,000 members and a target false positive probability of 0.01.

Bloomy allows independent configuration of `K`, `M`, `N`, and `P`, by supplying
an `opts` object or calling `Bloomy.prototype.setK()`, etc.  `K` and `M` may
also be automatically configured by calling `Bloomy.prototype.optimize(n, p)`.
Configuration is only possible before the first value is pushed, after which
time properties become immutable and setters will throw an Error if attempted.

##### Hash Functions
In order to ensure the most effective normalized distribution of hash values
without prior knowledge of collection data, a variety of hashing functions
are employed.  Derivative hashing functions are lazy, slow and false-positive
prone as any biases or inefficiencies are amplified, which can result in a
linear loss of efficiency as demanded precision increases.

That said, when K exceeds the number of available hashing functions, we do
stack functions to meet demand.  This functionality is and will continue to be
closely scrutinized for performance and effectiveness.

###### Hash Function Distribution Data
Coming soon

###### Benchmarks
An integration test is provided in `tests/BloomyIntegrationSpec.js`, which
contains a variety of configuration options and a random data generator.  You
can tweak the settings of this script to explore how different properties
effect Bloomy's speed and performance.
```
1 of 10 chunks in 111ms (+0ms)
2 of 10 chunks in 76ms (-35ms)
3 of 10 chunks in 75ms (-1ms)
4 of 10 chunks in 78ms (+3ms)
5 of 10 chunks in 72ms (-6ms)
6 of 10 chunks in 74ms (+2ms)
7 of 10 chunks in 72ms (-2ms)
8 of 10 chunks in 71ms (-1ms)
9 of 10 chunks in 72ms (+1ms)
10 of 10 chunks in 74ms (+2ms)
52443 bits set
---------
  Actual Volume:  10000
      Approx. N:  3714.973570487823
       Actual N:  10000
       Accepted:  9998
       Rejected:  2
              M:  220705
              K:  7
       Target P:  0.01
False Positives:  2
        FP Rate:  0.0002
```

#### API
More Coming soon

* `Bloomy()` - constructor
* `Bloomy.optimizeK(m, n)` - calculates an optimized value for K
* `Bloomy.optimizeM(n, p)` - calculates an optimized value for M
* `Bloomy.prototype.getK()`
* `Bloomy.prototype.setK(k)`
* `Bloomy.prototype.getM()`
* `Bloomy.prototype.setM(m)`
* `Bloomy.prototype.getN()`
* `Bloomy.prototype.setN(n)`
* `Bloomy.prototype.getP()`
* `Bloomy.prototype.setP(p)`
* `Bloomy.prototype.optimize(n, p)`
* `Bloomy.prototype.showHashes()`
* `Bloomy.prototype.hash(key)`
* `Bloomy.prototype.push(key)`
* `Bloomy.prototype.testKey(key)`
* `Bloomy.prototype.approximateN()`

#### Interaction Stream
`Bloomy` instances inherit from stream.Transform.  Any data written or piped
 to the `Bloomy` instance will be added to the bit vector before being pushed
 through.
 
 
#### Observation Streams
Observation streams accept data and compare them to the bit vector before
returning or discarding the data.  Observation streams may be forwarded events
from the interaction stream, but observation stream events do not affect
the bit vector.
 
###### Union
```javascript
const bloomy = new Bloomy();
const unionStream = bloomy.createUnionStream();
```
A union stream is a transform stream that blocks all data that **are
represented** in the bit vector.  Additionally, interaction stream events
containing novel data are forwarded to any union streams.
 
###### Intersect
```javascript
const bloomy = new Bloomy();
const interStream = bloomy.createIntersectStream();
```
An intersect stream is a transform stream that blocks all data that **are 
represented** in the bit vector.  Intersect streams do not maintain independent 
bit vectors, so interaction stream events are not repeated.

###### Diff
```javascript
const bloomy = new Bloomy();
const diffStream = bloomy.createIntersectStream();
```
A diff stream is a transform stream that blocks all data **not 
represented** in the bit vector.  Diff streams do not maintain independent 
bit vectors, so interaction stream events are not repeated.

#### System Requirements
Written for Node.JS 4.0.0; however, you are free to put this to use in the
browser.  Some ES6 language features may cause problems in browsers; 
 transpilation is recommended.

#### Dependencies
* [bit-set](https://www.npmjs.com/package/bit-set) - this will be removed
  shortly; it is currently a placeholder until I have developed a replacement.
  
#### Tests
Nearly all exposed behaviors are covered.  Tests are located in `./test`.
Tests are written using [Chai](https://www.npmjs.com/package/chai) **expect**
syntax and run by [mocha](https://www.npmjs.com/package/mocha).  All test
files contain shortcut commands in `package.json`

#### Planned Features
* Re-write and replacement of BitSet - LevelDB?
* Estimate cardinality
* Lots of data geekage
* Proper bit folding to reduce large numbers while maintaining distribution
* Extract current integration test into a fully fledged configurable
  benchmarking tool

#### Issues
* Cardinality approximation is completely useless in its current form

#### Acknowledgements
Particularly helpful information sources are included in comments in the
hash modules.

#### License

Copyright (c) 2015 Randy Wick

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

