const copyLinkContainerClass = 'copy-link'
const copyLinkButtonClass = `${copyLinkContainerClass}__button`
const copyLinkLinkClass = `${copyLinkContainerClass}__link`
const copyLinkNotificationClass = `${copyLinkContainerClass}__notification`

const containers = document.getElementsByClassName(copyLinkContainerClass)
for (let i = 0; i < containers.length; i++) {
	const container = containers[i]
	const button = container.querySelector(`.${copyLinkButtonClass}`)
	const link = container.querySelector(`.${copyLinkLinkClass}`)
	const notification = container.querySelector(`.${copyLinkNotificationClass}`)
	if (![button, link, notification].includes(null)) {
		button.addEventListener('click', (e) => {
			notification.innerHTML = ''
			navigator.clipboard.writeText(link.getAttribute('value')).then(() => {
				notification.innerHTML = 'Link copied to clipboard'
			})
		})
	}
}
