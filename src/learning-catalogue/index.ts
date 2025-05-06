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
import {Auth} from '../identity/auth'
import {OauthRestService} from '../lib/http/oauthRestService'
import {CslServiceClient} from '../csl-service/client'
import {CourseTypeAheadCache} from './courseTypeaheadCache'
import {BasicCourse, CourseTypeAhead} from './courseTypeAhead'
import {RestServiceConfig} from '../lib/http/restServiceConfig'
import {HttpException} from '../lib/exception/HttpException'
export class LearningCatalogue {
	private _eventService: EntityService<Event>
	private _moduleService: EntityService<Module>
	private _courseService: EntityService<Course>
	private _audienceService: EntityService<Audience>
	private _restService: OauthRestService
	private _cslService: CslServiceClient
	private courseTypeaheadCache: CourseTypeAheadCache

	constructor(config: RestServiceConfig, auth: Auth, cslService: CslServiceClient,
				courseTypeaheadCache: CourseTypeAheadCache) {
		this._restService = new OauthRestService(config, auth)

		this._eventService = new EntityService<Event>(this._restService, new EventFactory())

		this._moduleService = new EntityService<Module>(this._restService, new ModuleFactory())

		this._courseService = new EntityService<Course>(this._restService, new CourseFactory())

		this._audienceService = new EntityService<Audience>(this._restService, new AudienceFactory())

		this._cslService = cslService

		this.courseTypeaheadCache = courseTypeaheadCache
	}

	async listPublishedCourses(page: number = 0, size: number = 10): Promise<DefaultPageResults<Course>> {
		return await this._courseService.listAllWithPagination(`/courses?page=${page}&size=${size}&visibility=PRIVATE&visibility=PUBLIC&status=PUBLISHED`)
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
		let typeahead = await this.courseTypeaheadCache.getTypeahead()
		if (typeahead === undefined) {
			typeahead = await this.refreshTypeahead()
		}
		return typeahead
	}

	async fetchAllPublishedCourses(): Promise<Course[]> {
		const courses: Course[] = []
		const response = await this.listPublishedCourses(0, 1)
		if (response.totalResults >= 1) {
			const totalPages = Math.ceil(response.totalResults / 200)
			const requests: any[] = []
			for (let page = 0; page < totalPages; page++) {
				requests.push(this.listPublishedCourses(page, 200)
					.then((data) => {
						courses.push(...data.results)
					}))
			}
			await Promise.all(requests)
		}
		return courses
	}

	private async refreshTypeahead() {
		const courses = await this.fetchAllPublishedCourses()
		const typeahead = CourseTypeAhead.createAndSort(courses.map(c => new BasicCourse(c.id, c.title)))
		await this.courseTypeaheadCache.setTypeahead(typeahead)
		return typeahead
	}

	async createCourse(course: Course): Promise<Course> {
		course = await this._courseService.create('/courses/', course)
		let typeahead = await this.courseTypeaheadCache.getTypeahead()
		if (typeahead === undefined) {
			await this.refreshTypeahead()
		} else {
			typeahead.addCourse(course)
			await this.courseTypeaheadCache.setTypeahead(typeahead)
		}
		return course
	}

	async updateCourse(course: Course): Promise<void> {
		await this._cslService.clearCourseCache(course.id)
		await this._courseService.update(`/courses/${course.id}`, course)
		let typeahead = await this.courseTypeaheadCache.getTypeahead()
		if (typeahead === undefined) {
			await this.refreshTypeahead()
		} else {
			typeahead.updateCourse(course)
			await this.courseTypeaheadCache.setTypeahead(typeahead)
		}
	}

	async publishCourse(course: Course): Promise<Course> {
		await this._cslService.clearCourseCache(course.id)
		return this._courseService.update(`/courses/${course.id}/publish`, course)
	}

	async archiveCourse(course: Course): Promise<Course> {
		await this._cslService.clearCourseCache(course.id)
		await this._courseService.update(`/courses/${course.id}/archive`, course)
		let typeahead = await this.courseTypeaheadCache.getTypeahead()
		if (typeahead === undefined) {
			await this.refreshTypeahead()
		} else {
			typeahead.removeCourse(course.id)
			await this.courseTypeaheadCache.setTypeahead(typeahead)
		}
		return course
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

	async updateAudience(courseId: string, audience: Audience): Promise<Audience> {
		await this._cslService.clearCourseCache(courseId)
		return this._audienceService.update(`/courses/${courseId}/audiences/${audience.id}`, audience)
	}

	async deleteAudience(courseId: string, audienceId: string) {
		await this._cslService.clearCourseCache(courseId)
		return this._audienceService.delete(`/courses/${courseId}/audiences/${audienceId}`)
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
