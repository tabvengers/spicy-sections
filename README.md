spicy-sections
=================

Spicy Sections: An experiement/demonstration
This glitch is an experiment, attempting think about (and demonstrate for discussion) an idea in which "good old well supported HTML" can be conditionally presented with different affordances: As a tab set, or with independent or exlcusive collapses ('disclosure widgets' and 'accordions').

If you want to cut to the chase and see something working, [check out this demonstration](https://codepen.io/bkardell/pen/VwpJGGL?editors=1100) and resize your browser window to see the afforances change.

This is using a custom element wrapper (`<spicy-sections>` which just wraps and progressively enhances heading and content pairs like...

You can import the custom element like...
```
<script type="module" src="/SpicySections.js"></script>
```

And then mark up sections by wrapping Good Old HTML with the `<spicy-sections>`  element like...

```
<spicy-sections>
  <!-- any heading here, followed by an element containing content --!>
  <h2>Ingredients</h2>
  <div>A list of ingredients</div>

  <!-- repeat the pattern... --!>
  <h2>Instructions</h2>
  <div>A list of instructions</div>
</spicy-sections>
```

Spicy sections allow authors to express when different affordances should be presented. This can be via an attribute, or a CSS Custom Property (though, this is read only once). To present these on a smaller screen as a series of collapses (as if they were summary/details like), this would look like...

```
[screen and (max-width: 800px)] collapse
```

The demo uses the following rule in its CSS:

```
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

This custom element isn't itself a proposal. It is something which we can use to roughly evaluate the concept an element which could conditionally present different interaction affordances, in much the same way scroll panes do in the web platform today.

There are many efforts happening in parallel discussing precisely how this should (and shouldn't or can and can't) work, but we'd love feedback about the crux of the idea itself. Please check it out: Play with it. Build something useful. Ask questions, show us your uses, [give us feedback](https://github.com/tabvengers/spicy-sections/issues) about what you like or don't.

[Read more](https://bkardell.com/blog/SpicySections)

### Note
This element really builds on progressive enhancement.  The resolution of module scripts is 
non-blocking and the display of different affordances can be quite different. It is appealing
then to minimize FOUC, and the one instrument that custom elements and CSS currently provide is 
`:not(:defined)`. However, using this to hide the content would sacrifice the progressive 
enhancement qualities if script failed to load or execute.  This is an [known issue](see https://github.com/whatwg/html/issues/6231).  You can create a slightly better experience 
with a simple script which only hides if script is enabled and "races" the definition or a timeout, 
like this...

```   
let ss = document.createElement("style");

ss.innerHTML = `html:not(.lldelay) :not(:defined) { visibility: hidden; }`;
document.head.appendChild(ss);

setTimeout(() => {
  document.documentElement.classList.add("lldelay");
}, 1000);
 ```
