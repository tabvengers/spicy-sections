// export namespace Internals {
// 	export interface Internals {
// 		[key: string]: any

// 		entrySet: Link[]
// 		entryMap: WeakMap<HTMLButtonElement, Link>

// 		addEntry(): Link
// 	}

// 	export type H = {
// 		[K in keyof HTMLElementTagNameMap]: {
// 			(props: Record<string, any>, ...children: any[]): K extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[K] : HTMLElement
// 			(...children: any[]): K extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[K] : HTMLElement
// 		}
// 	} & {
// 		[K in string]: {
// 			(props: Record<string, any>, ...children: any[]): HTMLElement
// 			(...children: any[]): HTMLElement
// 		}
// 	}

// 	export interface Link {
// 		label: HTMLButtonElement
// 		panel: HTMLDivElement
// 		active: boolean
// 		prev: Link | null
// 		next: Link | null
// 		all: Link[]
// 	}

// 	export interface Links {
// 		all: Link[]

// 		ref: WeakMap<EventTarget, Link>

// 		clear(): void

// 		add(label: Link['label'], panel: Link['panel']): void

// 		get(target: EventTarget): Link

// 		toggleOne(target: EventTarget & HTMLElement): void
// 	}
// }

export type AffordanceType = 'collapse' | 'exclusive-collapse' | 'tab-bar'

export interface Internals {
	affordance: AffordanceType
	sectionSet: Paneled.Section[],
	sectionMap: WeakMap<HTMLButtonElement, Paneled.Section>

	addSection(contentSection: Content.Section): Paneled.Section

	toggle(paneledSection: Paneled.Section): void

	templates: {
		[K in AffordanceType]: {
			(container: HTMLElement): {
				addSection(section: Paneled.Section): void
			}
		}
	}

	refresh(): void
}

export namespace Content {
	export type Section = {
		label: HTMLHeadingElement,
		panel: ChildNode[]
	}

	export interface GetSections {
		(host: HTMLElement): Section[]
	}
}

export namespace Paneled {
	export interface SectionLabel {
		element: HTMLButtonElement
		marker: SVGSVGElement
		slot: HTMLSlotElement
		slotted: HTMLHeadingElement
	}

	export interface SectionPanel {
		element: HTMLDivElement
		slot: HTMLSlotElement
		slotted: ChildNode[]
	}

	export interface Section {
		label: Paneled.SectionLabel
		panel: Paneled.SectionPanel
		open: boolean
		prev: Paneled.Section | null
		next: Paneled.Section | null
	}
}

export type ChildNode = Element | Text

export type ElementName = keyof HTMLElementTagNameMap | keyof SVGElementTagNameMap | (string & Record<never, never>)

export type AnyElement<T extends ElementName = ElementName> = T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : T extends keyof SVGElementTagNameMap ? SVGElementTagNameMap[T] : HTMLElement

export interface AnyNode extends Element, Text {}

export type ElementProps<E extends Element> = {
	[K in keyof E]: K[E]
}

export interface AssignElement<E extends Element = Element> {
	(props: ElementProps<E>, ...children: any[]): E
	(...children: any[]): E
}

type ElementProxy = {
	[K in ElementName]: AssignElement<AnyElement<K>>
}

export interface CreateElement extends ElementProxy {
	<T extends ElementName | AnyElement, E = T extends ElementName ? AnyElement<T> : T>(target: T, props: ElementProps<E>, ...children: any[]): E
	<T extends ElementName | AnyElement, E = T extends ElementName ? AnyElement<T> : T>(target: T, ...children: any[]): E
}

export type AnyString = string & Record<never, never>
