const accessibleAutocomplete = require('accessible-autocomplete-multiselect')

function enhanceElement(elementId) {
	if (document.querySelector(`#${elementId}`) !== null) {
		accessibleAutocomplete.enhanceSelectElement({
			selectElement: document.querySelector(`#${elementId}`),
			id: elementId,
			multiple: true,
			showAllValues: true
		})
		const hint = document.getElementById("autocomplete-js-hint")
		if (hint) {
			hint.className = ""
		}
	}
}

enhanceElement('courseSearch')
enhanceElement('organisationSearch')
enhanceElement('tagSearch')