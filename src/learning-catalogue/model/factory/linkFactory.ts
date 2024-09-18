import {LinkModule} from '../linkModule'
const { xss } = require('xss')

export class LinkFactory {
	create(data: any) {
		const linkModule = new LinkModule()

		linkModule.id = data.id
		linkModule.title = xss(data.title)
		linkModule.description = xss(data.description)
		linkModule.url = data.url
		linkModule.duration = data.duration
		linkModule.isOptional = data.isOptional
		linkModule.associatedLearning = data.associatedLearning

		return linkModule
	}
}
