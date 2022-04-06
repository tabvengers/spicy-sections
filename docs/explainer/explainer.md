# `<panelset>` Explainer

## Authors
	* Brian Kardell


## Draft specification
TODO: currently see OpenUI


## Abstract

"Tabs", "Accordions" and "Collapses" are common UI metaphors across the web. They are astonishingly hard to get "right" (for many reasons we discuss in this document).  As such, they exist (in some form, at least) in most UI libraries and toolkits, both for the web and natively.  It is not uncommon that web-oriented solutions also get things wrong.

This proposal introduces a new HTML element `<panelset>` representing a generic division of a document containing flat sections of  HTML's legacy, flat heading/content.  `<panelset>`s can be assigned "affordances" to present those sections of content with different interaction patterns, but a consistent and simple API surface.

The net result being that we establish a simple pattern upon which we can expose fewer options for authors as expressive inputs and allow a great deal of complexity and required knowledge to be taken care of for them.  Authors can declaratively specify that that content should selectively present as tabs or a series of diclosure easy and make sure that their content remains semantic, searchable, accessible and highly styleable.


## Table of Contents
  * [Terminology](#Terminology)
  * [Goals](#goals)
  * [Non-Goals](#non-goals)
  * [Background](#background-tabs)
  * [Design Discussion](#design-discussion)
     * [Parts and Styling](#parts-and-styling)
     * [API](#api)
  * [Considered Alternatives](#considered-alternatives)
     * [Independent Elements](#independent-elements)
     * [Other Markup Forms](#other-markup-forms)  
* [Stakeholder Feedback](#stakeholder-feedback)

## Terminology

As we will describe in other sections, it is dramatically difficult to pin down terminology for several reasons.  
	* UI Toolkits often have **several distinct controls with different features for something that many users would refer to as the same control**.  
   * ARIA roles feel initially like a good source of terminology, but they are incomplete (discussed in [Background](#Background). 
   * The ARIA Pratices Guide names seeveral patterns that fill the gaps ARIA leaves, but here too there are disagreements and overloaded terms ('accordion' for example has been used to represent what are two distinct controls with differing characteristics).  
   * It is debatable whether all use cases have the same implications.  While it is possible to review someone's attempt to provide conforming ARIA "tabs" and suggest where they got that wrong, it isn't clear that they all should be "proper ARIA tabs".  
   * Further, anything that employs ARIA roles changes the effective inherent meaning of an element, and potentially its contents.  Thus if a heading became understood as a "tab", it is difficult to keep straight whether "tab" refers to the element with the role tab, the part that you click, or the entire label + contents that represents the whole tab - which might not be an actual element in some cases.


Thus, we are somewhat left in a difficult spot to discuss these things with clarity.  Here, we will generally try our best to be clear whether we mean a more vaguely a "user perceived tab-like experience" vs "proper rich internet application tabs" and so on.  We will also use some discrete terminology when discussing parts which tries to be as explcit as possible.



## Goals 

* To **provide users with readable, usable and semantic content regardless of form factor or medium** (including things like print)

* To **lower the bar of necessary knowledge for author to make good choices and create accessible interfaces**

* To **provide authors with tools to express variable, often interchangeable affordances** and **meet currently difficult to impossible goals** (the ability for 'tabs' to responsively be reoriented as 'accordions' on mobile or to enable printing of all tabs as a document.

* To make content, at least for many common use cases, still useful in legacy browsers, search engines, etc.


## Non-Goals

* To initially provide a complete solution which natively accounts for every variant of control which might be commonly discussed by similar names (see [Background](#Background).  These would include initially providing a solution for "tabs" which solved for features typically about and common to controls geared toward multi-document management (like browser tabs).  Thus, we do not initially tackle  things like tabs which themselves contain semantic content or other interactive elements, draggable reordering, etc).  This is in part because ARIA itself is not currently in a postition to provide good accessible answer to those questions.




## Background

Work on ARIA began around a quarter of a century ago.  By then, many controls were common in UI toolkits, and there was work on native accessibility trees for those. ARIA would bring that to web controls.  It was largely initially imagined that the web would develop a new XML based language _for Rich Internet Applications_ (XUL, XAML and Flex were examples of attempts).  On the existing HTML-based web, some frameworks were beginning to develop which moved all markup and DOM behind similar toolkit abstractions - effectively "Windows, in the browser".  However, not only did the HTML-based web continue and a successor "for applications" fail to arrive, but both native applications and the web continued to evolve and cross-pollenate ideas based on their unique strengths.

Along the way this has caused many problems for users, and developers on the web for several reasons.  ARIA's bolt-on nature and complexities around applying that to web pages requires understanding very many, sometimes subtle things.  This is exacerbated by the constantly evolving state of user interfaces and new questions.  Ideally, HTML would create some parity with ARIA roles and simplify the problem for developers, dramatically lowering the bar toward creating accessible interfaces and improving the experience for end users.

3 controls have very similar qualities: Tabsets, accordions and disclosure widgets.  Each of these presents labelled content which can be viewed more selectively. These are among the most commonly used patterns, but also among the most complicated.  In 2014 this led to discussions about a [possible proposal](https://www.oreilly.com/content/panels-and-panel-sets/), an attempt to polyfill, and some experience which pointed to some interesting challenges at the time, and the effort quietly dissolved.

In 2020, OpenUI began research on Tabs, producing [a large survey of toolkits](https://open-ui.org/components/tabs.research.parts), their common features and so on. In 2021 it followed with an examination of markup approaches to tabs https://open-ui.org/components/tabs.research.markup as well as some recommended direction.


Key among these challenges is also that the web also has some unique contextual strengths and challenges that we will attempt to describe. Controls are deployed to dramatically different effects/aims.  The web serves both fundmentally document content which may choose to employ some of these patterns, and things which could more directly be considered the tradtional "rich internet application".  The qualities and use cases of these things are not entirely aligned, nor is it clear that they should always have the same accessibility characteristics.

It is very clear that in document oriented content, for example, it is a common desire that both form factor and media can affect the way content should display:

* On a very narrow screen, it might be desirable to collapse up until expanded
* On a very wide screen, or when printed, showing all of the content is more desirable

* On a very large screen, display as tabs might be desirable
* On a very small screen, something more like an accordion can make more sense
* When printed, it may be desirable to print the whole document, not just revealed content

This proposal attempts to resolve, or at least create useful boundaries around all of these problems by:

1. Introducing the concept of affordances, rather than discrete and unchanging controls.  A near parallel to this is scroll panes. Most UI toolkits included a scroll pane control, on the Web, this control (which does create an interactive element with its own parts) is deployed via CSS. 

2. Abstracting many of the complexities and minimizing necessary knowledge and providing simpler, higher level tool.  In doing so it introduces introduce a single new element `<panelset>`, with a consistent API.



------

## Design Discussion

Fundamentally, one of the biggest challenges, as highlighted by our research is that the definition of these components, their appropriate use, and markup, and what their API surface might look like when applied to markup is tremendously difficult to pin down.  The least common denominator of tabs is quite far from advanced, but common uses.  Many of the labels we use for these things are no-longer used in many toolkits for these reasons.  There often isn't a single UI class for "Tabs" but rather several classes which the average user or developer might commonly refer to as tabs, but with markedly different charateristics.

One seemingly clear delineating line is whether the purpose of the tabs is about managing the showing and hiding of views in the same application window/document or whether it is a view more equvalient to a window manager, allowing the switching between several independent contexts/windows/documents.

### Parts and styling
// TODO: Fill out an explanation of the parts we expose, and how they are named generically and able to be styled

### API

#### Attributes (optional)
##### affordance
A string containing the default affordance (an enum of possible values) of the panelset. When set, this attribute does not update the current affordance of the panelset.

```
<oui-panelset affordance="tabset">
	<!-- flat sections of content -->
</oui-panelset>
```

#### Properties
##### affordance

A string containing the current affordance of the panelset. When set, this property updates the current affordance of the panelset. This does not reflect the affordance attribute.

```
const panelset = document.querySelector('oui-panelset')

panelset.affordance = 'exclusive-disclosure'
```

#### Methods
##### getPanels()

An array of objects representing the sections of content as panels in the panelset.

Each panel object has a label property which returns the element identified as the label of the given panel, a contents property which returns the elements and text nodes identified as the contents of the given panel, and an open property which returns whether the given panel is open.

```
const panelset = document.querySelector('oui-panelset')
const panels = panelset.getPanels()

for (const panel of panelset) {
	console.log(panel) /* {
		open: boolean
		label: HTMLHeadingElement,
		content: (Element | Text)[]
	} */
}
```

## Considered Alternatives

### Independent elements 

The seemingly obvious alternative here would be to create independent elements, like `<tabset>` perhaps even with the idea that this is "for ARIA parity". However, we determined that for the time, at least, it seemed this was more costly and less valueable than it seemed.

* It wouldn't be a direct parity anyway as there not a good 1:1 between roles and UI patterns. There is no overarching 'tabset' role, nor an 'accordion' role, for example.
* It doesn't solve for the resposive/document needs
* In the end, if we were to propose a `<tabset>` or an `<accordion>` it would have looked very similar from an authoring and API standpoint (see [Other Markup Forms](#Other%20Markup%20Forms)
	* This proposal allows a default affordance attribute which means this would not be a big gain for authors, and less flexible.


### Other markup forms

We spent quite a lot of time discussing and considering all of the forms of markup that these components have taken, and how we might move forward.  Some things that seemed clear:

* There are _many_ variations in history - we reviewed [at least 11 alternatives, just for tabsets, listing pros and cons](https://open-ui.org/components/tabs.research.markup).  
	* Many are verbose, involving many new elements with potentially complex DOM relationships and potentially significant necessary modifications to the parser. 
   * Each multi-element solution also attemped new APIs which somehow attempt to make it more "app-like" but which still ultimately have to deal with the fact that they are fundamentally DOM-oriented.
   * Several of them have a poor fallback story

Thus, we proposed just 1 element which leans into HTML's existing particularities and strengths, adds a minimal API surface and does not "fight" its DOM nature.


## Stakeholder Feedback
TODO
