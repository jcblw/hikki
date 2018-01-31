# hikki-js

A transfom for hikki to transform js content into an AST of comments to turn into markdown files

* pattern is /\.js/
* uses [esprima](http://esprima.org/)!

## blockOnly

is meant to be ran as a filter iterator. Filters esprimas ast output to just include block comments.

* `@param` comment {Object} - An object that has the key type on it.
