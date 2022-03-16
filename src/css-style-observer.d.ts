export class CSSStyleRecord {
	target: HTMLElement
	propertyName: string
	oldValue: string
	newValue: string

	constructor(init: { target: HTMLElement, propertyName: string, oldValue: string, newValue: string })
}

export class CSSStyleObserver {
	constructor(callback: CSSStyleObserverCallback)

	observe(element: HTMLElement, ...propertyNames: string[]): void

	unobserve(element: HTMLElement): void

	disconnect(): void
}

export interface CSSStyleObserverCallback {
	(records: CSSStyleRecord[]): void
}
