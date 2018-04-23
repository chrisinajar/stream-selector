# stream-selector
A stream which lets you choose where to send the data based on the first chunk received

## Installation
`npm i --save stream-selector`  
or  
`yarn add stream-selector`

## Usage
```js
var StreamSelector = require('stream-selector');

// create / get destination streams
someStream = createSomeStream();
someOtherStream = createSomeOtherStream();
someDefaultStream = createSomeDefaultStream();

function selectStream (firstChunk) {
  switch (firstChunk[0]) {
    case 0x00:
      return someStream;
    case 0x42:
      return someOtherStream;
    default:
      return someDefaultStream;
  }
}

// create selector stream
var selector = new StreamSelector(selectStream);

// when data is written tyo selector, it will use selectStream() to decide where the data should go
process.stdin.pipe(selector);
```

# API

#### `new StreamSelector([options])` => `StreamSelector`
Create a new writable stream which will select a sub-stream to pipe all of the data to. If you pass your `selector` method as the first parameter then options will be initialized with that value.

The result stream is a passthrough stream, however it will not write any data unless the stream selected is also readable.

 * `options` (`Object`):
   * `selector`: (`function (chunk, encoding, callback`) The method to use to choose which stream to use. You can either return the stream directly or use the callback. Note that if you return nothing, you *must* use the callback else the stream will infinitely hang. The data will be buffered until the decision is made.
   * `minBuffer`: (*optional* `Integer`) The number of bytes to read in before bothering to call the selector funciton. This is useful if you need a larger header of your data before a decision can be made. The data will be buffered until the decision is made.


# License
MIT
