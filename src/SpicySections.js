    //import { MediaAffordancesElement } from "./MediaAffordancesElement.js";
    class MediaAffordancesElement extends HTMLElement {
      constructor() {
        super();
        // todo: this should be a private field
        this.__matching = new Set()
        this.mqls = [];
        this.observers = [];

        this.supportedAffordances = new Set();
      }

      observeAffordanceChange(cb) {
        this.observers.push(cb);
      }

      notifyChange() {
        let intersection = new Set();
        for (let elem of this.__matching) {
          if (this.supportedAffordances.has(elem)) {
            intersection.add(elem);
          }
        }

        if (this.__matching.size > 0) {
          this.setAttribute("mq-matched", [...this.__matching].join(" "));
        } else {
          this.removeAttribute("mq-matched");
        }
        let arr =  [...intersection]
        let affordance = arr[arr.length - 1];
        if (affordance) {
          this.setAttribute("affordance", affordance);
        } else {
          this.removeAttribute("affordance");
        }
        this.observers.forEach(cb => {
          cb(intersection, this.__matching);
        });
      }

      static get observedAttributes() {
        return ["mq-affordances"];
      }

      connectedCallback() {
        let newValue = getComputedStyle(this).getPropertyValue(
          "--const-mq-affordances"
        );
        this.connectListeners(newValue);
      }

      connectListeners(newValue = "") {
        if (newValue.trim().length === 0) {
          return;
        }
        
        newValue.split("|").forEach(segment => {
          let mq = segment.trim().match(/\[([^\]]*)/)[1];
          let names = segment
            .replace(`[${mq}]`, "")
            .trim()
            .split(" ");
          let mql = window.matchMedia(mq);
          let mqh = evt => {
            names.forEach(name => {
              this.__matching[mql.matches ? "add" : "delete"](name);
            });

            this.notifyChange();
          };
          mqh();
          mql.addEventListener("change", mqh);
          this.mqls.push(mql);
        }, this);
      }

      attributeChangedCallback(name, oldValue, newValue) {
        this.connectListeners(newValue);
      }
    }

    //-----------------------------------------------------

    (function() {
      let lastUId = 0;
      let nextUId = () => {
        return `cp${++lastUId}`;
      };

      let getLabels = regionset => {
        return [...regionset.children].filter(el => /^H\d$/.test(el.tagName));
      };

      let getContentEls = regionset => {
        return [...regionset.children].filter(el => !/^H\d$/.test(el.tagName));
      };

      let ensureId = el => {
        el.id = el.id || nextUId();
        return el.id;
      };

      let getDisclosureButton = label => {
        return label.shadowRoot.querySelector("button");
      };

     
      let style = document.createElement('style')
      style.innerHTML = `
          
        :where(spicy-sections > [affordance*="collapse"])::before { 
          content: ' ';
          display: inline-block;
          width: 0.5em;
          height: 0.75em;
          margin: 0 0.4em 0 0;
          transform: rotate(90deg);
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='10px' height='10px' viewBox='0 0 270 240' enable-background='new 0 0 270 240' xml:space='preserve'%3e%3cpolygon fill='black' points='5,235 135,10 265,235 '/%3e%3c/svg%3e ");
          background-size: 100% 100%;
        } 

        :where(spicy-sections > [affordance*="collapse"][aria-expanded="true"])::before, 
        :where(spicy-sections > [affordance*="collapse"][aria-expanded="true"])::after {
          transform: rotate(180deg);
        }
      `
      document.head.prepend(style)
      
      const template = `
            <style>
              :root {
                font-size: 1rem;
              }

              :host([hidden]),
              ::slotted([hidden]) {
                display: none;
              }
              
              ::slotted(h1),
              ::slotted(h2),
              ::slotted(h3),
              ::slotted(h4),
              ::slotted(h5),
              ::slotted(h6) {
                 margin-right: 1rem;
              }
              
              tab-bar ::slotted([tabindex="0"]) {
                border-bottom: 1px solid blue;
              }
              
              tab-list { 
                display: flex; 
                overflow: hidden;
                white-space: nowrap;
              }
            </style>
            <tab-bar part="tab-bar">
              <!-- The region/tablist should have a  label -->
              <tab-list part="tab-list" role="tablist"
              ><slot name="tabListSlot"></slot></tab-list>
            </tab-bar>
            <content part="content-panels">
              <slot default></slot>
            </content>
        `;

      class RegionSet extends MediaAffordancesElement {
        __defaults;
        __tabListEl;

        // tabs and exclusive collapses should have the same affordance object?
        __affordanceConf = {
          collapse: {
            // can take a condition to force, check-like
            toggle: (label, condition) => {
              let state =
                typeof condition === "boolean"
                  ? condition
                  : !label.affordanceState.expanded;
              let contentEl = label.nextElementSibling;
              label.affordanceState.expanded = state;
              label.affordanceState.nonExclusiveExpanded = state;
              label.setAttribute("aria-expanded", state);
              if (state) {
                label.setAttribute("expanded", "");
                contentEl.style.display = "block";
              } else {
                label.removeAttribute("expanded");
                contentEl.style.display = "none";
              }
            }
          },
          "exclusive-collapse": {
            // ignores condition, radio-like
            toggle: label => {
              let labels = getLabels(label.parentElement);
              let siblings = labels.filter(c => c !== label);
              let index = labels.findIndex(c => c === label);

              siblings.forEach((sibLabel, i) => {
                let relatedContent = sibLabel.nextElementSibling;
                sibLabel.tabIndex = -1;
                relatedContent.style.display = "none";
                label.setAttribute("aria-expanded", "false");
                sibLabel.affordanceState.exclusiveExpanded = false;
              });
              label.tabIndex = 0;
              //nope - todo, fix/remove this?
              label.parentElement.affordanceState.exclusiveSelection.index = index;
              label.nextElementSibling.style.display = "block";
              label.setAttribute("aria-expanded", "true");
              label.affordanceState.exclusiveExpanded = true;
              label.focus();
            }
          },
          "tab-bar": {
            // ignores condition, radio-like
            toggle: label => {
              let labels = getLabels(label.parentElement);
              let siblings = labels.filter(c => c !== label);
              let index = labels.findIndex(c => c === label);

              siblings.forEach((sibLabel, i) => {
                let relatedContent = sibLabel.nextElementSibling;
                sibLabel.tabIndex = -1;
                relatedContent.style.display = "none";
                sibLabel.setAttribute("aria-expanded", "false");
                sibLabel.affordanceState.exclusiveExpanded = false;
              });
              label.tabIndex = 0;
              label.parentElement.affordanceState.exclusiveSelection.index = index;
              label.nextElementSibling.style.display = "block";
              label.setAttribute("aria-expanded", "true");
              label.affordanceState.exclusiveExpanded = true;
              label.focus();
            }
          }
        };
        __setSize = (labelEls, contentEls) => {
          this.__size = Math.min(labelEls.length, contentEls.length);

          if (labelEls.length !== this.__size) {
            console.warn("mismatch in tab-set label/content pairs...");
          }

          labelEls.forEach((labelEl, i) => {
            let contentEl = contentEls[i];
            if (!labelEl.initialized) {
              labelEl.initialized = true; // todo: this used to be shadow, do i need it?
              let defs = this.__defaults.defaultActive;

              // this assumes it is about collapses
              labelEl.affordanceState = {
                expanded: defs.includes(labelEl),
                active: false,
                // activate in the current mode
                activate: () => {
                  if (this.affordanceState.current) {
                    this.__affordanceConf[this.affordanceState.current].toggle(
                      labelEl
                    );
                  }
                }
              };

              let defaultExclusive =
                defs.length === 0 ? labelEls[0] : defs[defs.length - 1];

              this.affordanceState.exclusiveSelection.index = labelEls.indexOf(
                defaultExclusive
              );
            }
            labelEl.setMode = mode => {
              if (mode === "non-exclusive") {
                let isExpanded = labelEl.affordanceState.expanded;
                labelEl.setAttribute("affordance", "collapse");
                labelEl.setAttribute("tabindex", "0");
                labelEl.setAttribute("aria-controls", contentEl.id);
                labelEl.setAttribute("role", "button");
                labelEl.setAttribute("aria-expanded", isExpanded);
                labelEl.nextElementSibling.style.display = isExpanded
                  ? "block"
                  : "none";
              } else if (mode === "exclusive") {
                let isExpanded =
                  labelEls.indexOf(labelEl) ===
                  this.affordanceState.exclusiveSelection.index;
                labelEl.setAttribute("affordance", "collapse");
                labelEl.setAttribute("tabindex", isExpanded ? 0 : -1);
                labelEl.setAttribute("role", "button");
                labelEl.setAttribute("aria-expanded", isExpanded);
                labelEl.setAttribute("aria-controls", contentEl.id);
                labelEl.nextElementSibling.style.display = isExpanded
                  ? "block"
                  : "none";
              } else {
                labelEl.removeAttribute("tabIndex");
                labelEl.removeAttribute("affordance");
                labelEl.removeAttribute("aria-expanded");
                labelEl.removeAttribute("role");
              }
            };
          });
        };

        __projectTabBar = () => {
          this.__removeProjections();
          getLabels(this).forEach((tabSource, i) => {
            let selected = false,
              tabIndex = -1,
              display = "none";

            tabSource.setMode();
            tabSource.slot = "tabListSlot";
            tabSource.setAttribute("role", "tab");
            let tabId = ensureId(tabSource);
            let contentSource = tabSource.nextElementSibling;
            contentSource.tabIndex = 0;
            tabSource.setAttribute("aria-controls", ensureId(contentSource));
            contentSource.setAttribute("role", "tabpanel");
            contentSource.setAttribute("aria-labelledby", tabSource.id);
            if (i === this.affordanceState.exclusiveSelection.index) {
              tabIndex = 0;
              selected = true;
              display = "block";
            }
            tabSource.setAttribute("aria-selected", selected);
            tabSource.tabIndex = tabIndex;
            contentSource.style.display = display;

            // TODO: aria-orientation :(
          });
        };

        __projectCollapses = exclusive => {
          // TODO - remove projections and... ??
          this.__removeProjections();
          getLabels(this).forEach(label => {
            label.setMode(exclusive ? "exclusive" : "non-exclusive");
          });
        };

        __removeProjections = () => {
          [...this.children].forEach(child => {
            child.removeAttribute("slot");
            child.removeAttribute("affordance")
            child.removeAttribute("role");
            child.removeAttribute("aria-selected");
            child.removeAttribute("aria-controls");
            child.removeAttribute("tabindex");
            child.removeAttribute("aria-expanded")
            child.style.display = "block";
          });
        };

        // matching pairs
        __size = 0;

        __configure = () => {
          ///hmmm

          this.__setSize(getLabels(this), getContentEls(this));

          if (this.affordanceState.current === "tab-bar") {
            this.affordanceState.currentMode = "exclusive";
            this.__projectTabBar();
          } else if (this.affordanceState.current === "collapse") {
            this.affordanceState.currentMode = "non-exclusive";
            this.__projectCollapses();
          } else if (this.affordanceState.current === "exclusive-collapse") {
            this.affordanceState.currentMode = "exclusive";
            this.__projectCollapses(true);
          } else {
            this.affordanceState.currentMode = undefined;
            this.__removeProjections();
          }

          let specifiedIndex = this.activeTabIndex || 0;
          // TODO: hmm, these are DOM changes, we could cache them
          let labelEls = getLabels(this);
          let contentEls = getContentEls(this);

          for (let i = 0; i < this.__size; i++) {
            let label = labelEls[i];
            // probably add one handler that decides
            if (!label._inited) {
              label.addEventListener("click", evt => {
                evt.target.affordanceState.activate();
              });
              label._inited = true;
            }
          }
        };
        
        __childListObserver = new MutationObserver(mutationList => {
          // we have to wire up new elements
          let labelEls = getLabels(this);
          let contentEls = getContentEls(this);

          // what if there is a mismatch?
          this.__setSize(labelEls, contentEls);
          this.__configure();
        });

        __tabset;

        affordanceState = {
          exclusiveSelection: { index: undefined },
          current: undefined,
          currentMode: undefined,
          getLabels: () => {
            return getLabels(this);
          }
        };

        /*
          Wires up suppored affordances...
        */
        constructor() {
          super();
          this.supportedAffordances.add("tab-bar");
          this.supportedAffordances.add("collapse");
          this.supportedAffordances.add("exclusive-collapse");

          this.observeAffordanceChange((matching, all) => {
            if (!this.__defaults) {
              this.__defaults = {
                onMatch: this.hasAttribute("defaults-on-match"),
                defaultActive: getLabels(this).filter(l =>
                  l.hasAttribute("default-activate")
                )
              };
            }
            this.affordanceState.current = this.getAttribute("affordance");
            this.__configure();
          });

          this.attachShadow({ mode: "open" });
          this.shadowRoot.innerHTML = template;
     
          this.__tabListEl = this.shadowRoot.querySelector("tab-list");
          this.addEventListener(
            "keydown",
            evt => {
              let labels = getLabels(this);
              let size = labels.length;
              let cur = this.affordanceState.exclusiveSelection.index;
              let prev = cur === 0 ? size - 1 : cur - 1;
              let next = cur === size - 1 ? 0 : cur + 1;

              if (
                this.affordanceState.current === "tab-bar" ||
                this.affordanceState.current === "exclusive-collapse"
              ) { 
                if (evt.keyCode == 37 || evt.keyCode == 38) {
                  labels[prev].affordanceState.activate();
                } else if (evt.keyCode == 39 || evt.keyCode == 40) {
                  labels[next].affordanceState.activate();
                }
              } else if (evt.keyCode == 32 && this.affordanceState.current === 'collapse') {
                evt.preventDefault()
              }
            },
            false
          );
          this.addEventListener(
            "keyup", 
            evt => {
              if (evt.keyCode == 32 && this.affordanceState.current === 'collapse') {
                evt.target.closest('[affordance]').affordanceState.activate()
                evt.preventDefault()
              }
            }
        }

        connectedCallback() {
          super.connectedCallback();

          //TODO: check whether there is a hash/handle selection
          
          // If you append a fragment with a pair, it should work
          this.__childListObserver.observe(this, { childList: true });
        }
      }
      customElements.define("spicy-sections", RegionSet);
    })();
