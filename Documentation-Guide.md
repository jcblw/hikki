# Inline Documentation

We write our docs inline with our code. This works currently with javascript and SASS. 

## How to write docs

To write docs simply add a block comments into your code. The block should be tabbed over and contain markdown.

#### Javascript

\`\`\`javascript
/\*docs
  Foo Bar
  ========================
  a description of foo bar

 - @param paramName {ParamType} - description of param.
\*/

function FooBar() { ... }
\`\`\`

#### SCSS
\`\`\`scss
/\*docs
  .classTitle
  ==================
  A description of .classtitle

  `.class-name`        - a class description.

  @alias `.className` (optional) - whether the documented item is an alias of another item
  @group buttons (optional) - group the documented item belongs to
  @link http://getbootstrap.com/components/#btn-groups (optional) - link related to the documented item
  @require `.btn .btn-[xs|sm|md|lg]` (optional)- requirements from the documented item
  @see `stylesheets/components/buttons`(optional) - resource related to the documented item
  @todo make this button style do... (optional) - things to do related to the documented item
\*/

.classTitle {...}
\`\`\`

If it is the first header in a file then it will link to the original file. This works on Gitlab and Github. In our framework the docs will be outputted to the `docs` directory and will be organized into what kinda of file there is in the MVC framework.

\`\`\`text
docs
├── libs.md
├── models.md
├── routers.md
├── stylesheets.md
├── views.md
└── widgets.md
\`\`\`

### Adding changing organization of docs

This is done in the [hikki-organize.json file][1]. You can see how this works [here][2].

## How to generate docs

Makes sure your dependencies are up to date (`npm install`). Then run

\`\`\`shell
npm run docs
\`\`\`

This generates docs for javascript and SASS.

## When should I generate docs?

Don't generate docks for each pr the docs should be generated and pushed right away to avoid and merge conflicts. It's best to write docs then let them be generated after you have merge back into develop. 

[1]:	https://github.com/Agent-Ace/aa_philosophie/blob/develop/scripts/hikki-organize.json
[2]:	https://o1prod/jcblw/hikki-organize/blob/master/README.md