# Hikki

Hikki is a documentation generator. It uses comments to generate awesome documentation. The main goal is to make an easy to use tool that makes Github readable documentation from comments.

If you know some markdown you can write docs!

```javascript
/*
  Foo Bar
  ========

  My cool foo bar plugin
*/

function FooBar () { ... }
```

## Hikki Constructor

This is just the base contructor sets up some basic data structures to store state into, also kicks off read files task.

* `@param` options {Object} - This is the main options object that is stored at this.options. It is required and so is an array of file names to read and parse comments from
  * options.files {Array} - This is an array of file names that are to be parsed. eg.

```javascript
["src/index.js", "src/parser.js"];
```

* `@param` callback {Function} - optional. This function gets called when the task is done.
* `@returns` {Object} - The Hikki instance

## Hikki::parseFile

This is the function that parses the file using esprima, this is hopefully going to be abstracted a bit more to allow differnt parsers

* `@param` content {Object} - required. A **utf8** encoded string that javascript (currently)
* `@param` callback {Function} - required. This function gets called when the task is done.

## Hikki::loadTransform

Loads a transform from the process.cwd() node_module an adds it to and array of
transforms.

* `@param` transformName {String} - The name of the module to be loaded for the transform
* `@param` callback {Function} - A function that will be called with a error or the transform module

## Hikki::next

This is the function that with push the result markdown path into a list of markdown files and will recursivly jump through the `this.files` list of files, and also writes file.

* `@param` err {Error} - An Error, _not string_, if one happended
* `@param` filePath {String} - filePath to generatate documentation

## Hikki::readFile

This is the function that will take a fileName, read its contents, run it through parseFile as well as some other various parsing fixes.

* `@param` fileName {String} - Required. The location of a file that has not been converted yet
* `@param` next {Function} - Required. A function that will be called once the task is done, passed back error and filePath to the converted file

TODO: Look into refactoring this method

## Hikki.getKey

is meant to be ran as a map iterator. Also is a `thunk`. Get a key from a collection of objects.

* `@param` key {String} - The key you would like to grab from each item in a collection.
* `@returns` iterator {Function} - The iterator to loop over an array of objects.

## Hikki.replace

is meant to be ran as a map iterator. Also is a `thunk`. Just like string replace.

* `@param` pattern {RegExp|String} - pattern to match against string
* `@param` replacement {String} - the string to replace pattern match with
* `@returns` iterator {Function} - The iterator to loop over an array of strings.

## Hikki.appendLineNumber

is meant to be ran as a map iterator. appends line numbers to end of value.

> not currenly being used

* `@param` obj {Object} - object that is an ast from esprima
* `@returns` obj {Object} - the same object passed in just mutated

## Hikki.isTransform

A simple utility to test if passed in object is a proper transform.

* `@param` {Object} - A transform object
* `@returns` {Boolean} - true or false based of if it is a proper transform

## Hikki.stripLeadingSpace

A `thunk` that will return an iterator. The iterator will then based of comment location will strip whitespace from in front of coment

* `@param` options {Object} - an object with options on current code configuration ~ not currently being used
* `@returns` stripLeadingSpaceIterator {Function} - iterator to be called
  * `@param` obj {Object} - Ast of comments

## Hikki.wrapLink

wraps a filepath in a markdown link. used for TOC

* `@param` link {String} - a file path
* `@returns` string {String} - a link to the passed in file path

## Hikki.excludeFiles

excludes files via a filter method

* `@param` exclude {String} - string pattern to test against file names
* `@returns` excludeFilesIterator {Function} - iterator to be called by filter method

## Hikki.validComment

this is a filter that looks to see if a comment starts with a prefix.

* `@param` prefix {String} - string pattern to test against file names
* `@returns` excludeFilesIterator {Function} - iterator to be called by filter method
