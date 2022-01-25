# spicy-sections

**Spicy Sections** is an experiment in which "_good ol’ well supported HTML_" is conditionally presented with [different affordances](https://bkardell.com/blog/DesignAffordanceControls.html);
either as a tab set, or with independent collapses ("_disclosure widgets_") or exclusive collapses ("_accordions_").

Developed as part of explorations in Open UI, following some [extensive research toward potentially standardizing "tabs"](https://open-ui.org/components/tabs.research.parts), **Spicy Sections** uses a custom element wrapper (`<spicy-sections>`) to wrap and progressively enhance heading and content pairs so that they can be presented with any of these affordances.

If you want to see something working, [check out this demonstration](https://codepen.io/bkardell/pen/VwpJGGL?editors=1100) and resize your browser window to see how the afforances change.

## Usage

Import the custom element.

```html
<script type="module" src="/SpicySections.js"></script>
```

Markup sections by wrapping _good ol’ HTML_ with the `<spicy-sections>` element.

```html
<spicy-sections>
  <!-- any heading here, followed by an element containing content -->
  <h2>Ingredients</h2>
  <div>A list of ingredients</div>

  <!-- repeat the pattern... -->
  <h2>Instructions</h2>
  <div>A list of instructions</div>
</spicy-sections>
```

## Designing with Affordances

**Spicy Sections** lets authors express when affordances should be presented;
using either an attribute or a CSS Custom Property.
The available affordancs are `collapse` (_summary/details like_), `tab-bar` (_tabs like_) and `exclusive-collapse` (_single select accordion like_).

To present an afforance of `collapse` on a smaller screen, you might use `[screen and (max-width: 800px)] collapse`.

```pcss
spicy-sections {
  --const-mq-affordances:
    [screen and (max-width: 40em) ] collapse |
    [screen and (min-width: 60em) ] tab-bar
  ;
  display: block;
  border: thick var(--demo-border, solid black);
  border-width: thick 0;
  padding: 1em;
}
```

_Note: The CSS Custom Property is only read only._

### Hash references
In normal content, markup can contain `id` attributes which will be scrolled to and focus-navigation set to the first matching element when the URL contains a matching `#` (hash).  This element carries this idea forward and will activate tabs accordingly, whether that hash matches the heading, or content within it.


### Programatically setting the active affordance
The `<spicy-sections>` element exposes a `setActiveAffordance` method which can be called with any valid affordance name:

```javascript
element.setActiveAffordance('collapse') /* or tab-bar or exclusive-collapse */
```

---

## Standards Path?
This work is developed as part of explorations in Open UI, following some [extensive research toward potentially standardizing "tabs"](https://open-ui.org/components/tabs.research.parts). We believe that the concept of an element which could conditionally present different interaction affordances, in much the same way that scroll panes do in the web platform today could be an important new concept allowing us to bring not just tabs, but several UI concepts to the platform.

However, there is a lot to think about - not the least of which is whether developers will adopt something like this.  This custom element provides a way for us to roughly evaluate the concepts, learn more about the problem and see.

Please check it out: Play with it. Build something useful. Ask questions, show us your uses, [give us feedback](https://github.com/tabvengers/spicy-sections/issues) about what you like or don't.  We'll also be watching the HTTP Archive data for adoption, and adoption is a good signal we've got something right and will help drive furtherance and priority of standards work.

There is also a post where you can [read more on the concept](https://bkardell.com/blog/SpicySections)

## Note

This element builds on progressive enhancement.
The resolution of module scripts is non-blocking and the display of different affordances can be quite different.
It is appealing then to minimize FOUC, and the one instrument that custom elements and CSS currently provide is `:not(:defined)`.

Unfortunately, using `:not(:defined)` to hide content fails to progressively enhance if the script fails to either load or execute;
this is an [known issue](see https://github.com/whatwg/html/issues/6231).
For now, you can improve the experience by hiding the content when the script is enabled, and then _race_ the definition.

```js
// dynamically inject styles to hide the content
let style = document.head.appendChild(
  Object.assign(document.createElement('style'), {
    textContent: 'spicy-sections:not(:defined) { visibility: hidden; }'
  })
);

setTimeout(() => style.remove(), 1000);
```
