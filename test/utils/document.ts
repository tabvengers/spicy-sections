import * as testcafe from './testcafe'

export const document = () => testcafe.find(() => window.document).addCustomDOMProperties({
	outerHTML(element): string {
		return Reflect.get(element, 'outerHTML')
	},
	part(element): string[] {
		return Array.from(Reflect.get(element, 'part'))
	},
	role(element): string[] {
		let roleText = 'roletype,0;command,10;composite,10;input,10;landmark,6;range,9;section,9;sectionhead,9;select,39,2;structure,0;widget,0;window,0;alert,6;alertdialog,29,12;application,9;article,31;banner,4;blockquote,6;button,1;caption,6;cell,6;checkbox,3;code,6;columnheader,7,38,20;combobox,3;complementary,4;contentinfo,4;definition,6;deletion,6;dialog,11;directory,44;document,9;emphasis,6;feed,44;figure,6;form,4;generic,9;grid,81,2;gridcell,10,20;group,6;heading,7;img,6;insertion,6;link,1;list,6;listbox,8;listitem,6;log,6;main,4;marquee,6;math,6;menu,8;menubar,51;menuitem,1;menuitemcheckbox,53,21;menuitemradio,63,54;meter,5;navigation,4;note,6;option,3;paragraph,6;presentation,9;progressbar,10,5;radio,3;radiogroup,8;region,4;row,10,39;rowgroup,9;rowheader,7,38,20;scrollbar,10,5;search,4;searchbox,85;separator,9;slider,5,3;spinbutton,5,3,2;status,6;strong,6;subscript,6;superscript,6;switch,21;tab,10,7;table,6;tablist,2;tabpanel,6;term,6;textbox,3;time,6;timer,75;toolbar,39;tooltip,6;tree,8;treegrid,90,37;treeitem,59,46'
		let roleList = roleText.split(';').map(ariaRole => ariaRole.split(','))
		let roleRefs = roleList.reduce((roleRefs, [ role, ...refs]) => Object.assign(roleRefs, { [role]: refs.map(ref => roleList[ref][0]) }), {})
		let getRoles = (role: string) => {
			let roles = [ role ]
			if (role !== 'roletype' && role in roleRefs) {
				for (let superRole of roleRefs[role]) {
					roles.push(...getRoles(superRole))
				}
			}
			return roles
		}

		let queryText = 'command,menuitem;menuitem,menuitem;roletype,rel;article,article;banner,header;button,input[aria-pressed][type="checkbox"i],summary[aria-expanded="false"i],summary[aria-expanded="true"i],input[type="button"i],input[type="image"i],input[type="reset"i],input[type="submit"i],button;cell,td;checkbox,input[type="checkbox"i];columnheader,th;combobox,input[list][type="email"i],input[list][type="search"i],input[list][type="tel"i],input[list][type="text"i],input[list][type="url"i],select:not([multiple]):not([size]),select:not([multiple])[size="1"i];complementary,aside;contentinfo,footer;definition,dd;dialog,dialog;document,body;figure,figure;form,form[aria-label],form[aria-labelledby],form[name];generic,span,div;grid,table[role~="grid"i];gridcell,td[role~="gridcell"i];group,details,fieldset,optgroup;heading,h1,h2,h3,h4,h5,h6;img,img[alt],img:not([alt]);link,a[href],area[href],link[href];list,menu,ol,ul;listbox,select[size][multiple],select[size],select[multiple],datalist;listitem,li;main,main;math,math;navigation,nav;option,option;progressbar,progress;radio,input[type="radio"i];region,section[aria-label],section[aria-labelledby],frame;row,tr;rowgroup,tbody,tfoot,thead;rowheader,th[scope="row"i];searchbox,input:not([list])[type="search"i];separator,hr;slider,input[type="range"i];spinbutton,input[type="number"i];status,output;table,table;term,dfn,dt;textbox,input:not([type]):not([list]),input:not([list])[type="email"i],input:not([list])[type="tel"i],input:not([list])[type="text"i],input:not([list])[type="url"i],textarea'
		let queryList = queryText.split(';').map(queryList => queryList.split(','))
		let queryRefs = queryList.reduce((queryRefs, [ role, ...matches]) => Object.assign(queryRefs, { [role]: matches }), {})

		let getRoleSelectors = (role: string) => {
			let roles = [ `[role="${role}"i]` ]
			if (role in queryRefs) roles.push(...queryRefs[role])
			if (role !== 'roletype') {
				for (let altRole in roleRefs) {
					if (roleRefs[altRole].includes(role)) {
						roles.push(...getRoleSelectors(altRole))
					}
				}
			}
			return roles
		}

		let roles = element.hasAttribute('role') ? element.getAttribute('role').trim().split(/\s+/) : []

		for (let role in queryRefs) {
			if (element.matches(getRoleSelectors(role).join(','))) {
				roles.push(role)
			}
		}

		return roles
	},
}).addCustomMethods({
	getProperty(element, property: PropertyKey): any {
		return element === Object(element) ? Reflect.get(element, property) : undefined
	},
	matches(element, match: string): boolean {
		return element instanceof Element ? Element.prototype.matches.call(element, match) as boolean : false
	},
}).addCustomMethods({
	assignedNodes(elements): Node[] {
		let results: Node[] = []

		for (let element of elements) {
			if (element instanceof HTMLSlotElement) {
				results.push(...element.assignedNodes())
			}
		}

		return results
	},
	assignedSlot(elements): Element[] {
		let results: Element[] = []

		for (let element of elements) {
			const assignedSlot = (element as any).assignedSlot()

			if (assignedSlot) {
				results.push(assignedSlot)
			}
		}

		return results
	},
	at(elements, index: number): Element | null {
		index = Math.trunc(index) || 0
	
		if (index < 0) index += elements.length;
	
		if (index < 0 || index >= elements.length) return null;
	
		return elements[index];
	},
	find(elements, match: string): Element[] {
		let [ , liteSelector, darkSelector = '' ] = match.match(/^([\W\w]+?)(?:\::part\((.+)\))?$/)
		let results: Element[] = []

		for (let element of elements) {
			let liteElements = element.querySelectorAll(liteSelector)

			if (darkSelector) {
				for (let lightElement of liteElements) {
					if (lightElement.shadowRoot) {
						let darkElements = lightElement.shadowRoot.querySelectorAll(darkSelector.split(/\s+/).map(part => `[part~="${part}"]`).join(''))

						results.push(...darkElements)
					}
				}
			} else {
				results.push(...liteElements)
			}
		}

		return results
	},
	findByPart(elements, parts: string): Element[] {
		parts = parts.trim().split(',').map(
			parts => parts.trim().split(/\s+/).map(part => `[part~="${part}"]`).join('')
		).join(',')

		let results: Element[] = []

		for (let element of elements) {
			let { shadowRoot } = element

			results.push(...shadowRoot.querySelectorAll(parts))
		}

		return results
	},
	findByRole(elements, match: string): Element[] {
		let roleText = 'roletype,0;command,10;composite,10;input,10;landmark,6;range,9;section,9;sectionhead,9;select,39,2;structure,0;widget,0;window,0;alert,6;alertdialog,29,12;application,9;article,31;banner,4;blockquote,6;button,1;caption,6;cell,6;checkbox,3;code,6;columnheader,7,38,20;combobox,3;complementary,4;contentinfo,4;definition,6;deletion,6;dialog,11;directory,44;document,9;emphasis,6;feed,44;figure,6;form,4;generic,9;grid,81,2;gridcell,10,20;group,6;heading,7;img,6;insertion,6;link,1;list,6;listbox,8;listitem,6;log,6;main,4;marquee,6;math,6;menu,8;menubar,51;menuitem,1;menuitemcheckbox,53,21;menuitemradio,63,54;meter,5;navigation,4;note,6;option,3;paragraph,6;presentation,9;progressbar,10,5;radio,3;radiogroup,8;region,4;row,10,39;rowgroup,9;rowheader,7,38,20;scrollbar,10,5;search,4;searchbox,85;separator,9;slider,5,3;spinbutton,5,3,2;status,6;strong,6;subscript,6;superscript,6;switch,21;tab,10,7;table,6;tablist,2;tabpanel,6;term,6;textbox,3;time,6;timer,75;toolbar,39;tooltip,6;tree,8;treegrid,90,37;treeitem,59,46'
		let roleList = roleText.split(';').map(ariaRole => ariaRole.split(','))
		let roleRefs = roleList.reduce((roleRefs, [ role, ...refs]) => Object.assign(roleRefs, { [role]: refs.map(ref => roleList[ref][0]) }), {})
		let getRoles = (role) => {
			let roles = [ role ]
			if (role !== 'roletype' && role in roleRefs) {
				for (let superRole of roleRefs[role]) {
					roles.push(...getRoles(superRole))
				}
			}
			return roles
		}

		let queryText = 'command,menuitem;menuitem,menuitem;roletype,rel;article,article;banner,header;button,input[aria-pressed][type="checkbox"i],summary[aria-expanded="false"i],summary[aria-expanded="true"i],input[type="button"i],input[type="image"i],input[type="reset"i],input[type="submit"i],button;cell,td;checkbox,input[type="checkbox"i];columnheader,th;combobox,input[list][type="email"i],input[list][type="search"i],input[list][type="tel"i],input[list][type="text"i],input[list][type="url"i],select:not([multiple]):not([size]),select:not([multiple])[size="1"i];complementary,aside;contentinfo,footer;definition,dd;dialog,dialog;document,body;figure,figure;form,form[aria-label],form[aria-labelledby],form[name];generic,span,div;grid,table[role~="grid"i];gridcell,td[role~="gridcell"i];group,details,fieldset,optgroup;heading,h1,h2,h3,h4,h5,h6;img,img[alt],img:not([alt]);link,a[href],area[href],link[href];list,menu,ol,ul;listbox,select[size][multiple],select[size],select[multiple],datalist;listitem,li;main,main;math,math;navigation,nav;option,option;progressbar,progress;radio,input[type="radio"i];region,section[aria-label],section[aria-labelledby],frame;row,tr;rowgroup,tbody,tfoot,thead;rowheader,th[scope="row"i];searchbox,input:not([list])[type="search"i];separator,hr;slider,input[type="range"i];spinbutton,input[type="number"i];status,output;table,table;term,dfn,dt;textbox,input:not([type]):not([list]),input:not([list])[type="email"i],input:not([list])[type="tel"i],input:not([list])[type="text"i],input:not([list])[type="url"i],textarea'
		let queryList = queryText.split(';').map(queryList => queryList.split(','))
		let queryRefs = queryList.reduce((queryRefs, [ role, ...matches]) => Object.assign(queryRefs, { [role]: matches }), {})

		let getRoleSelectors = (role: string) => {
			let roles = [ `[role="${role}"i]` ]
			if (role in queryRefs) roles.push(...queryRefs[role])
			if (role !== 'roletype') {
				for (let altRole in roleRefs) {
					if (roleRefs[altRole].includes(role)) {
						roles.push(...getRoleSelectors(altRole))
					}
				}
			}
			return roles
		}

		let selector = getRoleSelectors(match).join(',')
		let results: Element[] = []

		for (let element of elements) {
			results.push(...element.querySelectorAll(selector))
		}

		return results
	},
	slotted(elements, match?: string): Node[] {
		let results: Node[] = []

		for (let element of elements) {
			if (element instanceof HTMLSlotElement) {
				addSlot(element)
			} else {
				for (let slot of element.querySelectorAll('slot')) {
					addSlot(slot)
				}
			}
		}

		function addSlot(slot: HTMLSlotElement) {
			for (const node of slot.assignedNodes()) {
				addNode(node)
			}
		}

		function addNode(node: Node) {
			if (match == null || (node instanceof Element && node.matches(match))) {
				results.push(node)
			}
		}

		return results
	},
}, {
	returnDOMNodes: true
})

export type SelectorAPI = ReturnType<typeof document>
export type TestController = globalThis.TestController
