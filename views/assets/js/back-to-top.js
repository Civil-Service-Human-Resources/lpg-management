const construct = (elem) => {
	const $footer = document.querySelector('.govuk-footer')
	const $topCutoffElem = document.querySelector('.right-menu')

	// Check if we can use Intersection Observers
	if (!('IntersectionObserver' in window)) {
		// If there's no support fallback to regular behaviour
		// Since JavaScript is enabled we can remove the default hidden state
		elem.classList.remove('app-back-to-top--hidden')
		return this
	}

	if (!$footer || !$topCutoffElem) {
		return this
	}

	let footerIsIntersecting = false
	let topCutoffIsIntersecting = false
	let topCutoffIntersectionRatio = 0
	const observer = new window.IntersectionObserver((entries) => {
		// Find the elements we care about from the entries
		const footerEntry = entries.find((entry) => entry.target === $footer)
		const topCutoffEntry = entries.find((entry) => entry.target === $topCutoffElem)

		// If there is an entry this means the element has changed so lets check if it's intersecting.
		if (footerEntry) {
			footerIsIntersecting = footerEntry.isIntersecting
		}
		if (topCutoffEntry) {
			topCutoffIsIntersecting = topCutoffEntry.isIntersecting
			topCutoffIntersectionRatio = topCutoffEntry.intersectionRatio
		}

		// If the subnav or the footer not visible then fix the back to top link to follow the user
		if (topCutoffIsIntersecting || footerIsIntersecting) {
			elem.classList.remove('app-back-to-top--fixed')
		} else {
			elem.classList.add('app-back-to-top--fixed')
		}

		// If the subnav is visible but you can see it all at once, then a back to top link is likely not as useful.
		// We hide the link but make it focusable for screen readers users who might still find it useful.
		if (topCutoffIsIntersecting && topCutoffIntersectionRatio === 1) {
			elem.classList.add('app-back-to-top--hidden')
		} else {
			elem.classList.remove('app-back-to-top--hidden')
		}
	})

	observer.observe($footer)
	observer.observe($topCutoffElem)
}

const elem = document.querySelector('.app-back-to-top')
if (elem !== null) {
	construct(elem)
}

