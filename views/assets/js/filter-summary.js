/**
 * Progressive enhancement for the filter tag widget.
 *
 * This allows submitting 'dismissible' elements without altering the querystring
 * @type {HTMLCollectionOf<Element>}
 */

function createHiddenTag(name, value) {
	const hiddenTag = document.createElement("input")
	hiddenTag.setAttribute("name", name)
	hiddenTag.setAttribute("value", value)
	hiddenTag.setAttribute("type", "hidden")
	return hiddenTag
}

function getRemovableValueFromSubmit(submitButton) {
	let formAction = submitButton.getAttribute('formaction')
	const splitFormAction = formAction.split("?remove=")
	return {
		formAction: splitFormAction[0],
		remove: splitFormAction[1]
	}
}

const dismissibleFilterTags = document.getElementsByClassName('filter-summary__tag--dismiss')
for (const filterTag of dismissibleFilterTags) {
	const submitBUttons = filterTag.getElementsByTagName('button')
	if (submitBUttons.length > 0) {
		const submitButton = submitBUttons[0]
		const formAction = getRemovableValueFromSubmit(submitButton)
		submitButton.setAttribute("formAction", formAction.formAction)
		submitButton.addEventListener("click", (e) => {
			const hiddenTag = createHiddenTag("remove", formAction.remove)
			filterTag.appendChild(hiddenTag)
		})
	}
}
