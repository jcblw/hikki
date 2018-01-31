"use strict";

/*
  Hikki
  ======
  Hikki is a documentation generator. It uses comments to generate awesome documentation. The main goal is to make an easy to use tool that makes Github readable documentation from comments.

  If you know some markdown you can write docs!

  ```javascript
  /*
    Foo Bar
    ========

    My cool foo bar plugin
  *\/

  function FooBar () { ... }
  ```
*/

var fs = require("fs"),
  outputFile = require("output-file"),
  isWritable = require("isstream").isWritable,
  path = require("path"),
  extend = require("extend");

module.exports = Hikki;

/*
  Hikki Constructor
  -----------------
  This is just the base contructor sets up some basic data structures to store state into, also kicks off read files task.

  - `@param` options {Object} - This is the main options object that is stored at this.options. It is required and so is an array of file names to read and parse comments from
    - options.files {Array} - This is an array of file names that are to be parsed. eg.
  ```javascript
  [
    'src/index.js',
    'src/parser.js'
  ]
  ```
  - `@param` callback {Function} - optional. This function gets called when the task is done.
  - `@returns` {Object} - The Hikki instance
*/

function Hikki(options, callback) {
  if (!(this instanceof Hikki)) {
    return new Hikki(options, callback);
  }

  options = options || {};
  if (!Array.isArray(options.files)) {
    if (callback) {
      callback(
        new Error('Need the option "files" to be able to create documentation.')
      );
    }
    return this;
  }

  var _this = this,
    readFile;

  this.options = options;
  this.callback = callback || function noop() {};
  this.markdownFiles = [];
  this.current = 0;
  this.files = options.files.filter(Hikki.excludeFiles(options.exclude));
  this.transforms = [require("./lib/hikki-js")]; // loads in default transform

  if (options.logger) {
    if (isWritable(options.logger)) {
      this.logger = options.logger;
    }
  }

  if (options.output) {
    if (isWritable(options.output)) {
      this.output = options.output;
    } else {
      this.options.path = options.output;
    }
  }

  readFile = this.readFile.bind(
    this,
    this.files[this.current],
    this.next.bind(this)
  );

  if (options.transform) {
    return this.loadTransform(options.transform, function(err, transform) {
      if (err) {
        return callback(err);
      }
      _this.transforms.push(transform);
      readFile();
    });
  }

  readFile();
}

/*
  Hikki::parseFile
  -----------------
  This is the function that parses the file using esprima, this is hopefully going to be abstracted a bit more to allow differnt parsers

  - `@param` content {Object} - required. A __utf8__ encoded string that javascript (currently)
  - `@param` callback {Function} - required. This function gets called when the task is done.
*/

Hikki.prototype.parseFile = function parseFile(file, callback) {
  if (this.transforms.length) {
    // go through transform rather then normal parse
    for (var i = 0; i < this.transforms.length; i += 1) {
      var transform = this.transforms[i];
      if (file.name.match(transform.pattern)) {
        return transform.onFile(file, callback);
      }
    }
    callback();
  }
};

/*
  Hikki::loadTransform
  -----------------
  Loads a transform from the process.cwd() node_module an adds it to and array of
  transforms.

  - `@param` transformName {String} - The name of the module to be loaded for the transform
  - `@param` callback {Function} - A function that will be called with a error or the transform module
*/

Hikki.prototype.loadTransform = function loadTransform(
  transformName,
  callback
) {
  var dir = process.cwd(),
    local = path.resolve(dir, "node_modules", transformName);

  fs.stat(local, function(err, stat) {
    if (err) {
      return callback(err);
    }
    var transform = require(local);

    if (!Hikki.isTransform(transform)) {
      return callback(new Error(transformName + " is not a valid transform"));
    }

    callback(null, transform);
  });
};

/*
  Hikki::next
  -----------------
  This is the function that with push the result markdown path into a list of markdown files and will recursivly jump through the `this.files` list of files, and also writes file.

  - `@param` err {Error} - An Error, _not string_, if one happended
  - `@param` filePath {String} - filePath to generatate documentation
*/

Hikki.prototype.next = function next(err, filePath) {
  if (err) {
    throw err;
  }
  this.current += 1;
  if (filePath) {
    this.markdownFiles.push(filePath);
  }
  if (this.current === this.files.length) {
    var links = this.markdownFiles.map(Hikki.wrapLink);

    if (!this.output) {
      // output table of contents
      outputFile(
        this.options.path + "/README.md",
        links.join("\n"),
        this.callback
      );
    }
    return;
  }

  this.readFile(this.files[this.current], this.next.bind(this));
};

/*
  Hikki::readFile
  -----------------
  This is the function that will take a fileName, read its contents, run it through parseFile as well as some other various parsing fixes.

  - `@param` fileName {String} - Required. The location of a file that has not been converted yet
  - `@param` next {Function} - Required. A function that will be called once the task is done, passed back error and filePath to the converted file

  TODO: Look into refactoring this method
*/

Hikki.prototype.readFile = function readFile(fileName, next) {
  var _this = this,
    options = this.options;

  function handler(_payload, err, content) {
    // err is already handled

    _this.parseFile(
      {
        name: fileName,
        content: content,
      },
      function(err, comments) {
        if (err) {
          return next(err);
        }

        if (!comments) {
          return next();
        }

        var blocks,
          filePath = fileName.split("."),
          _path = _this.options.path,
          markdownFileName;

        // adding md on end of file
        filePath.pop();
        filePath.push("md");
        filePath = filePath.join(".");

        if (filePath && _this.options.base) {
          filePath = filePath.split(new RegExp(_this.options.base)).join("");
        }

        markdownFileName = _path
          ? path.resolve(_path + "/" + filePath)
          : filePath;
        if (!comments.length) {
          return next();
        }

        blocks = comments
          .filter(Hikki.validComment(options.prefix))
          .map(Hikki.stripLeadingSpace(_this.options))
          .map(Hikki.appendLineNumber)
          .map(Hikki.getKey("value"))
          .map(Hikki.replace(options.prefix, ""))
          .join("")
          .trim();

        if (!blocks.length) {
          return next();
        }

        if (_this.logger) {
          _this.logger.write("\n\rWriting file:" + markdownFileName);
        }

        if (_this.output) {
          extend(_payload, {
            fileName: markdownFileName,
            content: blocks,
            encoding: "utf8",
          });
          _this.output.write(JSON.stringify(_payload) + "\n");
          return next();
        }

        outputFile(markdownFileName, blocks, function(err) {
          next(err, filePath);
        });
      }
    );
  }

  fs.stat(fileName, function(err, stat) {
    if (err) {
      return next(err);
    }
    if (stat.isDirectory()) {
      return next();
    }
    stat.originalFileName = fileName;
    fs.readFile(fileName, "utf8", handler.bind(null, stat));
  });
};

/*
  Hikki.getKey
  -----------------
  is meant to be ran as a map iterator. Also is a `thunk`. Get a key from a collection of objects.

  - `@param` key {String} - The key you would like to grab from each item in a collection.
  - `@returns` iterator {Function} - The iterator to loop over an array of objects.
*/

Hikki.getKey = function getKey(key) {
  return function(obj) {
    if (typeof obj !== "object") {
      return;
    }
    return obj[key];
  };
};

/*
  Hikki.replace
  -----------------
  is meant to be ran as a map iterator. Also is a `thunk`. Just like string replace.

  - `@param` pattern {RegExp|String} - pattern to match against string
  - `@param` replacement {String} - the string to replace pattern match with
  - `@returns` iterator {Function} - The iterator to loop over an array of strings.
*/

Hikki.replace = function replace(pattern, replacement) {
  return function(str) {
    return (str || "").replace(pattern, replacement);
  };
};

/*
  Hikki.appendLineNumber
  -----------------
  is meant to be ran as a map iterator. appends line numbers to end of value.
  > not currenly being used

  - `@param` obj {Object} - object that is an ast from esprima
  - `@returns` obj {Object} - the same object passed in just mutated
*/

Hikki.appendLineNumber = function appendLineNumber(obj) {
  var start;

  if (obj.loc && obj.loc.start) {
    start = obj.loc.start;
    obj.value = obj.value
      .split("${L}")
      .join(start.line)
      .split("${C}")
      .join(start.column);
  }

  return obj;
};

/*
  Hikki.isTransform
  -----------------
  A simple utility to test if passed in object is a proper transform.
  - `@param` {Object} - A transform object
  - `@returns` {Boolean} - true or false based of if it is a proper transform
*/

Hikki.isTransform = function isTransform(obj) {
  if (
    obj &&
    typeof obj === "object" &&
    typeof obj.onFile === "function" &&
    obj.pattern
  ) {
    return true;
  }
  return false;
};

/*
  Hikki.stripLeadingSpace
  ------------------------
  A `thunk` that will return an iterator. The iterator will then based of comment location will strip whitespace from in front of coment

  - `@param` options {Object} - an object with options on current code configuration ~ not currently being used
  - `@returns` stripLeadingSpaceIterator {Function} - iterator to be called
    - `@param` obj {Object} - Ast of comments
*/

Hikki.stripLeadingSpace = function stripLeadingSpace(options) {
  // pull out config about tabbing here currently only support 2 space tabbing
  return function stripLeadingSpaceIterator(obj) {
    var pattern = [];
    if (obj.loc && obj.loc.start) {
      for (var i = 0; i < obj.loc.start.column + 2; i += 1) {
        pattern.push(" ");
      }

      obj.value = obj.value
        .split("\n")
        .map(Hikki.replace(new RegExp("^" + pattern.join("")), ""))
        .join("\n");
    }
    return obj;
  };
};

/*
  Hikki.wrapLink
  -----------------
  wraps a filepath in a markdown link. used for TOC

  - `@param` link {String} - a file path
  - `@returns` string {String} - a link to the passed in file path
*/

Hikki.wrapLink = function wrapLink(link) {
  return "- [" + link + "](" + link + ")";
};

/*
  Hikki.excludeFiles
  -----------------
  excludes files via a filter method

  - `@param` exclude {String} - string pattern to test against file names
  - `@returns` excludeFilesIterator {Function} - iterator to be called by filter method
*/

Hikki.excludeFiles = function stripLeadingSpace(exclude) {
  var pattern = exclude ? new RegExp(exclude) : null;
  return function excludeFilesIterator(fileName) {
    return exclude ? !fileName.match(pattern) : true;
  };
};

/*
  Hikki.validComment
  -----------------
  this is a filter that looks to see if a comment starts with a prefix.

  - `@param` prefix {String} - string pattern to test against file names
  - `@returns` excludeFilesIterator {Function} - iterator to be called by filter method
*/

Hikki.validComment = function stripLeadingSpace(prefix) {
  var pattern = prefix ? new RegExp("^" + prefix) : null;
  return function excludeFilesIterator(obj) {
    return prefix ? obj.value.match(pattern) : true;
  };
};
