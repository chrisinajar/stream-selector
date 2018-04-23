const test = require('tape');
const streamBuffers = require('stream-buffers');
const PassThrough = require('through2');
const StreamSelector = require('./');

test('basic usage w/o callback', function (t) {
  var selector = new StreamSelector(selectStream);
  var writable = new streamBuffers.WritableStreamBuffer();

  selector.on('error', (e) => {
    console.log(e);
    t.fail(e);
  });
  writable.on('error', t.fail);

  selector.write('1 2 3 4 5 6 7 8 ');
  selector.write('9 10 11 12 13 14 15 16');
  selector.end(null, function () {
    t.equal(writable.getContentsAsString(), '1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16', 'gets full string at the end');
    t.end();
  });

  function selectStream (chunk, encoding) {
    return writable;
  }
});

test('basic usage w/ callback', function (t) {
  var selector = new StreamSelector(selectStream);
  var writable = new streamBuffers.WritableStreamBuffer();

  selector.on('error', (e) => {
    console.log(e);
    t.fail(e);
  });
  writable.on('error', t.fail);

  selector.write('1 2 3 4 5 6 7 8 ');
  selector.write('9 10 11 12 13 14 15 16');
  selector.end(null, function () {
    t.equal(writable.getContentsAsString(), '1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16', 'gets full string at the end');
    t.end();
  });

  function selectStream (chunk, encoding, done) {
    setTimeout(function () {
      done(null, writable);
    }, 10);
  }
});

test('minBuffer enforcement', function (t) {
  var selector = new StreamSelector({
    minBuffer: 10,
    selector: selectStream
  });
  var writable = new streamBuffers.WritableStreamBuffer();

  selector.on('error', (e) => {
    console.log(e);
    t.fail(e);
  });
  writable.on('error', t.fail);

  selector.write('1 2 ');
  selector.write('3');
  selector.write(' 4');
  selector.write(' 5 ');
  selector.write('6 7 8 ');
  selector.write('9 10 11 12 13 14 15 16');
  selector.end(null, function () {
    t.equal(writable.getContentsAsString(), '1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16', 'gets full string at the end');
    t.end();
  });

  function selectStream (chunk, encoding) {
    t.ok(chunk.byteLength >= 10, 'receives enough data in the selector');
    return writable;
  }
});

// TRANSFORM STREAMS

test('transform basic usage w/o callback', function (t) {
  var selector = new StreamSelector(selectStream);
  var writable = new streamBuffers.WritableStreamBuffer();
  selector.pipe(writable);

  selector.on('error', (e) => {
    console.log(e);
    t.fail(e);
  });
  writable.on('error', t.fail);

  selector.write('1 2 3 4 5 6 7 8 ');
  selector.write('9 10 11 12 13 14 15 16');
  selector.end(null, function () {
    t.equal(writable.getContentsAsString(), '1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16', 'gets full string at the end');
    t.end();
  });

  function selectStream (chunk, encoding) {
    t.pass('selectStream was called');
    var passThrough = new PassThrough();
    return passThrough;
  }
});

test('transform basic usage w/ callback', function (t) {
  var selector = new StreamSelector(selectStream);
  var writable = new streamBuffers.WritableStreamBuffer();
  selector.pipe(writable);

  selector.on('error', (e) => {
    console.log(e);
    t.fail(e);
  });
  writable.on('error', t.fail);

  selector.write('1 2 3 4 5 6 7 8 ');
  selector.write('9 10 11 12 13 14 15 16');
  selector.end(null, function () {
    t.equal(writable.getContentsAsString(), '1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16', 'gets full string at the end');
    t.end();
  });

  function selectStream (chunk, encoding, done) {
    t.pass('selectStream was called');
    var passThrough = new PassThrough();

    setTimeout(function () {
      done(null, passThrough);
    }, 10);
  }
});

test('transform minBuffer enforcement', function (t) {
  var selector = new StreamSelector({
    minBuffer: 10,
    selector: selectStream
  });
  var writable = new streamBuffers.WritableStreamBuffer();
  selector.pipe(writable);

  selector.on('error', (e) => {
    console.log(e);
    t.fail(e);
  });
  writable.on('error', t.fail);

  selector.write('1 2 ');
  selector.write('3');
  selector.write(' 4');
  selector.write(' 5 ');
  selector.write('6 7 8 ');
  selector.write('9 10 11 12 13 14 15 16');
  selector.end(null, function () {
    t.equal(writable.getContentsAsString(), '1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16', 'gets full string at the end');
    t.end();
  });

  function selectStream (chunk, encoding) {
    t.pass('selectStream was called');
    var passThrough = new PassThrough();

    t.ok(chunk.byteLength >= 10, 'receives enough data in the selector');
    return passThrough;
  }
});
