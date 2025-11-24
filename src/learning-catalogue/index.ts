import {Course} from './model/course'
import {DefaultPageResults} from './model/defaultPageResults'
import {Module} from './model/module'
import {EntityService} from './service/entityService'
import {CourseFactory} from './model/factory/courseFactory'
import {ModuleFactory} from './model/factory/moduleFactory'
import {AudienceFactory} from './model/factory/audienceFactory'
import {EventFactory} from './model/factory/eventFactory'
import {Event} from './model/event'
import {Audience} from './model/audience'
import {OauthRestService} from '../lib/http/oauthRestService'
import {CslServiceClient} from '../csl-service/client'
import {CourseTypeAheadCache} from './courseTypeaheadCache'
import {CourseTypeAhead} from './courseTypeAhead'
import {HttpException} from '../lib/exception/HttpException'
import {Status} from './model/status'
import { LearningCacheManager } from 'lib/learningCacheManager'

export class LearningCatalogue {
	private _eventService: EntityService<Event>
	private _moduleService: EntityService<Module>
	private _courseService: EntityService<Course>
	private _audienceService: EntityService<Audience>
	private _restService: OauthRestService
	private _cslService: CslServiceClient
	private courseTypeaheadCache: CourseTypeAheadCache
	private learningCacheManager: LearningCacheManager


	constructor(config: OauthRestService, cslService: CslServiceClient,
				courseTypeaheadCache: CourseTypeAheadCache, learningCacheManager: LearningCacheManager) {
		this._restService = config


		this._eventService = new EntityService<Event>(this._restService, new EventFactory())

		this._moduleService = new EntityService<Module>(this._restService, new ModuleFactory())

		this._courseService = new EntityService<Course>(this._restService, new CourseFactory())

		this._audienceService = new EntityService<Audience>(this._restService, new AudienceFactory())

		this._cslService = cslService

		this.courseTypeaheadCache = courseTypeaheadCache
		this.learningCacheManager = learningCacheManager
	}

	async listCourses(page: number = 0, size: number = 10): Promise<DefaultPageResults<Course>> {
		return await this._courseService.listAllWithPagination(`/courses/management?page=${page}&size=${size}&visibility=PRIVATE&visibility=PUBLIC`)
	}

	async searchCourses(query: string, page: number = 0, size: number = 10): Promise<DefaultPageResults<Course>> {
		return await this._courseService.listAllWithPagination(
			`/search/management/courses?status=DRAFT&status=PUBLISHED&status=ARCHIVED&query=${query}&page=${page}&size=${size}&visibility=PRIVATE&visibility=PUBLIC`
		)
	}

	async getCourseTypeAhead(): Promise<CourseTypeAhead> {
		return await this.courseTypeaheadCache.get()
	}

	async createCourse(course: Course): Promise<Course> {
		return await this._courseService.create('/courses/', course)
	}

	async updateCourse(course: Course): Promise<void> {
		await this._cslService.clearCourseCache(course.id)
		await this._courseService.update(`/courses/${course.id}`, course)
		await this.courseTypeaheadCache.updateCourse(course)
	}

	async publishCourse(course: Course): Promise<Course> {
		course.status = Status.PUBLISHED
		await this._cslService.clearCourseCache(course.id)
		await this.courseTypeaheadCache.addCourse(course)
		return this._courseService.update(`/courses/${course.id}`, course)
	}

	async archiveCourse(course: Course): Promise<Course> {
		course.status = Status.ARCHIVED
		await this._cslService.clearCourseCache(course.id)
		await this._courseService.update(`/courses/${course.id}`, course)
		await this.courseTypeaheadCache.removeCourse(course.id)
		return course
	}

	async unarchiveCourse(course: Course): Promise<Course> {
		course.status = Status.DRAFT
		return await this._courseService.update(`/courses/${course.id}`, course)
	}

	async getCourse(courseId: string, includeAvailability: boolean = false): Promise<Course|null> {
		try {
			return await this._courseService.get(`/courses/${courseId}?includeAvailability=${includeAvailability}`)
		} catch (e) {
			if (e instanceof HttpException && e.statusCode === 404) {
				return null
			}
			throw e
		}
	}

	async deleteCourse(courseId: string): Promise<void> {
		try{
			await this._courseService.delete(`/courses/${courseId}`)
			await this.courseTypeaheadCache.removeCourse(courseId)
		}
		catch (e) {
			if (e instanceof HttpException && e.statusCode === 407) {
				return
			}
			throw e
		}
	}

	async getRequiredLearning(departmentCodes: string[]): Promise<DefaultPageResults<Course>> {
		return await this._courseService.listAllWithPagination(`/courses?mandatory=true&department=${departmentCodes}`)
	}

	async createModule(courseId: string, module: Module): Promise<Module> {
		await this._cslService.clearCourseCache(courseId)
		return this._moduleService.create(`/courses/${courseId}/modules/`, module)
	}

	async getModule(courseId: string, moduleId: string): Promise<Module> {
		return this._moduleService.get(`/courses/${courseId}/modules/${moduleId}`)
	}

	async updateModule(courseId: string, module: Module): Promise<Module> {
		await this._cslService.clearCourseCache(courseId)
		return this._moduleService.update(`/courses/${courseId}/modules/${module.id}`, module)
	}

	async updateModuleOrder(courseId: string, modules: Module[]): Promise<void> {
		await this._cslService.clearCourseCache(courseId)
		await this._restService.putRequest({
			url: `/courses/${courseId}/modules`,
			data: modules
		})
	}

	async deleteModule(courseId: string, moduleId: string) {
		await this._cslService.clearCourseCache(courseId)
		return this._moduleService.delete(`/courses/${courseId}/modules/${moduleId}`)
	}

	async createEvent(courseId: string, moduleId: string, event: Event): Promise<Event> {
		await this._cslService.clearCourseCache(courseId)
		return this._eventService.create(`/courses/${courseId}/modules/${moduleId}/events`, event)
	}

	async updateEvent(courseId: string, moduleId: string, eventId: string, event: Event): Promise<Event> {
		await this._cslService.clearCourseCache(courseId)
		return this._eventService.update(`/courses/${courseId}/modules/${moduleId}/events/${eventId}`, event)
	}

	async createAudience(courseId: string, audience: Audience) {
		await this._cslService.clearCourseCache(courseId)
		return this._audienceService.create(`/courses/${courseId}/audiences`, audience)
	}

	async getAudience(courseId: string, audienceId: string): Promise<Audience> {
		return this._audienceService.get(`/courses/${courseId}/audiences/${audienceId}`)
	}

	async updateAudience(courseId: string, audience: Audience, options: UpdateAudienceOptions = {clearLearningCache: false}): Promise<Audience> {
		const updatedAudience = await this._audienceService.update(`/courses/${courseId}/audiences/${audience.id}`, audience)
		await this._cslService.clearCourseCache(courseId)
		if(options.clearLearningCache) {
			this.learningCacheManager.clearLearningCache()
		}
		return updatedAudience
	}

	async deleteAudience(courseId: string, audienceId: string) {
		const deletedAudience = await this._audienceService.delete(`/courses/${courseId}/audiences/${audienceId}`)
		await this._cslService.clearCourseCache(courseId)
		return deletedAudience
	}

	set courseService(value: EntityService<Course>) {
		this._courseService = value
	}

	set moduleService(value: EntityService<Module>) {
		this._moduleService = value
	}

	set eventService(value: EntityService<Event>) {
		this._eventService = value
	}

	set audienceService(value: EntityService<Audience>) {
		this._audienceService = value
	}

}

interface UpdateAudienceOptions {
	clearLearningCache?: boolean
}