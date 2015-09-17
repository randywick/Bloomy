# Bloomy
A JavaScript Bloom Filter.

## Use
```
const Bloomy = require('bloomy');
const bloomy = new Bloomy();
bloomy.setK(5);
bloomy.test('foo');
bloomy.set('bar');
```

## About
**Bloomy** is a work-in-progress bloom filter designed for speed and simplicity.
Bloomy uses FNV, Jenkins, Pearson16, and CRC hashes, while supplementing any
additional K requirements satisfied by [derived FNV](http://willwhim.wpengine.com/2011/09/03/producing-n-hash-functions-by-hashing-only-once/)
.  Included hashes will be optimized over time to ensure optimally
normalized distribution and blazing fast execution time.

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
* Node.JS Stream integration
* Simple set comparisons: union, intersect, diff
* Smooth automatic scaling of K and M
* Re-write and replacement of BitSet - LevelDB?
* Estimate cardinality
* Lots of data geekage

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

