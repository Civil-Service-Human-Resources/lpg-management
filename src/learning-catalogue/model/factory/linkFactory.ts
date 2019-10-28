import {LinkModule} from '../linkModule'

export class LinkFactory {
	create(data: any) {
		const linkModule = new LinkModule()

		linkModule.id = data.id
		linkModule.title = data.title
		linkModule.description = data.description
		linkModule.url = data.url
		linkModule.duration = data.duration
		linkModule.isOptional = data.isOptional
		linkModule.associatedLearning = data.associatedLearning
		return linkModule
	}
}
