const accessibleAutocomplete = require('accessible-autocomplete-multiselect')

if (document.querySelector('#courseSearch') !== null) {
	accessibleAutocomplete.enhanceSelectElement({
		selectElement: document.querySelector('#courseSearch'),
		id: 'courseSearch',
		multiple: true,
		showAllValues: true
	})
}
