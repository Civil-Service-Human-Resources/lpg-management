import {Course} from './model/course'
import {DefaultPageResults} from './model/defaultPageResults'
import {CourseService} from './service/courseService'
import {ModuleService} from './service/moduleService'
import {Module} from './model/module'
import {RestService} from './service/restService'
import {LearningCatalogueConfig} from './learningCatalogueConfig'
import {LearningProvider} from './model/learningProvider'
import {LearningProviderService} from './service/learningProviderService'

export class LearningCatalogue {
	private _courseService: CourseService
	private _moduleService: ModuleService
	private _learningProviderService: LearningProviderService
	private _restService: RestService

	constructor(config: LearningCatalogueConfig) {
		this._restService = new RestService(config)
		this._courseService = new CourseService(this._restService)
		this._moduleService = new ModuleService(this._restService)
		this._learningProviderService = new LearningProviderService(this._restService)
	}

	async listCourses(page: number = 0, size: number = 10): Promise<DefaultPageResults<Course>> {
		return await this._courseService.listAll(page, size)
	}

	async createCourse(course: Course): Promise<Course> {
		return this._courseService.create(course)
	}

	async getCourse(courseId: string): Promise<Course> {
		return this._courseService.get(courseId)
	}

	async createModule(courseId: string, module: Module): Promise<Module> {
		return this._moduleService.create(courseId, module)
	}

	async getModule(courseId: string, moduleId: string): Promise<Module> {
		return this._moduleService.get(courseId, moduleId)
	}

	async getLearningProvider(learningProviderId: string): Promise<LearningProvider> {
		return this._learningProviderService.get(learningProviderId)
	}

	async listLearningProviders(page: number = 0, size: number = 10): Promise<DefaultPageResults<LearningProvider>> {
		return await this._learningProviderService.listAll(page, size)
	}

	async createLearningProvider(learningProvider: LearningProvider): Promise<LearningProvider> {
		return this._learningProviderService.create(learningProvider)
	}

	set courseService(value: CourseService) {
		this._courseService = value
	}

	set moduleService(value: ModuleService) {
		this._moduleService = value
	}
}
