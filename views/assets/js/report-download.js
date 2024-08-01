// Progressively enhance the CSV report request functionality.
const jsonLocale = require('../../../src/locale/en.json').reporting.course_completions.report_download
const successMsg = jsonLocale.success_message
const errorMsg = jsonLocale.error_message

const generateResultParagraph = (success) => {
	const resultParagraph = document.createElement("p")
	resultParagraph.classList = "govuk-body"
	if (success) {
		resultParagraph.innerText = successMsg
	} else {
		resultParagraph.innerText = errorMsg
		resultParagraph.classList.add("govuk-error-message")
	}
	return resultParagraph
}


const elems = document.getElementsByClassName("course-completions-report")
if (successMsg !== undefined && errorMsg !== undefined) {
	for (const elem of elems) {
		const panel = document.getElementsByClassName("course-completions-report__panel")[0]
		const form = panel.getElementsByClassName("course-completions-report__form")[0]
		let button = panel.getElementsByClassName("course-completions-report__button")[0]
		if (button !== undefined) {
			const submitUrl = button.getAttribute('data-submiturl')
			form.remove()
			panel.appendChild(button)
			button.addEventListener("click", async (e) => {
				let success = false
				e.target.disabled = true
				try {
					const resp = await fetch(`${window.location.origin}${submitUrl}`, {
						method: 'POST'
					})
					success = resp.ok
				} catch (e) {
					console.log("Error submitting report request")
				}
				const resultParagraph = generateResultParagraph(success)
				button.remove()
				panel.appendChild(resultParagraph)
			})
		}
	}
}
