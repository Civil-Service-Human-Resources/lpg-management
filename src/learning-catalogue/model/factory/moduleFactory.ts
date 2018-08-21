import {AudienceFactory} from './audienceFactory'
import {EventFactory} from './eventFactory'
import {FaceToFaceModule} from '../faceToFaceModule'
import {VideoModule} from '../videoModule'
import {LinkModule} from '../linkModule'
import {FileModule} from '../fileModule'
import {ELearningModule} from '../eLearningModule'

export class ModuleFactory {
	private audienceFactory: AudienceFactory
	private eventFactory: EventFactory

	constructor(audienceFactory: AudienceFactory, eventFactory: EventFactory) {
		this.audienceFactory = audienceFactory
		this.eventFactory = eventFactory

		this.defaultCreate = this.defaultCreate.bind(this)
	}

	public async defaultCreate(module: any, data: any) {
		module.id = data.id
		module.type = data.type
		module.title = data.title
		module.description = data.description
		module.duration = data.duration
		module.price = data.price
		module.location = data.location
		module.optional = data.optional
		module.audiences = (data.audiences || []).map(this.audienceFactory.create)

		return module
	}

	public async create(data: any) {
		if (this.createMethods.hasOwnProperty(data.type)) {
			return this.createMethods[data.type](data)
		} else {
			throw new Error(`Unknown module type: ${data.type} ${JSON.stringify(data)}`)
		}
	}

	private createMethods: {[key: string]: any} = {
		video: async (data: any) => {
			const module = await this.defaultCreate(new VideoModule(), data)
			module.location = data.location
			return module
		},
		link: async (data: any) => {
			const module = await this.defaultCreate(new LinkModule(), data)
			module.location = data.location
			return module
		},
		file: async (data: any) => {
			const module = await this.defaultCreate(new FileModule(), data)
			module.url = data.url
			module.fileSize = data.fileSize
			return module
		},
		'face-to-face': async (data: any) => {
			const module = await this.defaultCreate(new FaceToFaceModule(), data)
			module.events = (data.events || []).map(this.eventFactory.create)
			module.productCode = data.productCode

			return module
		},
		elearning: async (data: any) => {
			const module = await this.defaultCreate(new ELearningModule(), data)
			module.startPage = data.startPage
			return module
		},
	}
}
