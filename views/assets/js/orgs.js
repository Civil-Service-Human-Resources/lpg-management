var orgList = document.currentScript.getAttribute('myList')
var orgArray = orgList.split(',')
accessibleAutocomplete({
	element: document.querySelector('#autocomplete-container'),
	id: 'autocomplete',
	source: orgArray,
})
