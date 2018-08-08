import {Course} from './model/course'
import {DefaultPageResults} from './model/defaultPageResults'
import {CourseService} from './service/courseService'
import {ModuleService} from './service/moduleService'
import {Module} from './model/module'
import {RestService} from './service/restService'
import {LearningCatalogueConfig} from './learningCatalogueConfig'

export class LearningCatalogue {
	private _courseService: CourseService
	private _moduleService: ModuleService
	private _restService: RestService

	constructor(config: LearningCatalogueConfig) {
		this._restService = new RestService(config)
		this._courseService = new CourseService(this._restService)
		this._moduleService = new ModuleService(this._restService)
	}

	async listCourses(
		page: number = 0,
		size: number = 10
	): Promise<DefaultPageResults<Course>> {
		return await this._courseService.listAll(page, size)
	}

	async createCourse(course: Course): Promise<Course> {
		return this._courseService.create(course)
	}

	async getCourse(courseId: string): Promise<Course> {
		return this._courseService.get(courseId)
	}

	async updateCourse(course: Course): Promise<Course> {
		return this._courseService.update(course)
	}

	async createModule(courseId: string, module: Module): Promise<Module> {
		return this._moduleService.create(courseId, module)
	}

	async getModule(courseId: string, moduleId: string): Promise<Module> {
		return this._moduleService.get(courseId, moduleId)
	}

	set courseService(value: CourseService) {
		this._courseService = value
	}

	set moduleService(value: ModuleService) {
		this._moduleService = value
	}
}
