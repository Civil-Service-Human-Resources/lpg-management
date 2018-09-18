import {Course} from './model/course'
import {DefaultPageResults} from './model/defaultPageResults'
import {Module} from './model/module'
import {RestService} from './service/restService'
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

export class LearningCatalogue {
	private _eventService: EntityService<Event>
	private _moduleService: EntityService<Module>
	private _courseService: EntityService<Course>
	private _learningProviderService: EntityService<LearningProvider>
	private _cancellationPolicyService: EntityService<CancellationPolicy>
	private _termsAndConditionsService: EntityService<TermsAndConditions>
	private _restService: RestService

	constructor(config: LearningCatalogueConfig) {
		this._restService = new RestService(config)

		this._eventService = new EntityService<Event>(this._restService, new EventFactory())

		this._moduleService = new EntityService<Module>(
			this._restService,
			new ModuleFactory(new AudienceFactory(), new EventFactory())
		)

		this._courseService = new EntityService<Course>(this._restService, new CourseFactory())

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

	async listCourses(accessToken: string, page: number = 0, size: number = 10): Promise<DefaultPageResults<Course>> {
		return await this._courseService.listAll(`/courses?page=${page}&size=${size}`, accessToken)
	}

	async createCourse(course: Course, accessToken: string): Promise<Course> {
		return this._courseService.create('/courses/', course, accessToken)
	}

	async updateCourse(course: Course, accessToken: string): Promise<Course> {
		return this._courseService.update(`/courses/${course.id}`, course, accessToken)
	}

	async getCourse(courseId: string, accessToken: string): Promise<Course> {
		return this._courseService.get(`/courses/${courseId}`, accessToken)
	}

	async createModule(courseId: string, module: Module, accessToken: string): Promise<Module> {
		return this._moduleService.create(`/courses/${courseId}/modules/`, module, accessToken)
	}

	async getModule(courseId: string, moduleId: string, accessToken: string): Promise<Module> {
		return this._moduleService.get(`/courses/${courseId}/modules/${moduleId}`, accessToken)
	}

	async createEvent(courseId: string, moduleId: string, event: Event, accessToken: string): Promise<Event> {
		return this._eventService.create(`/courses/${courseId}/modules/${moduleId}/events`, event, accessToken)
	}

	async getEvent(courseId: string, moduleId: string, eventId: string, accessToken: string): Promise<Event> {
		return this._eventService.get(`/courses/${courseId}/modules/${moduleId}/events/${eventId}`, accessToken)
	}

	async updateEvent(
		courseId: string,
		moduleId: string,
		eventId: string,
		event: Event,
		accessToken: string
	): Promise<Event> {
		return this._eventService.update(
			`/courses/${courseId}/modules/${moduleId}/events/${eventId}`,
			event,
			accessToken
		)
	}

	async listLearningProviders(
		accessToken: string,
		page: number = 0,
		size: number = 10
	): Promise<DefaultPageResults<LearningProvider>> {
		return await this._learningProviderService.listAll(`/learning-providers?page=${page}&size=${size}`, accessToken)
	}

	async getLearningProvider(learningProviderId: string, accessToken: string): Promise<LearningProvider> {
		return this._learningProviderService.get(`/learning-providers/${learningProviderId}`, accessToken)
	}

	async createLearningProvider(learningProvider: LearningProvider, accessToken: string): Promise<LearningProvider> {
		return this._learningProviderService.create('/learning-providers/', learningProvider, accessToken)
	}

	async getCancellationPolicy(
		learningProviderId: string,
		cancellationPolicyId: string,
		accessToken: string
	): Promise<CancellationPolicy> {
		return this._cancellationPolicyService.get(
			`/learning-providers/${learningProviderId}/cancellation-policies/${cancellationPolicyId}`,
			accessToken
		)
	}

	async createCancellationPolicy(
		learningProviderId: string,
		cancellationPolicy: CancellationPolicy,
		accessToken: string
	): Promise<CancellationPolicy> {
		return this._cancellationPolicyService.create(
			`/learning-providers/${learningProviderId}/cancellation-policies`,
			cancellationPolicy,
			accessToken
		)
	}

	async updateCancellationPolicy(
		learningProviderId: string,
		cancellationPolicy: CancellationPolicy,
		accessToken: string
	): Promise<CancellationPolicy> {
		return this._cancellationPolicyService.update(
			`/learning-providers/${learningProviderId}/cancellation-policies/${cancellationPolicy.id}`,
			cancellationPolicy,
			accessToken
		)
	}

	async deleteCancellationPolicy(
		learningProviderId: string,
		cancellationPolicyId: string,
		accessToken: string
	): Promise<void> {
		return this._cancellationPolicyService.delete(
			`/learning-providers/${learningProviderId}/cancellation-policies/${cancellationPolicyId}`,
			accessToken
		)
	}

	async getTermsAndConditions(
		learningProviderId: string,
		termsAndConditionsId: string,
		accessToken: string
	): Promise<TermsAndConditions> {
		return this._termsAndConditionsService.get(
			`/learning-providers/${learningProviderId}/terms-and-conditions/${termsAndConditionsId}`,
			accessToken
		)
	}

	async createTermsAndConditions(
		learningProviderId: string,
		termsAndConditions: TermsAndConditions,
		accessToken: string
	): Promise<TermsAndConditions> {
		return this._termsAndConditionsService.create(
			`/learning-providers/${learningProviderId}/terms-and-conditions`,
			termsAndConditions,
			accessToken
		)
	}

	async updateTermsAndConditions(
		learningProviderId: string,
		termsAndConditions: TermsAndConditions,
		accessToken: string
	): Promise<TermsAndConditions> {
		return this._termsAndConditionsService.update(
			`/learning-providers/${learningProviderId}/terms-and-conditions/${termsAndConditions.id}`,
			termsAndConditions,
			accessToken
		)
	}

	async deleteTermsAndConditions(
		learningProviderId: string,
		termsAndConditionsId: string,
		accessToken: string
	): Promise<void> {
		return this._termsAndConditionsService.delete(
			`/learning-providers/${learningProviderId}/terms-and-conditions/${termsAndConditionsId}`,
			accessToken
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
