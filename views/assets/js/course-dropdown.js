const accessibleAutocomplete = require('accessible-autocomplete')

if (document.querySelector('#courseSearch') !== null) {
	accessibleAutocomplete.enhanceSelectElement({
		selectElement: document.querySelector('#courseSearch'),
		id: 'courseSearch',
		multiple: true,
		showAllValues: true
	})
}
