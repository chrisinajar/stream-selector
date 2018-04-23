var stream = require('stream');
var inherits = require('inherits');

module.exports = StreamSelector;

inherits(StreamSelector, stream.Transform);

function StreamSelector (options) {
  if (!(this instanceof StreamSelector)) {
    return new StreamSelector(options);
  }
  stream.Transform.call(this);

  this.curBuffer = null;
  this.destinationStream = null;
  this.isDeciding = false;
  options = options || {};
  if (typeof options === 'function') {
    options = {
      selector: options
    };
  }
  this.options = options;
}

StreamSelector.prototype.assignStream = function (destinationStream, encoding, done) {
  if (this.destinationStream === destinationStream) {
    return;
  }
  this.destinationStream = destinationStream;
  var self = this;
  this.destinationStream.pipe(new stream.Writable({
    write (chunk, encoding, done) {
      self.push(chunk);
      done();
    }
  }));
  if (this.curBuffer) {
    this.destinationStream.write(this.curBuffer, encoding, done);
    this.curBuffer = null;
  }
};

StreamSelector.prototype._transform = function (chunk, encoding, done) {
  if (this.destinationStream) {
    return this.destinationStream.write(chunk, encoding, done);
  }
  // haven't found a good destination stream yet, keep trying...
  // store data we're buffering so we can make sure to send it all when we find a stream
  // also, some streams might not be ready on the first packet, they might need 2 to classify
  if (!this.curBuffer) {
    this.curBuffer = chunk;
  } else {
    this.curBuffer = Buffer.concat([this.curBuffer, chunk]);
  }
  if (this.options.minBuffer && this.options.minBuffer > this.curBuffer.byteLength) {
    // wait for more data before deciding...
    return done();
  }
  if (this.isDeciding) {
    // keep buffering and waiting for the decision to come back.
    return done();
  }
  if (this.curBuffer.byteLength < 1) {
    // don't make them decide if we don't even have data yet...
    return done();
  }
  this.isDeciding = true;
  let destinationStream = this.options.selector(this.curBuffer, encoding, (err, destinationStream) => {
    if (err) {
      return this.emit('error', err);
    }
    if (this.destinationStream) {
      return this.emit('error', new Error('Cannot specific destination stream twice. You cannot use the callback and also return a value'));
    }
    if (!destinationStream) {
      return this.emit('error', new Error('Selector method did not return an error or a destination stream'));
    }
    this.assignStream(destinationStream, encoding, done);
  });

  if (destinationStream) {
    this.assignStream(destinationStream, encoding, done);
  }
};
