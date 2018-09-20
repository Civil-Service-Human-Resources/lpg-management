var orgList = document.currentScript.getAttribute('orgs')
var orgArray = orgList.split(',')
accessibleAutocomplete({
	element: document.querySelector('#autocomplete-container'),
	id: 'autocomplete',
	source: orgArray,
})
