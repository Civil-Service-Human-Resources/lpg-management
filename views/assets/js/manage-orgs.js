var selectEl = document.querySelector('#organisationalUnit')
accessibleAutocomplete.enhanceSelectElement({
	selectElement: selectEl,
})

var queryStringParameters = window.location.search
var previouslySubmitted = queryStringParameters.length > 0
if (previouslySubmitted) {
	var submittedEl = document.querySelector('.submitted')
	submittedEl.classList.remove('submitted--hidden')
	var params = new URLSearchParams(document.location.search.split('?')[1])
	document.querySelector('.submitted__organisationalUnit').innerHTML = params.get('organisationalUnit')
}
