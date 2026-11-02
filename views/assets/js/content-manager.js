const cssSelector = 'content-manager'
const selectAllCheckboxCssSelector = 'content-manager__select-all'
const checkboxCssSelector = 'content-manager__checkbox'
const removeTextCssSelector = 'content-manager__remove-text'

const selectAllLabelCssSelector = 'content-manager__select-all-label'
const selectedCountCssSelector = 'content-manager__selected-count'

class ContentManager {
	type
	selectAllCheckbox
	checkboxes
	selectAllText

	constructor(type, selectAllCheckbox, checkboxes, selectAllText, selectAllLabel, selectedCount) {
		this.type = type
		this.selectAllCheckbox = selectAllCheckbox
		this.checkboxes = checkboxes
		this.selectAllText = selectAllText
		this.selectAllLabel = selectAllLabel
		this.selectedCount = selectedCount

		selectAllCheckbox.addEventListener('change', () => {
			this.updateText()
		})

		for (let checkbox of checkboxes) {
			checkbox.addEventListener('change', () => {
				this.updateText()
			})
		}
		selectAllLabel.classList.add('govuk-visually-hidden')
		this.updateText()
	}

	updateText = () => {
		const boxesSelected = this.checkboxes.filter(c => c.checked).length
		let removeText = `Remove ${this.type}`
		let selectAllText = `Select all ${this.type}s`
		if (this.selectAllCheckbox.checked || boxesSelected > 1) {
			removeText = `Remove selected ${this.type}s`
			const numberSelected = this.selectAllCheckbox.checked ? this.checkboxes.length : boxesSelected
			selectAllText = `Selected ${numberSelected} of ${this.checkboxes.length} ${this.type}s`
		} else if (boxesSelected === 1) {
			removeText = `Remove selected ${this.type}`
			selectAllText = `Selected 1 of ${this.checkboxes.length} ${this.type}s`
		}
		this.selectAllText.innerText = removeText
		this.selectedCount.innerText = selectAllText
	}
}

for (let contentManagerElem of document.getElementsByClassName(cssSelector)) {
	const type = contentManagerElem.getAttribute('data-type')
	const selectAllCheckbox = document.getElementsByClassName(selectAllCheckboxCssSelector).item(0)
	const checkboxes = document.getElementsByClassName(checkboxCssSelector)
	const selectAllText = document.getElementsByClassName(removeTextCssSelector).item(0)
	const selectAllLabel = document.getElementsByClassName(selectAllLabelCssSelector).item(0)
	const selectedCount = document.getElementsByClassName(selectedCountCssSelector).item(0)
	if (!type || ! selectAllCheckbox || checkboxes.length === 0 || !selectAllText || !selectAllLabel || !selectedCount) continue

	new ContentManager(type, selectAllCheckbox, Array.from(checkboxes), selectAllText, selectAllLabel,
		selectedCount)

}
