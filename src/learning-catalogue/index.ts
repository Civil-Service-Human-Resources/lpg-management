import {AxiosInstance} from 'axios'
import {Course} from './model/course'
import {CourseFactory} from './model/factory/courseFactory'
import {LearningCatalogueConfig} from './learningCatalogueConfig'
import {DefaultPageResults} from './model/defaultPageResults'

export class LearningCatalogue {
	private _http: AxiosInstance
	private _config: LearningCatalogueConfig
	private _courseFactory: CourseFactory

	constructor(http: AxiosInstance, config: LearningCatalogueConfig) {
		this._http = http
		this._config = config
		this._courseFactory = new CourseFactory()
	}

	async listAll(
		page: number = 0,
		size: number = 10
	): Promise<DefaultPageResults<Course>> {
		try {
			const response = await this._http.get(
				`${this._config.url}/courses?page=${page}&size=${size}`,
				{
					auth: {
						username: this._config.username,
						password: this._config.password,
					},
				}
			)

			response.data.results = (response.data.results || []).map(
				this._courseFactory.create
			)

			// prettier-ignore
			const coursePageResults: DefaultPageResults<Course> = new DefaultPageResults()

			coursePageResults.size = size
			coursePageResults.results = response.data.results
			coursePageResults.page = page
			coursePageResults.totalResults = response.data.totalResults

			return coursePageResults
		} catch (e) {
			throw new Error(`Error listing all courses - ${e}`)
		}
	}

	async create(course: Course): Promise<Course> {
		try {
			const response = await this._http.post(
				`${this._config.url}/courses/`,
				course,
				{
					auth: {
						username: this._config.username,
						password: this._config.password,
					},
				}
			)

			const location = response.headers.location
			const courseId = location.substr(location.lastIndexOf('/') + 1)

			return this.get(courseId)
		} catch (e) {
			throw new Error(`Error creating course: ${e}`)
		}
	}

	async update(course: Course): Promise<Course> {
		try{
			await this._http.put(
				`${this._config.url}/courses/${course.id}`,
				course,
                {
                    auth: {
                        username: this._config.username,
                        password: this._config.password,
                    },
                }
			)

            return this.get(course.id);
		} catch(e) {
		    throw new Error(`Error updating course: ${e}`)
        }
	}

	async get(courseId: string): Promise<Course> {
		try {
			const response = await this._http.get(
				`${this._config.url}/courses/${courseId}`,
				{
					auth: {
						username: this._config.username,
						password: this._config.password,
					},
				}
			)

			return this._courseFactory.create(response.data)
		} catch (e) {
			throw new Error(`Error retrieving course: ${e}`)
		}
	}

	set courseFactory(value: CourseFactory) {
		this._courseFactory = value
	}
}
