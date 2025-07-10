const accessibleAutocomplete = require('accessible-autocomplete-multiselect')

function enhanceElement(elementId) {
	if (document.querySelector(`#${elementId}`) !== null) {
		accessibleAutocomplete.enhanceSelectElement({
			selectElement: document.querySelector(`#${elementId}`),
			id: elementId,
			multiple: true,
			showAllValues: true
		})
	}
}

enhanceElement('courseSearch')
enhanceElement('organisationSearch')