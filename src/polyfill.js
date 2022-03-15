HTMLSlotElement.prototype.assign || (
	HTMLSlotElement.prototype.assign = function assign(...nodes) {
		for (let root = this.getRootNode(), i = 1; i < 256; ++i) {
			if (root.querySelector('slot[name="s' + i + '"]')) continue
			this.name = 's' + i
			break
		}
		for (const node of nodes) {
			if (node.slot !== undefined) {
				node.slot = this.name
			}
		}
	}
)
