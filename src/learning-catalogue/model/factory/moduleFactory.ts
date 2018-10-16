import {EventFactory} from './eventFactory'
import {FaceToFaceModule} from '../faceToFaceModule'
import {VideoModule} from '../videoModule'
import {LinkModule} from '../linkModule'
import {FileModule} from '../fileModule'
import {ELearningModule} from '../eLearningModule'
import {Module} from '../module'
import {Event} from '../event'
import {DateTime} from '../../../lib/DateTime'

export class ModuleFactory {
	private eventFactory: EventFactory

	constructor(eventFactory: EventFactory = new EventFactory()) {
		this.eventFactory = eventFactory

		this.defaultCreate = this.defaultCreate.bind(this)
		this.create = this.create.bind(this)
	}

	public defaultCreate(module: any, data: any) {
		module.id = data.id
		module.type = data.type
		module.title = data.title
		module.description = data.description
		module.duration = data.duration
		module.price = data.price
		module.optional = data.optional

		return module
	}

	public create(data: any) {
		if (this.createMethods.hasOwnProperty(data.type)) {
			return (this.createMethods as any)[data.type](data)
		} else {
			throw new Error(`Unknown module type: ${data.type} ${JSON.stringify(data)}`)
		}
	}

	private createMethods: {[key in Module.Type]: any} = {
		video: (data: any) => {
			const module = this.defaultCreate(new VideoModule(), data)
			module.location = data.location
			module.url = data.url
			return module
		},
		link: (data: any) => {
			const module = this.defaultCreate(new LinkModule(), data)
			module.id = data.id
			module.title = data.title
			module.description = data.description
			module.url = data.url
			module.duration = data.duration
			module.isOptional = data.isOptional

			return module
		},
		file: (data: any) => {
			const module = this.defaultCreate(new FileModule(), data)
			module.url = data.url
			module.mediaId = data.mediaId
			module.fileSize = data.fileSize
			return module
		},
		'face-to-face': (data: any) => {
			const module = this.defaultCreate(new FaceToFaceModule(), data)
			module.events = (data.events || []).map(this.eventFactory.create)
			module.productCode = data.productCode

			module.events.sort((event1: Event, event2: Event) => {
				if (!event1.dateRanges[0]) {
					return 1
				} else if (!event2.dateRanges[0]) {
					return -1
				} else {
					return DateTime.sortDateRanges(event1.dateRanges[0], event2.dateRanges[0])
				}
			})

			return module
		},
		elearning: (data: any) => {
			const module = this.defaultCreate(new ELearningModule(), data)
			module.startPage = data.startPage
			module.url = data.url
			return module
		},
	}
}
