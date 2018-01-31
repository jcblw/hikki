# Inline Documentation

We write our docs inline with our code. This works currently with javascript and SASS.

## How to write docs

To write docs simply add a block comments into your code. The block should be tabbed over and contain markdown.

#### Javascript

```javascript
/*docs
  Foo Bar
  ========================
  a description of foo bar

 - @param paramName {ParamType} - description of param.
*/

function FooBar() { ... }
```

If it is the first header in a file then it will link to the original file. This works on Gitlab and Github. In our framework the docs will be outputted to the `docs` directory and will be organized into what kinda of file there is in the MVC framework.

```text
docs
├── libs.md
├── models.md
├── routers.md
├── stylesheets.md
├── views.md
└── widgets.md
```

### Adding changing organization of docs

This is done in the hikki-organize.json file.

## How to generate docs

Makes sure your dependencies are up to date (`npm install`). Then run

```shell
npm run docs
```

This generates docs for javascript and SASS.

## When should I generate docs?

Don't generate docks for each pr the docs should be generated and pushed right away to avoid and merge conflicts. It's best to write docs then let them be generated after you have merge back into develop.
