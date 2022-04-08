const ariaVars = 'let roleRefs={roletype:["roletype"],command:["widget"],composite:["widget"],input:["widget"],landmark:["section"],range:["structure"],section:["structure"],sectionhead:["structure"],select:["group","composite"],structure:["roletype"],widget:["roletype"],window:["roletype"],alert:["section"],alertdialog:["dialog","alert"],application:["structure"],article:["document"],banner:["landmark"],blockquote:["section"],button:["command"],caption:["section"],cell:["section"],checkbox:["input"],code:["section"],columnheader:["sectionhead","gridcell","cell"],combobox:["input"],complementary:["landmark"],contentinfo:["landmark"],definition:["section"],deletion:["section"],dialog:["window"],directory:["list"],document:["structure"],emphasis:["section"],feed:["list"],figure:["section"],form:["landmark"],generic:["structure"],grid:["table","composite"],gridcell:["widget","cell"],group:["section"],heading:["sectionhead"],img:["section"],insertion:["section"],link:["command"],list:["section"],listbox:["select"],listitem:["section"],log:["section"],main:["landmark"],marquee:["section"],math:["section"],menu:["select"],menubar:["menu"],menuitem:["command"],menuitemcheckbox:["menuitem","checkbox"],menuitemradio:["radio","menuitemcheckbox"],meter:["range"],navigation:["landmark"],note:["section"],option:["input"],paragraph:["section"],presentation:["structure"],progressbar:["widget","range"],radio:["input"],radiogroup:["select"],region:["landmark"],row:["widget","group"],rowgroup:["structure"],rowheader:["sectionhead","gridcell","cell"],scrollbar:["widget","range"],search:["landmark"],searchbox:["textbox"],separator:["structure"],slider:["range","input"],spinbutton:["range","input","composite"],status:["section"],strong:["section"],subscript:["section"],superscript:["section"],switch:["checkbox"],tab:["widget","sectionhead"],table:["section"],tablist:["composite"],tabpanel:["section"],term:["section"],textbox:["input"],time:["section"],timer:["status"],toolbar:["group"],tooltip:["section"],tree:["select"],treegrid:["tree","grid"],treeitem:["option","listitem"]},queryRefs={command:["menuitem"],menuitem:["menuitem"],roletype:["rel"],article:["article"],banner:["header"],button:[\'input[aria-pressed][type="checkbox"i]\',\'summary[aria-expanded="false"i]\',\'summary[aria-expanded="true"i]\',\'input[type="button"i]\',\'input[type="image"i]\',\'input[type="reset"i]\',\'input[type="submit"i]\',"button"],cell:["td"],checkbox:[\'input[type="checkbox"i]\'],columnheader:["th"],combobox:[\'input[list][type="email"i]\',\'input[list][type="search"i]\',\'input[list][type="tel"i]\',\'input[list][type="text"i]\',\'input[list][type="url"i]\',"select:not([multiple]):not([size])",\'select:not([multiple])[size="1"i]\'],complementary:["aside"],contentinfo:["footer"],definition:["dd"],dialog:["dialog"],document:["body"],figure:["figure"],form:["form[aria-label]","form[aria-labelledby]","form[name]"],generic:["span","div"],grid:[\'table[role~="grid"i]\'],gridcell:[\'td[role~="gridcell"i]\'],group:["details","fieldset","optgroup"],heading:["h1","h2","h3","h4","h5","h6"],img:["img[alt]","img:not([alt])"],link:["a[href]","area[href]","link[href]"],list:["menu","ol","ul"],listbox:["select[size][multiple]","select[size]","select[multiple]","datalist"],listitem:["li"],main:["main"],math:["math"],navigation:["nav"],option:["option"],progressbar:["progress"],radio:[\'input[type="radio"i]\'],region:["section[aria-label]","section[aria-labelledby]","frame"],row:["tr"],rowgroup:["tbody","tfoot","thead"],rowheader:[\'th[scope="row"i]\'],searchbox:[\'input:not([list])[type="search"i]\'],separator:["hr"],slider:[\'input[type="range"i]\'],spinbutton:[\'input[type="number"i]\'],status:["output"],table:["table"],term:["dfn","dt"],textbox:["input:not([type]):not([list])",\'input:not([list])[type="email"i]\',\'input:not([list])[type="tel"i]\',\'input:not([list])[type="text"i]\',\'input:not([list])[type="url"i]\',"textarea"]},getRoles=e=>{let t=[e];if("roletype"!==e&&e in roleRefs)for(let i of roleRefs[e])t.push(...getRoles(i));return t},getRoleSelectors=e=>{let t=[`[role="${e}"i]`];if(e in queryRefs&&t.push(...queryRefs[e]),"roletype"!==e)for(let i in roleRefs)roleRefs[i].includes(e)&&t.push(...getRoleSelectors(i));return t};'

/** Returns the computed ARIA level for the element. */
export const ariaLevel = Function(
	'element',
	[
		'if (!Element.prototype.isPrototypeOf(element)) return 2',

		'return Number(',
			'element.getAttribute("aria-level") || String(',
				'element.localName || element.tagName || ""',
			').replace(/^[Hh]([\\d])$/, "$1")',
		') || 2',
	].join('\n')
) as (element: Element) => number | null

/** Returns the computed ARIA roles for the element. */
export const ariaRole = Function(
	'element',
	[
		ariaVars,
		'if (!Element.prototype.isPrototypeOf(element)) return []',

		'if (element.hasAttribute("role")) return element.getAttribute("role").trim().split(/\\s+/).filter(Boolean)',

		'for (let role in queryRefs) {',
			'if (element.matches(getRoleSelectors(role).join(","))) {',
				'roles.push(role)',
			'}',
		'}',

		'return roles',
	].join('\n')
) as (element: Element) => string[]

/** Returns elements matching the given computed ARIA role. */
export const findByAriaRole = Function(
	'elements',
	'role',
	[
		ariaVars,

		'let selector = getRoleSelectors(role).join(",")',

		'let results = []',

		'for (let element of elements) {',
			'if (!Element.prototype.isPrototypeOf(element)) continue',

			'results.push(...element.querySelectorAll(selector))',
		'}',

		'return results',
	].join('\n')
) as (elements: Element[], role: string) => Element[]
