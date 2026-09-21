const cssSelector = 'content-manager'
const selectAllCheckboxCssSelector = 'content-manager__select-all'
const checkboxCssSelector = 'content-manager__checkbox'
const removeTextCssSelector = 'content-manager__remove-text'

class ContentManager {
	type
	selectAllCheckbox
	checkboxes
	selectAllText

	constructor(type, selectAllCheckbox, checkboxes, selectAllText) {
		this.type = type
		this.selectAllCheckbox = selectAllCheckbox
		this.checkboxes = checkboxes
		this.selectAllText = selectAllText

		selectAllCheckbox.addEventListener('change', () => {
			this.updateRemoveText()
		})

		for (let checkbox of checkboxes) {
			checkbox.addEventListener('change', () => {
				this.updateRemoveText()
			})
		}
		this.updateRemoveText()
	}

	updateRemoveText = () => {
		const boxesSelected = this.checkboxes.filter(c => c.checked).length
		let text = `Remove ${this.type}`
		if (this.selectAllCheckbox.checked || boxesSelected > 1) {
			text = `Remove selected ${this.type}s`
		} else if (boxesSelected === 1) {
			text = `Remove selected ${this.type}`
		}
		this.selectAllText.innerText = text
	}
}

for (let contentManagerElem of document.getElementsByClassName(cssSelector)) {
	const type = contentManagerElem.getAttribute('data-type')
	const selectAllCheckbox = document.getElementsByClassName(selectAllCheckboxCssSelector).item(0)
	const checkboxes = document.getElementsByClassName(checkboxCssSelector)
	const selectAllText = document.getElementsByClassName(removeTextCssSelector).item(0)
	if (!type || ! selectAllCheckbox || checkboxes.length === 0 || !selectAllText) continue

	new ContentManager(type, selectAllCheckbox, Array.from(checkboxes), selectAllText)

}
