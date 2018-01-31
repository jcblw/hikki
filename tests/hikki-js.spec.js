var test = require("tap").test,
  hikkiJS = require("../lib/hikki-js"),
  fs = require("fs");

test("the exports from hikki-js", function(t) {
  t.equal(
    hikkiJS.pattern instanceof RegExp,
    true,
    "hikki-js exports out a pattern that is a instanceof RegExp"
  );
  t.equal(
    typeof hikkiJS.onFile,
    "function",
    "hikki-js will export out a method called onFile and it will be a function"
  );
  t.end();
});

test("the onFile method", function(t) {
  hikkiJS.onFile({ content: "#!foo" }, function(err) {
    t.equal(
      err instanceof Error,
      true,
      "onFile will pass an error to the callback if the file content passed to it is not valid javascript"
    );
    t.equal(
      /Unable to parse/.test(err.message),
      true,
      "the error passed will have the message unable to parse"
    );
  });
  var file = fs.readFileSync(
    __dirname + "/node_modules/good-transform/index.js"
  );
  hikkiJS.onFile({ content: file }, function(err, comments) {
    t.equal(
      !!err,
      false,
      "When proper javascript is passed to onFile no error is passed back"
    );
    t.equal(
      Array.isArray(comments),
      true,
      "When proper javascript is passed to onFile the second argument passed to the callback is an Array"
    );
    t.equal(
      comments.length,
      1,
      "The correct amount of comments are in the returned array"
    );

    var comment = comments[0];

    t.equal(
      typeof comment.loc,
      "object",
      "A comment returned will have a loc object in it."
    );
    t.equal(
      typeof comment.value,
      "string",
      "The comment returned will have a value"
    );
    t.end();
  });
});

test("the blockOnly method", function(t) {
  var blockOnly = hikkiJS._blockOnly;
  t.equal(
    typeof blockOnly,
    "function",
    "There is a blockOnly method exported for testing"
  );
  t.equal(
    blockOnly(),
    false,
    "The block only method will return false when an object that does not have the correct structure is passed to it"
  );
  t.equal(
    blockOnly({ type: "Block" }),
    true,
    "The block only method will return true when the correct structure is given to the method."
  );
  t.end();
});
