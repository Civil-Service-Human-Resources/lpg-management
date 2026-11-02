let searchFilterClass = 'search-filters'
let searchFilterPanelClass = `${searchFilterClass}__panel`
let searchFilterPanelShutClass = `${searchFilterPanelClass}--shut`
let searchFilterToggleClass = `${searchFilterClass}__toggle`
let showSearchFilter = 'Show search filters'
let hideSearchFilter = 'Hide search filters'

let filterToggles = document.getElementsByClassName(searchFilterClass)
function close(toggle, button) {
	toggle.classList.add(searchFilterPanelShutClass)
	button.setAttribute('aria-expanded', 'false')
	button.setAttribute('aria-label', showSearchFilter)
	button.innerText = showSearchFilter
}
function open(toggle, button) {
	toggle.classList.remove(searchFilterPanelShutClass)
	button.setAttribute('aria-expanded', 'true')
	button.setAttribute('aria-label', hideSearchFilter)
	button.innerText = hideSearchFilter
}
for (let i = 0; i < filterToggles.length; i++) {
	let filterToggle = filterToggles[i]
	let filterToggleBtn = filterToggle.getElementsByClassName(searchFilterToggleClass)[0]
	let filterTogglePanel = filterToggle.getElementsByClassName(searchFilterPanelClass)[0]
	if (filterToggleBtn) {
		filterToggleBtn.addEventListener('click', function (e) {
			e.preventDefault()
			let closed =
				filterTogglePanel.classList.contains(searchFilterPanelShutClass) &&
				filterToggleBtn.getAttribute('aria-expanded') === 'false'
			if (closed) {
				open(filterTogglePanel, filterToggleBtn)
			} else {
				close(filterTogglePanel, filterToggleBtn)
			}
		})
		close(filterTogglePanel, filterToggleBtn)
	}
}
