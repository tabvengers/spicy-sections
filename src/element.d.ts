export type AffordanceType = 'collapse' | 'exclusive-collapse' | 'none' | 'tab-bar'

export interface Internals {
	affordance: AffordanceType
	sectionSet: Paneled.Section[],
	sectionMap: WeakMap<HTMLButtonElement, Paneled.Section>

	initialize(): void
	setAffordance(affordanceType: AffordanceType): void
	addSection(contentSection: Content.Section): Paneled.Section
	toggleSection(paneledSection: Paneled.Section): boolean

	templates: {
		[K in AffordanceType]: {
			(container: HTMLElement): {
				addSection(section: Paneled.Section): void
			}
		}
	}
}

export namespace Content {
	export type Section = {
		label: HTMLHeadingElement,
		panel: AnyNode[]
	}

	export interface GetSections {
		(host: HTMLElement): Section[]
	}
}

export namespace Paneled {
	export interface Section {
		label: {
			element: HTMLButtonElement
			marker: SVGSVGElement
			slot: HTMLSlotElement
			slotted: HTMLHeadingElement
		}

		panel: {
			element: HTMLDivElement
			slot: HTMLSlotElement
			slotted: AnyNode[]
		}

		open: boolean

		prev: Paneled.Section | null
		next: Paneled.Section | null
	}
}

export type AnyNode = Element | Text

export type AnyElementName = keyof HTMLElementTagNameMap | keyof SVGElementTagNameMap | (string & Record<never, never>)

export type AnyElement<T extends AnyElementName = AnyElementName> = T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : T extends keyof SVGElementTagNameMap ? SVGElementTagNameMap[T] : HTMLElement

export type ElementProps<E extends Element> = {
	[K in keyof E]: K[E]
}

export interface AssignElement<E extends Element = Element> {
	(props: ElementProps<E>, ...children: any[]): E
	(...children: any[]): E
}

type ElementProxy = {
	[K in AnyElementName]: AssignElement<AnyElement<K>>
}

export interface CreateElement extends ElementProxy {
	<T extends AnyElementName | AnyElement, E = T extends AnyElementName ? AnyElement<T> : T>(target: T, props: ElementProps<E>, ...children: any[]): E
	<T extends AnyElementName | AnyElement, E = T extends AnyElementName ? AnyElement<T> : T>(target: T, ...children: any[]): E
}

export type AnyString = string & Record<never, never>
