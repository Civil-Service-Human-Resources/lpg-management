import {Course} from '../course'
import {ModuleFactory} from './moduleFactory'
import {AudienceFactory} from './audienceFactory'
import {Visibility} from '../visibility'
import {plainToInstance} from 'class-transformer'
import {LearningProvider} from '../learningProvider'

export class CourseFactory {
	private _moduleFactory: ModuleFactory
	private audienceFactory: AudienceFactory

	constructor(audienceFactory = new AudienceFactory(), moduleFactory = new ModuleFactory()) {
		this.audienceFactory = audienceFactory
		this._moduleFactory = moduleFactory
		this.create = this.create.bind(this)
	}

	create(data: any) {
		const course = new Course()

		course.id = data.id
		course.description = data.description
		course.learningOutcomes = data.learningOutcomes
		course.preparation = data.preparation
		course.shortDescription = data.shortDescription
		course.title = data.title
		course.modules = (data.modules || []).map(this._moduleFactory.create)
		course.audiences = (data.audiences || []).map(this.audienceFactory.create)
		course.status = 'status' in data ? data.status : course.status
		course.learningProvider = plainToInstance(LearningProvider, data.learningProvider)
		course.visibility = Visibility[data.visibility as keyof typeof Visibility]
		course.topicId = data.topicId

		if (course.modules) {
			let duration = 0
			for (const module of course.modules) {
				if (module.duration) {
					duration += module.duration
				}
			}
			course.duration = duration
		}
		return course
	}

	set moduleFactory(value: ModuleFactory) {
		this._moduleFactory = value
	}

}
