# spicy-sections

**Spicy Sections** is an experiment in which "_good ol’ well supported HTML_" is conditionally presented with [different affordances](https://bkardell.com/blog/DesignAffordanceControls.html); either as a tab set, or with independent collapses ("_disclosure widgets_") or exclusive collapses ("_accordions_").

<img src="/demo/screenshot-tabset.webp" alt="sections of content presented as a set of tabs" width="50%" /><img src="/demo/screenshot-accordion.webp" alt="sections of content presented as independent collapses" width="50%" />

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
  <!-- any heading here, or `<spicy-h>` followed by an element containing content -->
  <h2>Ingredients</h2>
  <div>A list of ingredients</div>

  <!-- repeat the pattern... -->
  <h2>Instructions</h2>
  <div>A list of instructions</div>
</spicy-sections>
```

## Designing with Affordances

**Spicy Sections** lets authors express when affordances should be presented; using either an attribute or a CSS Custom Property.
The available affordancs are `collapse` (_summary/details like_), `tab-bar` (_tabs like_) and `exclusive-collapse` (_single select accordion like_).

To present an afforance of `collapse` on a smaller screen, you might use `[screen and (max-width: 800px)] collapse`.

```css
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

_Note: The CSS Custom Property is read only._

### Styling Affordance States

The element manages matching and entering the appropriate affordance states.
Ideally, if custom states are more widely supported, this element would use a custom state to allow you to style when the element was in that affordance state.
However, given existing limitations, the element reflects this affordance state via an `affordance` attribute containing the value of the currently matched affordance (if one exists).
_Note: setting the attribute will not update the *state* at runtime._
You can use this to style affordances independently - for example, the following would make headings blue if the component were in the `collapse` affordance state (meaning, they are collapsable)

```css
[affordance="collapse"] h2 { color: blue; }
```

### Shadow Parts for Affordances

The element is composed of an internal Shadow DOM containing 2 slots and exposing several parts which are exposed for author styling.
The structure of these parts is:

```css
::part(tab-bar)
   ::part(tab-list)
     /* tabListSlot */
::part(content-panels)
  /* default slot */
```

By default all contents are slotted into the default slot.
The act of changing affordances impacts which internal slots contents are projected into.
The `tab-bar` affordance projects headings into the tabListSlot.

#### Vertical Tabs

Authors can use the `::part` selectors with CSS to achieve several variants and customizations of tabs, for example 'vertical tabs' which pace the `tab-bar` on the left, and content on the right can be achieved very simply with grid via something like:

```css
spicy-sections {
  /* just to show that it's when tabs are employed */
  --const-mq-affordances: [screen and (min-width: 5px) ] tab-bar;

  /* one col for the tab-bar, one for the content */
  display: grid;
  grid-template-columns: 1fr 3fr;
}

 spicy-sections::part(tab-list) {
  /* by default tab-list uses flex to display in the inline direction */
  display: block;
}
```

### Hash References

In normal content, markup can contain `id` attributes which will be scrolled to and focus-navigation set to the first matching element when the URL contains a matching `#` (hash).
This element carries this idea forward and will activate tabs accordingly, whether that hash matches the heading, or content within it.

### Programatically setting the active affordance

The `<spicy-sections>` element exposes a `setActiveAffordance` method which can be called with any valid affordance name:

```javascript
element.setActiveAffordance('collapse') /* or tab-bar or exclusive-collapse */
```

---

## Standards Path?

This work is developed as part of explorations in Open UI, following some [extensive research toward potentially standardizing "tabs"](https://open-ui.org/components/tabs.research.parts).
We believe that the concept of an element which could conditionally present different interaction affordances, in much the same way that scroll panes do in the web platform today could be an important new concept allowing us to bring not just tabs, but several UI concepts to the platform.

However, there is a lot to think about - not the least of which is whether developers will adopt something like this.
This custom element provides a way for us to roughly evaluate the concepts, learn more about the problem and see.

Please check it out: Play with it.
Build something useful.
Ask questions, show us your uses, [give us feedback](https://github.com/tabvengers/spicy-sections/issues) about what you like or don't.
We'll also be watching the HTTP Archive data for adoption, and adoption is a good signal we've got something right and will help drive furtherance and priority of standards work.

There is also a post where you can [read more on the concept](https://bkardell.com/blog/SpicySections)

## Note

This element builds on progressive enhancement.
The resolution of module scripts is non-blocking and the display of different affordances can be quite different.
It is appealing then to minimize FOUC, and the one instrument that custom elements and CSS currently provide is `:not(:defined)`.

Unfortunately, using `:not(:defined)` to hide content fails to progressively enhance if the script fails to either load or execute; this is an [known issue](https://github.com/whatwg/html/issues/6231).
For now, you can improve the experience by hiding the content when the script is enabled, and then _race_ the definition.

```js
// dynamically inject styles to hide the content
let style = document.head.appendChild(
  Object.assign(document.createElement('style'), {
    textContent: 'spicy-sections:not(:defined) { visibility: hidden; }'
  })
);

// remove these styles after one second
setTimeout(() => style.remove(), 1000);
```
