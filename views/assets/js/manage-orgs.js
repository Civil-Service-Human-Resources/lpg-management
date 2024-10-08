const accessibleAutocomplete = require('./accessible-autocomplete.min')

var selectEl = document.querySelector('#parent')
if (selectEl !== null) {
	accessibleAutocomplete.enhanceSelectElement({
		selectElement: selectEl,
	})
}

var queryStringParameters = window.location.search
var previouslySubmitted = queryStringParameters.length > 0
var submittedEl = document.querySelector('.submitted')
if (previouslySubmitted && submittedEl !== null) {
	submittedEl.classList.remove('submitted--hidden')
	var params = new URLSearchParams(document.location.search.split('?')[1])
	document.querySelector('.submitted__parent').innerHTML = params.get('parent')
}
