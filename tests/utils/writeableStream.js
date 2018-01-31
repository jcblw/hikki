var stream = require("stream"),
  util = require("util");

module.exports = Writable;

function Writable() {
  stream.Writable.call(this);
}

util.inherits(Writable, stream.Writable);

Writable.prototype._write = function(chunk, enc, cb) {
  this.emit("test:chunk", chunk);
  cb();
};
