/*
  hikki-js
  ====================================================================
  A transfom for hikki to transform js content into an AST of comments to turn into markdown files

  - pattern is /\.js/
  - uses [esprima](http://esprima.org/)!
*/

var esprima = require("esprima");

/*
  blockOnly
  -----------------
  is meant to be ran as a filter iterator. Filters esprimas ast output to just include block comments.

  - `@param` comment {Object} - An object that has the key type on it.
*/
function blockOnly(comment) {
  if (typeof comment === "object" && comment.type === "Block") {
    return true;
  }
  return false;
}

module.exports = {
  pattern: /\.js/,
  onFile: function(file, callback) {
    var ast, comments, err;

    try {
      ast = esprima.tokenize(file.content, {
        comment: true,
        loc: true,
      });
    } catch (e) {
      return callback(
        new Error("Unable to parse " + file.name + " in js parser")
      );
    }
    comments = ast.comments ? ast.comments : [];
    comments = comments.filter(blockOnly);

    callback(null, comments);
  },
};

module.exports._blockOnly = blockOnly;
