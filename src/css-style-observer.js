// @ts-check
// 695 bytes minified, 397 bytes gzipped

export class CSSStyleRecord {
	constructor(
		/** @type {{ target: HTMLElement, propertyName: string, oldValue: string, newValue: string }} */
		init
	) {
		/** @type {{ target: HTMLElement, propertyName: string, oldValue: string, newValue: string }} */
		this
		Object.assign(this, init)
	}
}

export class CSSStyleObserver {
	#read = () => {
		this.#frameId = requestAnimationFrame(this.#emit)

		/** @type {string} */
		let propertyName

		/** @type {string} */
		let oldValue

		/** @type {string} */
		let newValue

		for (let [ target, [ cache, style ] ] of this.#observed) {
			for (propertyName in cache) {
				oldValue = cache[propertyName]
				newValue = cache[propertyName] = style.getPropertyValue(propertyName)

				if (oldValue !== newValue) {
					this.#records.push(new CSSStyleRecord({
						target,
						propertyName,
						oldValue,
						newValue,
					}))
				}
			}
		}
	}

	#emit = () => {
		this.#frameId = requestAnimationFrame(this.#read)

		if (this.#records.length) {
			this.#callback(this.#records.splice(0))
		}
	}

	#frameId = 0

	/** @type {CSSStyleRecord[]} */
	#records = []

	/** @type {Map<HTMLElement, [ Record<string, string>, CSSStyleDeclaration ]>} */
	#observed = new Map()

	/** @type {CSSStyleObserverCallback} */ 
	#callback

	constructor(/** @type {CSSStyleObserverCallback} */ callback) {
		this.#callback = callback
	}

	observe(/** @type {HTMLElement} */ element, /** @type {string[]} */ ...propertyNames) {
		let cache = this.#observed.get(element)?.[0]

		/** @type {string} */
		let propertyName

		if (!cache) {
			this.#observed.set(element, [ cache = {}, getComputedStyle(element) ])
		}

		for (propertyName of propertyNames) {
			cache[propertyName] = ''
		}

		if (this.#frameId === 0) {
			this.#read()
		}
	}

	unobserve(/** @type {HTMLElement} */ element) {
		if (this.#observed.delete(element) && this.#observed.size === 0) {
			this.disconnect()
		}
	}

	disconnect() {
		cancelAnimationFrame(this.#frameId)

		this.#frameId = 0
	}
}

/** @typedef {{ (records: CSSStyleRecord[]): void }} CSSStyleObserverCallback */
