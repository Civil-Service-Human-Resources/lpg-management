require('./expander')

let elements = document.querySelectorAll('.expander')
for (let i = 0; i < elements.length; i++) {
	let element = elements[i]
	new window.GOVUK.Modules.Expander(element).init()
}
