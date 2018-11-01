import {Course} from '../course'
import {ModuleFactory} from './moduleFactory'
import {AudienceFactory} from './audienceFactory'
import {LearningProviderFactory} from './learningProviderFactory'

export class CourseFactory {
	private _moduleFactory: ModuleFactory
	private audienceFactory: AudienceFactory
	private _learningProviderFactory: LearningProviderFactory

	constructor(
		audienceFactory = new AudienceFactory(),
		moduleFactory = new ModuleFactory(),
		learningProviderFactory = new LearningProviderFactory()
	) {
		this.audienceFactory = audienceFactory
		this._moduleFactory = moduleFactory
		this._learningProviderFactory = learningProviderFactory
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
		course.learningProvider = this._learningProviderFactory.create(data.learningProvider || {})
		return course
	}

	set moduleFactory(value: ModuleFactory) {
		this._moduleFactory = value
	}

	set learningProviderFactory(value: LearningProviderFactory) {
		this._learningProviderFactory = value
	}
}
