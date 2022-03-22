export namespace Internal {
	export type Affordance = 'content' | 'disclosure' | 'tablist'

	export namespace Slotted {
		export type Label = Slotted
		export type Content = Slotted[]
	}

	export namespace Shadow {
		export type Contents = HTMLDivElement
		export type LabelSet = HTMLDivElement
		export type ContentSet = HTMLDivElement
		export type Section = HTMLDivElement
		export type Label = HTMLButtonElement
		export type LabelSlot = HTMLSlotElement
		export type Marker = SVGSVGElement
		export type NonLabel = HTMLDivElement
		export type Content = HTMLDivElement
		export type ContentSlot = HTMLSlotElement
	}

	export interface Section {
		index: number
		open: boolean

		slotted: {
			label: Slotted
			content: Slotted[]
		}

		shadow: {
			section: Shadow.Section
			label: Shadow.Label
			labelSlot: Shadow.LabelSlot
			marker: Shadow.Marker
			nonLabel: Shadow.NonLabel
			nonLabelSlot: Shadow.LabelSlot
			content: Shadow.Content
			contentSlot: Shadow.ContentSlot
		}

		prev: Section | null
		next: Section | null
	}
}

export type Slotted = Element | Text

export type Attrs<O extends object = object> = {
	[K in keyof O]: O[K]
}

export type Primitive = string | number | bigint | boolean | symbol | null | undefined
