import {EventFactory} from './eventFactory'
import {FaceToFaceModule} from '../faceToFaceModule'
import {VideoModule} from '../videoModule'
import {LinkModule} from '../linkModule'
import {FileModule} from '../fileModule'
import {ELearningModule} from '../eLearningModule'
import {Module} from '../module'
import {Event} from '../event'
import {DateTime} from '../../../lib/dateTime'
import _ = require('lodash')

export class ModuleFactory {
	private eventFactory: EventFactory

	constructor(eventFactory: EventFactory = new EventFactory()) {
		this.eventFactory = eventFactory

		this.create = this.create.bind(this)
	}

	// prettier-ignore
	private static defaultCreate(module: VideoModule | LinkModule | FileModule | FaceToFaceModule | ELearningModule, data: any) {
		module.id = data.id
		module.type = data.type
		module.title = data.title
		module.description = data.description
		module.duration = data.duration
		module.cost = !isNaN(Number(data.cost)) ? Number(data.cost) : data.cost
		module.optional = data.optional
		module.formattedDuration = DateTime.formatDuration(module.duration)

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
			const module = <VideoModule>ModuleFactory.defaultCreate(new VideoModule(), data)
			module.url = data.url
			module.associatedLearning = data.associatedLearning

			if (data.url) {
				module.subtype = !data.url.search(/http(.+)youtube(.*)/i) ? VideoModule.Subtype.YOUTUBE : VideoModule.Subtype.MP4
			}
			return module
		},
		link: (data: any) => {
			const module = <LinkModule>ModuleFactory.defaultCreate(new LinkModule(), data)
			module.description = data.description
			module.duration = data.duration
			module.id = data.id
			module.isOptional = data.isOptional
			module.associatedLearning = data.associatedLearning
			module.title = data.title
			module.url = data.url
			return module
		},
		file: (data: any) => {
			const module = <FileModule>ModuleFactory.defaultCreate(new FileModule(), data)
			module.fileSize = data.fileSize
			module.mediaId = data.mediaId
			module.url = data.url
			module.associatedLearning = data.associatedLearning
			return module
		},
		'face-to-face': (data: any) => {
			const module = <FaceToFaceModule>ModuleFactory.defaultCreate(new FaceToFaceModule(), data)
			module.events = (data.events || []).map(this.eventFactory.create)
			module.productCode = data.productCode

			// prettier-ignore
			module.events.sort((event1: Event, event2: Event) => {
				return !event1.dateRanges[0] ? 1 : !event2.dateRanges[0] ? -1 : DateTime.sortDateRanges(event1.dateRanges[0], event2.dateRanges[0])
			})

			/*
			 * Using the duration of first event in a face-to-face module to represent module duration
			 * This assumes that all events are roughly the same duration and
			 * therefore selecting the first event duration should be representative of the over module duration.
			 */
			const events = _.get(module, 'events', [])
			if (events && events[0]) {
				const event = events[0]

				module.duration = 0
				module.duration += event.getDuration()
				module.formattedDuration = DateTime.formatDuration(module.duration)
			}

			return module
		},
		elearning: (data: any) => {
			const module = <ELearningModule>ModuleFactory.defaultCreate(new ELearningModule(), data)
			module.startPage = data.startPage
			module.mediaId = data.mediaId
			module.url = data.url
			module.associatedLearning = data.associatedLearning
			return module
		},
	}
}
