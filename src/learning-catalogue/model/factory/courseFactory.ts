import {Course} from '../course'
import {ModuleFactory} from './moduleFactory'
import {EventFactory} from './eventFactory'
import {AudienceFactory} from './audienceFactory'

export class CourseFactory {
	private _moduleFactory: ModuleFactory

	constructor() {
		this._moduleFactory = new ModuleFactory(
			new AudienceFactory(),
			new EventFactory()
		)

		this.create = this.create.bind(this)
	}

	create(data: any) {
		const course: Course = new Course()

		course.id = data.id
		course.description = data.description
		course.learningOutcomes = data.learningOutcomes
		course.shortDescription = data.shortDescription
		course.title = data.title
		course.modules = (data.modules || []).map(
			this._moduleFactory.defaultCreate
		)

		return course
	}

	set moduleFactory(value: ModuleFactory) {
		this._moduleFactory = value
	}
}
