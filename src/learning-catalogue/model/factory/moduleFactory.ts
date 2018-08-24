import {AudienceFactory} from './audienceFactory'
import {EventFactory} from './eventFactory'
import {FaceToFaceModule} from '../faceToFaceModule'
import {VideoModule} from '../videoModule'
import {BlogModule} from '../blogModule'
import {FileModule} from '../fileModule'
import {ELearningModule} from '../eLearningModule'

export class ModuleFactory {
	private audienceFactory: AudienceFactory
	private eventFactory: EventFactory

	constructor(audienceFactory: AudienceFactory, eventFactory: EventFactory) {
		this.audienceFactory = audienceFactory
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

		module.audiences = (data.audiences || []).map(this.audienceFactory.create)

		return module
	}

	public create(data: any) {
		if (this.createMethods.hasOwnProperty(data.type)) {
			return this.createMethods[data.type](data)
		} else {
			throw new Error(`Unknown module type: ${data.type} ${JSON.stringify(data)}`)
		}
	}

	private createMethods: {[key: string]: any} = {
		video: (data: any) => {
			const module = this.defaultCreate(new VideoModule(), data)
			module.location = data.location
			return module
		},
		blog: (data: any) => {
			const module = this.defaultCreate(new BlogModule(), data)
			module.location = data.location
			return module
		},
		file: (data: any) => {
			const module = this.defaultCreate(new FileModule(), data)
			module.url = data.url
			module.fileSize = data.fileSize
			return module
		},

		'face-to-face': (data: any) => {
			const module = this.defaultCreate(new FaceToFaceModule(), data)
			module.events = (data.events || []).map(this.eventFactory.create)
			module.productCode = data.productCode

			return module
		},
		elearning: (data: any) => {
			const module = this.defaultCreate(new ELearningModule(), data)
			module.startPage = data.startPage
			return module
		},
	}
}
