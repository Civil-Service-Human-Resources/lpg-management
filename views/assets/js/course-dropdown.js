const accessibleAutocomplete = require('./accessible-autocomplete-multiselect/accessible-autocomplete.min.js')

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