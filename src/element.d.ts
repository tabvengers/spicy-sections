export namespace Internals {
	export type H = {
		[K in keyof HTMLElementTagNameMap]: {
			(props: Record<string, any>, ...children: any[]): K extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[K] : HTMLElement
			(...children: any[]): K extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[K] : HTMLElement
		}
	} & {
		[K in string]: {
			(props: Record<string, any>, ...children: any[]): HTMLElement
			(...children: any[]): HTMLElement
		}
	}

	export interface Link {
		label: HTMLButtonElement
		panel: HTMLDivElement
		prev: Link | null
		next: Link | null
		all: Link[]
	}

	export interface Links {
		all: Link[]

		ref: WeakMap<EventTarget, Link>

		add(label: Link['label'], panel: Link['panel']): void

		get(target: EventTarget): Link

		toggleOne(target: EventTarget & HTMLElement): void
	}
}
