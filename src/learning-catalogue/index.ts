import {Course} from './model/course'
import {DefaultPageResults} from './model/defaultPageResults'
import {CourseService} from './service/courseService'
import {ModuleService} from './service/moduleService'
import {Module} from './model/module'
import {RestService} from './service/restService'
import {LearningCatalogueConfig} from './learningCatalogueConfig'
import {LearningProvider} from './model/learningProvider'
import {LearningProviderService} from './service/learningProviderService'
import {CancellationPolicy} from './model/cancellationPolicy'
import {CancellationPolicyService} from './service/cancellationPolicyService'
import {TermsAndConditions} from './model/termsAndConditions'
import {TermsAndConditionsService} from './service/termsAndConditionsService'

export class LearningCatalogue {
	private _courseService: CourseService
	private _moduleService: ModuleService
	private _learningProviderService: LearningProviderService
	private _cancellationPolicyService: CancellationPolicyService
	private _termsAndConditionsService: TermsAndConditionsService
	private _restService: RestService

	constructor(config: LearningCatalogueConfig) {
		this._restService = new RestService(config)
		this._courseService = new CourseService(this._restService)
		this._moduleService = new ModuleService(this._restService)
		this._learningProviderService = new LearningProviderService(this._restService)
		this._cancellationPolicyService = new CancellationPolicyService(this._restService)
		this._termsAndConditionsService = new TermsAndConditionsService(this._restService)
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

	async getCancellationPolicy(learningProviderId: string, cancellationPolicyId: string): Promise<CancellationPolicy> {
		return this._cancellationPolicyService.get(learningProviderId, cancellationPolicyId)
	}

	async createCancellationPolicy(
		learningProviderId: string,
		cancellationPolicy: CancellationPolicy
	): Promise<CancellationPolicy> {
		return this._cancellationPolicyService.create(learningProviderId, cancellationPolicy)
	}

	async updateCancellationPolicy(
		learningProviderId: string,
		cancellationPolicyId: string,
		cancellationPolicy: CancellationPolicy
	) {
		return this._cancellationPolicyService.update(learningProviderId, cancellationPolicyId, cancellationPolicy)
	}

	async deleteCancellationPolicy(learningProviderId: string, cancellationPolicyId: string) {
		return this._cancellationPolicyService.delete(learningProviderId, cancellationPolicyId)
	}

	async getTermsAndConditions(learningProviderId: string, termsAndConditionsId: string): Promise<TermsAndConditions> {
		return this._termsAndConditionsService.get(learningProviderId, termsAndConditionsId)
	}

	async createTermsAndConditions(
		learningProviderId: string,
		termsAndConditions: TermsAndConditions
	): Promise<TermsAndConditions> {
		return this._termsAndConditionsService.create(learningProviderId, termsAndConditions)
	}

	set courseService(value: CourseService) {
		this._courseService = value
	}

	set moduleService(value: ModuleService) {
		this._moduleService = value
	}

	set learningProviderService(value: LearningProviderService) {
		this._learningProviderService = value
	}

	set cancellationPolicyService(value: CancellationPolicyService) {
		this._cancellationPolicyService = value
	}

	set termsAndConditionsService(value: TermsAndConditionsService) {
		this._termsAndConditionsService = value
	}
}
