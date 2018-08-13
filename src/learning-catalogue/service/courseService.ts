import {Course} from '../model/course'
import {CourseFactory} from '../model/factory/courseFactory'
import {DefaultPageResults} from '../model/defaultPageResults'
import {RestService} from './restService'

export class CourseService {
	private _restService: RestService
	private _courseFactory: CourseFactory

	constructor(restService: RestService) {
		this._restService = restService
		this._courseFactory = new CourseFactory()
	}

	async listAll(page: number = 0, size: number = 10): Promise<DefaultPageResults<Course>> {
		const data = await this._restService.get(`/courses?page=${page}&size=${size}`)

		data.results = (data.results || []).map(this._courseFactory.create)

		const coursePageResults: DefaultPageResults<Course> = new DefaultPageResults()

		coursePageResults.size = data.size
		coursePageResults.results = data.results
		coursePageResults.page = data.page
		coursePageResults.totalResults = data.totalResults

		return coursePageResults
	}

	async create(course: Course): Promise<Course> {
		const data = await this._restService.post('/courses/', course)
		return this._courseFactory.create(data)
	}

	async get(courseId: string): Promise<Course> {
		const data = await this._restService.get(`/courses/${courseId}`)

		return this._courseFactory.create(data)
	}

	async update(course: Course): Promise<Course> {
		const data = await this._restService.put(`/courses/${course.id}`, course)

		return this._courseFactory.create(data)
	}

	set courseFactory(value: CourseFactory) {
		this._courseFactory = value
	}
}
