# Hikki

[![Build Status](https://travis-ci.org/jcblw/hikki.svg?branch=master)](https://travis-ci.org/jcblw/hikki)

This node module with take comments from your code and outputs them as markdown files in a different directory.

## Why?

Generating documentation from code is great, you do not have to context switch between writing docs and writing code, it all lives in the same place. There are a bunch of tools that already do this, like docco and dox. Hikki takes a differnt approach to this in the fact that it want to output markdown files and put them in you repo or another directory that you specify. The reason for this is that sites like Github, Butbucket and Gitlabs are already in our workflow, so we leverage their capabilities and allow those sites to display our docs for us. This then removes the dependecy of running a server to display these docs.

# Install


```
npm i hikki --save
```

That will symlink the bin to you npm install and you will have the `hikki` command globally. Also you can add it to you package.json and then point towards this repo using this [method](http://stackoverflow.com/questions/22988876/install-npm-module-from-gitlab-private-repository).

# Usage

```
hikki src/js/**/*.js
```

That is all that is required. You need to point it towards the files you want to create docs from ( it has glob support :) ). By default this will output `Line Delimited Objects` but if you specify an output using.

```
hikki src/js/*.js -o docs
```

It will then output [Markdown](http://daringfireball.net/projects/markdown/syntax) files into that directory.

# Other options

| flags        | description                                                  |
| ------------ | ------------------------------------------------------------ |
| -o --output  | directory relative to CWD to output markdown files           |
| -e --exclude | patterns to exclude from processing eg. `vendor`             |
| -v --verbose | will output to console when a markdown file is written       |
| -b --base    | base of source, to exclude path when creating markdown files |
| -f --files   | a string or array of files to pull data from, glob support   |
| -p --prefix  | a string to prefix comment blocks to indicate its for docs   |

> when using globs your terminal will do this automatically and sometime the results are not expected eg. `**/*.js` will not get root level javascript files if you have this issue just add to a string eg. `"**/*.js"` and our glob library will catch the root level files.

# JS api

Right now the is a JS api but it is not super intuitive. Eg.

```javascript
var hikki = require("hikki"),
  Writable = require("stream").Writable,
  ws = Writable();

ws.on("data", function(data) {
  console.log(data); // String '{"filename": "...", "content": "..."}'
});

hikki({
  files: "src/js/**/*.js",
  output: ws,
});
```

A better API should be made for advanced usage.
