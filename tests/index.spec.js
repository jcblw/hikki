var test = require("tap").test,
  Hikki = require(".."),
  fs = require("fs"),
  ws = fs.createWriteStream("./output.log"),
  WriteStream = require("./utils/writeableStream");

// start static methods

test("Hikki.getKey", function(t) {
  t.equal(
    typeof Hikki.getKey(),
    "function",
    "Hikki getKey will return a function (iterator) from the initial call"
  );
  t.equal(
    Hikki.getKey()(""),
    undefined,
    "getKey will return nothing when the iterator is called with anything other then a object"
  );
  t.equal(
    Hikki.getKey("foo")({ bar: "baz" }),
    undefined,
    "getKey will return undefined when the iterator is called if there is no keys with the value in the initial call"
  );
  t.equal(
    Hikki.getKey("foo")({ foo: "bar" }),
    "bar",
    "getKey will return the value of the key that was passed to the initial function from the object passed to the iterator"
  );
  t.end();
});

test("Hikki.replace", function(t) {
  t.equal(
    typeof Hikki.replace(),
    "function",
    "Hikki replace will return a function iterator when called"
  );
  t.equal(
    Hikki.replace(/foo/, "bar")(),
    "",
    "replace will return a blank string if nothing is passed to the iterator"
  );
  t.equal(
    Hikki.replace(/foo/, "bar")("foobaz"),
    "barbaz",
    "replace will replace the pattern from the first argument of the initial function with the string in the second argument of the initial function from the string passed to the iterator"
  );
  t.end();
});

test("Hikki.appendLineNumber", function(t) {
  t.equal(
    Hikki.appendLineNumber("foo"),
    "foo",
    "Hikki appendLineNumber will return whatever was passed to it if it is not an object with a loc object"
  );
  t.equal(
    Hikki.appendLineNumber({
      loc: { start: { line: "foo", column: "bar" } },
      value: "${L} ${C}",
    }).value,
    "foo bar",
    "appendLineNumber will replace the values of loc.start.line where ${L} is in a string as well as loc.start.column where ${C} is in the value"
  );
  t.end();
});

test("Hikki.isTransform", function(t) {
  t.equal(
    Hikki.isTransform(""),
    false,
    "Hikki.isTransform will return false when anything other then a transform is passed to it"
  );
  t.equal(
    Hikki.isTransform({ pattern: "foo", onFile: function() {} }),
    true,
    "isTransform will return true when a valid transform is passed to Hikki"
  );
  t.end();
});

test("Hikki.stripLeadingSpace", function(t) {
  t.equal(
    typeof Hikki.stripLeadingSpace(),
    "function",
    "Hikki stripLeadingSpace will return a function iterator from the initial function"
  );
  t.equal(
    Hikki.stripLeadingSpace()({
      value: "\n  foo\n  bar",
      loc: { start: { column: 0 } },
    }).value,
    "\nfoo\nbar",
    "Hikki stripLeadingSpace will remove any leading space in from of comments"
  );
  t.end();
});

test("Hikki.wrapLink", function(t) {
  t.equal(
    Hikki.wrapLink("foo"),
    "- [foo](foo)",
    "Hikki wrap link will wrap the content that is given in first argument and wrap it in a markdown link in a list"
  );
  t.end();
});

// start prototype methods

test("the hikki function", function(t) {
  var options = {
      foo: "bar",
      files: ["index.spec.js"],
      logger: ws,
      output: ws,
    },
    callback = function foo() {};
  t.equal(
    new Hikki() instanceof Hikki,
    true,
    "Hikki will return a new instance of Hikki when using the new keyword"
  );
  t.equal(
    Hikki() instanceof Hikki,
    true,
    "Hikki will return an instance of Hikki when not using the new operator"
  );
  t.deepEqual(
    new Hikki(options).options,
    options,
    "Hikki when passed an options object it will set that options object to this.options"
  );
  t.equal(
    new Hikki(options, callback).callback,
    callback,
    "Hikki when passed a second argument of a function it will set that function to the property of this.callback"
  );
  t.deepEqual(
    new Hikki(options, callback).files,
    options.files,
    "Hikki when pass an options object with the key of file that has an array that array will be set to the property of this.files"
  );
  t.equal(
    new Hikki(options).transforms.length,
    1,
    "Hikki will load in one transform into its list of transforms in the property this.transforms"
  );
  // this needs to be more thurough to check if it is a stream and correct type of stream
  t.equal(
    !!new Hikki(options).logger,
    true,
    "Hikki when passed a logger key will set that logger to the property this.logger"
  );
  t.equal(
    !!new Hikki(options).output,
    true,
    "Hikki when passed a writable stream to the ouput key it will set that stream to this.output"
  );
  // this should be sync
  new Hikki({}, function(err) {
    // should test message
    t.equals(
      err instanceof Error,
      true,
      "If hikki is not given an array of files it will pass an error to the callback"
    );
  });

  options.output = "node_modules"; // this gets removed after testing
  t.equals(
    new Hikki(options).options.path,
    "node_modules",
    "If a string is set to the output the options.path will be set to that output"
  );

  options.transform = "bad-transform";
  new Hikki(options, done);
  options.transform = "good-transform";
  var hikkiTransformPushTest = new Hikki(options),
    count = 0;

  hikkiTransformPushTest.transforms.push = done;
  function done(resp) {
    count++;
    if (count === 1) {
      t.equals(
        resp instanceof Error,
        true,
        "The callback will be called with an error if a bad transform is given"
      );
    }

    if (count === 2) {
      t.equals(
        typeof resp,
        "object",
        "The transform if loaded is pushed into the array"
      );
      t.end();
    }
  }
});

test("Hikki::parseFile", function(t) {
  /* simple structure setup */
  var context = {
      transforms: [
        {
          pattern: /test/,
          onFile: function(_file, callback) {
            t.equal(
              _file.foo,
              "bar",
              "The data passed to transform.onFile is correct"
            );
            t.equal(
              _file.name,
              "/tests/foo.js",
              "The data passed to transform.onFile is correct"
            );
            callback({ bar: "baz" });
          },
        },
      ],
    },
    file = {
      name: "/tests/foo.js",
      foo: "bar",
    };

  Hikki.prototype.parseFile.call(context, file, function(data) {
    t.equal(
      data.bar,
      "baz",
      "The file that was passed to parse file went through the correct transform"
    );
  });

  Hikki.prototype.parseFile.call(context, { name: "foo" }, function(data) {
    t.equal(
      typeof data,
      "undefined",
      "When the file does not match the pattern of the given transform it does not run through the parser and nothing is passed to the callback"
    );
    t.end();
  });
});

test("Hikki::loadTransform", function(t) {
  Hikki.prototype.loadTransform("foo", function(err) {
    t.equal(
      err instanceof Error,
      true,
      "If an non exsistent transform is passed an error is passed back to the callback"
    );
  });
  Hikki.prototype.loadTransform("bad-transform", function(err) {
    t.equal(
      err instanceof Error,
      true,
      "If an invalid transform is passed an error is passed back to the callback"
    );
    t.equal(
      err.message,
      "bad-transform is not a valid transform",
      'If an invalid transform is passed an error is passed back to the callback that has "is not a valid transform" in the error message'
    );
  });
  Hikki.prototype.loadTransform("good-transform", function(err, transform) {
    t.equal(
      err,
      null,
      "If an valid transform is passed null is passed back to the callback as the first argument"
    );
    // check tests/node_modules/good-transform/index.js
    t.equal(
      transform.pattern.test("foo"),
      true,
      "The correct transform is pass back to the callback"
    );
    t.end();
  });
});

test("Hikki::next", function(t) {
  t.throws(
    Hikki.prototype.next.bind(null, new Error("foo")),
    "next should throw when passed an error"
  );
  Hikki.prototype.next.call({
    current: 0,
    files: [null, "foo"],
    readFile: function(file, next) {
      t.equal(
        file,
        "foo",
        "When running next the correct file is passed to the readFile function"
      );
      t.equal(
        typeof next,
        "function",
        "The second argument passed to next is a function"
      );
      next();
    },
    next: function() {
      t.equal(
        this.current,
        1,
        "The next method is bound correctly to the correct context."
      );
      t.end();
    },
  });
  var context = {
    current: 0,
    files: [null],
    markdownFiles: [],
    options: { path: "./node_modules" },
    callback: function() {
      t.equal(
        context.markdownFiles.length,
        1,
        "The file path was pushed into the markdownFiles array"
      );
      t.equal(
        context.markdownFiles[0],
        "bar",
        "The correct value is stored in the markdownFiles"
      );
      t.end();
    },
  };
  Hikki.prototype.next.call(context, null, "bar"); // need to test output stream version of this
});

test("Hikki::readFile", function(t) {
  Hikki.prototype.readFile.call(
    {
      options: {},
    },
    "foo",
    function(err) {
      t.equal(
        err instanceof Error,
        true,
        "readFile will call the callback with an error if the file is not present"
      );
    }
  );

  Hikki.prototype.readFile.call(
    {
      options: {},
    },
    "test_modules",
    function(err) {
      t.equal(
        typeof err,
        "undefined",
        "readFile will call the callback with nothing if the file given is a directory"
      );
    }
  );

  Hikki.prototype.readFile.call(
    {
      options: {},
      parseFile: function(file, callback) {
        t.equal(
          file.name,
          "node_modules/good-transform/index.js",
          "readFile passes the correct file name to the parseFile method"
        );
        t.equal(
          typeof file.content,
          "string",
          "The content is also passed as a utf8 string"
        );
        t.equal(
          typeof callback,
          "function",
          "The parseFile function is passed a callback method from readFile"
        );
        callback(new Error("bar"));
      },
    },
    "node_modules/good-transform/index.js",
    function(err) {
      t.equal(
        err instanceof Error,
        true,
        "readFile will call the callback with an error if an error is passed from the parser"
      );
      t.equal(
        err.message,
        "bar",
        "The correct error is passed to the callback"
      );
    }
  );

  Hikki.prototype.readFile.call(
    {
      options: {},
      parseFile: function(file, callback) {
        callback();
      },
    },
    "node_modules/good-transform/index.js",
    function(err) {
      t.equal(
        err,
        undefined,
        "readFile will call the callback with no data if no data is passed into the parseFile callback"
      );
    }
  );

  Hikki.prototype.readFile.call(
    {
      options: {},
      parseFile: function(file, callback) {
        callback(null, {
          loc: {},
          value: " ",
        });
      },
    },
    "node_modules/good-transform/index.js",
    function(err, data) {
      t.equal(
        err,
        undefined,
        "readFile will call the callback with no data if a empty comment is passed into the parseFile callback"
      );
      t.equal(
        data,
        undefined,
        "readFile will call the callback with no data if a empty comment is passed into the parseFile callback"
      );
    }
  );

  // testing streaming
  // see WriteStream = require('./utils/writeableStream'); for more info

  var output = new WriteStream(),
    logger = new WriteStream();
  output.on("test:chunk", onTestOutputChunk);
  logger.on("test:chunk", onLoggerOutputChunk);

  function onTestOutputChunk(data) {
    var _data = JSON.parse(data);
    t.equal(
      typeof _data,
      "object",
      "The data outputed to the output stream will be an stringified JSON object"
    );
    t.equal(
      /Foo Bar\n-----------/.test(_data.content),
      true,
      "The outputs key of content will contain the content passed as the parseFile"
    );
    t.equal(
      /node_modules\/good\-transform\/index/.test(_data.fileName),
      true,
      "The outputs key of filename will be a slightly differnt version of the file name pass into the readFile function"
    );
  }

  function onLoggerOutputChunk(data) {
    t.equal(
      /Writing file:/.test(data.toString()),
      true,
      "The logger will output information about the file comming in if file has comments"
    );
  }

  Hikki.prototype.readFile.call(
    {
      options: {},
      logger: logger,
      output: output,
      parseFile: function(file, callback) {
        callback(null, [
          {
            loc: {},
            value: "Foo Bar\n-----------",
          },
        ]);
      },
    },
    "node_modules/good-transform/index.js",
    function() {}
  );

  Hikki.prototype.readFile.call(
    {
      options: {},
      path: "node_modules/",
      base: "node_modules/good-transform",
      parseFile: function(file, callback) {
        callback(null, [
          {
            loc: {},
            value: "Foo Bar\n-----------",
          },
        ]);
      },
    },
    "node_modules/good-transform/index.js",
    function(err, filePath) {
      t.equal(
        err,
        null,
        "readFile will call the callback with no err if a comment is passed into the parseFile callback"
      );
      t.equal(
        typeof filePath,
        "string",
        "The file path outputed will be a string"
      );
      t.equal(
        filePath,
        "node_modules/good-transform/index.md",
        "The file path outputed will be a version of the path given with the this.base value removed from the url and the this.path value appended to the url"
      );
      t.end();
    }
  );
});
