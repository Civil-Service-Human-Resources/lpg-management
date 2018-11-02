import {Course} from './model/course'
import {DefaultPageResults} from './model/defaultPageResults'
import {Module} from './model/module'
import {LearningCatalogueConfig} from './learningCatalogueConfig'
import {LearningProvider} from './model/learningProvider'
import {CancellationPolicy} from './model/cancellationPolicy'
import {TermsAndConditions} from './model/termsAndConditions'
import {EntityService} from './service/entityService'
import {LearningProviderFactory} from './model/factory/learningProviderFactory'
import {CancellationPolicyFactory} from './model/factory/cancellationPolicyFactory'
import {TermsAndConditionsFactory} from './model/factory/termsAndConditionsFactory'
import {CourseFactory} from './model/factory/courseFactory'
import {ModuleFactory} from './model/factory/moduleFactory'
import {AudienceFactory} from './model/factory/audienceFactory'
import {EventFactory} from './model/factory/eventFactory'
import {Event} from './model/event'
import {Audience} from './model/audience'
import {Auth} from '../identity/auth'
import {OauthRestService} from '../lib/http/oauthRestService'

export class LearningCatalogue {
	private _eventService: EntityService<Event>
	private _moduleService: EntityService<Module>
	private _courseService: EntityService<Course>
	private _audienceService: EntityService<Audience>
	private _learningProviderService: EntityService<LearningProvider>
	private _cancellationPolicyService: EntityService<CancellationPolicy>
	private _termsAndConditionsService: EntityService<TermsAndConditions>
	private _restService: OauthRestService

	constructor(config: LearningCatalogueConfig, auth: Auth) {
		this._restService = new OauthRestService(config, auth)

		this._eventService = new EntityService<Event>(this._restService, new EventFactory())

		this._moduleService = new EntityService<Module>(this._restService, new ModuleFactory())

		this._courseService = new EntityService<Course>(this._restService, new CourseFactory())

		this._audienceService = new EntityService<Audience>(this._restService, new AudienceFactory())

		this._learningProviderService = new EntityService<LearningProvider>(
			this._restService,
			new LearningProviderFactory()
		)

		this._cancellationPolicyService = new EntityService<CancellationPolicy>(
			this._restService,
			new CancellationPolicyFactory()
		)

		this._termsAndConditionsService = new EntityService<TermsAndConditions>(
			this._restService,
			new TermsAndConditionsFactory()
		)
	}

	async listCourses(page: number = 0, size: number = 10): Promise<DefaultPageResults<Course>> {
		return await this._courseService.listAll(
			`/courses?status=Draft&status=Published&status=Archived&page=${page}&size=${size}`
		)
	}

	async createCourse(course: Course): Promise<Course> {
		return this._courseService.create('/courses/', course)
	}

	async updateCourse(course: Course): Promise<Course> {
		return this._courseService.update(`/courses/${course.id}`, course)
	}

	async getCourse(courseId: string): Promise<Course> {
		return this._courseService.get(`/courses/${courseId}`)
	}

	async createModule(courseId: string, module: Module): Promise<Module> {
		return this._moduleService.create(`/courses/${courseId}/modules/`, module)
	}

	async getModule(courseId: string, moduleId: string): Promise<Module> {
		return this._moduleService.get(`/courses/${courseId}/modules/${moduleId}`)
	}

	async updateModule(courseId: string, module: Module): Promise<Module> {
		return this._moduleService.update(`/courses/${courseId}/modules/${module.id}`, module)
	}

	async deleteModule(courseId: string, moduleId: string) {
		return this._moduleService.delete(`/courses/${courseId}/modules/${moduleId}`)
	}

	async createEvent(courseId: string, moduleId: string, event: Event): Promise<Event> {
		return this._eventService.create(`/courses/${courseId}/modules/${moduleId}/events`, event)
	}

	async getEvent(courseId: string, moduleId: string, eventId: string): Promise<Event> {
		return this._eventService.get(`/courses/${courseId}/modules/${moduleId}/events/${eventId}`)
	}

	async updateEvent(courseId: string, moduleId: string, eventId: string, event: Event): Promise<Event> {
		return this._eventService.update(`/courses/${courseId}/modules/${moduleId}/events/${eventId}`, event)
	}

	async createAudience(courseId: string, audience: Audience) {
		return this._audienceService.create(`/courses/${courseId}/audiences`, audience)
	}

	async getAudience(courseId: string, audienceId: string): Promise<Audience> {
		return this._audienceService.get(`/courses/${courseId}/audiences/${audienceId}`)
	}

	async deleteAudience(courseId: string, audienceId: string) {
		return this._audienceService.delete(`/courses/${courseId}/audiences/${audienceId}`)
	}

	async listLearningProviders(page: number = 0, size: number = 10): Promise<DefaultPageResults<LearningProvider>> {
		return await this._learningProviderService.listAll(`/learning-providers?page=${page}&size=${size}`)
	}

	async getLearningProvider(learningProviderId: string): Promise<LearningProvider> {
		return this._learningProviderService.get(`/learning-providers/${learningProviderId}`)
	}

	async createLearningProvider(learningProvider: LearningProvider): Promise<LearningProvider> {
		return this._learningProviderService.create('/learning-providers/', learningProvider)
	}

	async getCancellationPolicy(learningProviderId: string, cancellationPolicyId: string): Promise<CancellationPolicy> {
		return this._cancellationPolicyService.get(
			`/learning-providers/${learningProviderId}/cancellation-policies/${cancellationPolicyId}`
		)
	}

	async createCancellationPolicy(
		learningProviderId: string,
		cancellationPolicy: CancellationPolicy
	): Promise<CancellationPolicy> {
		return this._cancellationPolicyService.create(
			`/learning-providers/${learningProviderId}/cancellation-policies`,
			cancellationPolicy
		)
	}

	async updateCancellationPolicy(
		learningProviderId: string,
		cancellationPolicy: CancellationPolicy
	): Promise<CancellationPolicy> {
		return this._cancellationPolicyService.update(
			`/learning-providers/${learningProviderId}/cancellation-policies/${cancellationPolicy.id}`,
			cancellationPolicy
		)
	}

	async deleteCancellationPolicy(learningProviderId: string, cancellationPolicyId: string): Promise<void> {
		return this._cancellationPolicyService.delete(
			`/learning-providers/${learningProviderId}/cancellation-policies/${cancellationPolicyId}`
		)
	}

	async getTermsAndConditions(learningProviderId: string, termsAndConditionsId: string): Promise<TermsAndConditions> {
		return this._termsAndConditionsService.get(
			`/learning-providers/${learningProviderId}/terms-and-conditions/${termsAndConditionsId}`
		)
	}

	async createTermsAndConditions(
		learningProviderId: string,
		termsAndConditions: TermsAndConditions
	): Promise<TermsAndConditions> {
		return this._termsAndConditionsService.create(
			`/learning-providers/${learningProviderId}/terms-and-conditions`,
			termsAndConditions
		)
	}

	async updateTermsAndConditions(
		learningProviderId: string,
		termsAndConditions: TermsAndConditions
	): Promise<TermsAndConditions> {
		return this._termsAndConditionsService.update(
			`/learning-providers/${learningProviderId}/terms-and-conditions/${termsAndConditions.id}`,
			termsAndConditions
		)
	}

	async deleteTermsAndConditions(learningProviderId: string, termsAndConditionsId: string): Promise<void> {
		return this._termsAndConditionsService.delete(
			`/learning-providers/${learningProviderId}/terms-and-conditions/${termsAndConditionsId}`
		)
	}

	set courseService(value: EntityService<Course>) {
		this._courseService = value
	}

	set moduleService(value: EntityService<Module>) {
		this._moduleService = value
	}

	set learningProviderService(value: EntityService<LearningProvider>) {
		this._learningProviderService = value
	}

	set cancellationPolicyService(value: EntityService<CancellationPolicy>) {
		this._cancellationPolicyService = value
	}

	set termsAndConditionsService(value: EntityService<TermsAndConditions>) {
		this._termsAndConditionsService = value
	}
}
