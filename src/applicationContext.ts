import * as config from './config'
import * as log4js from 'log4js'
import {HomeController} from './controllers/homeController'
import axios, {AxiosInstance} from 'axios'
import {IdentityService} from './identity/identityService'
import {Auth} from './identity/auth'
import * as passport from 'passport'
import {AuthConfig} from './identity/authConfig'

import {LearningCatalogueConfig} from './learning-catalogue/learningCatalogueConfig'
import {LearningCatalogue} from './learning-catalogue'
import {EnvValue} from 'ts-json-properties'
import {CourseController} from './controllers/courseController'
import {CourseFactory} from './learning-catalogue/model/factory/courseFactory'
import {LearningProviderController} from './controllers/LearningProvider/learningProviderController'
import {LearningProviderFactory} from './learning-catalogue/model/factory/learningProviderFactory'
import {CancellationPolicyFactory} from './learning-catalogue/model/factory/cancellationPolicyFactory'
import {TermsAndConditionsFactory} from './learning-catalogue/model/factory/termsAndConditionsFactory'
import {NextFunction, Request, Response} from 'express'
import {Pagination} from './lib/pagination'
import {CancellationPolicyController} from './controllers/LearningProvider/cancellationPolicyController'
import {TermsAndConditionsController} from './controllers/LearningProvider/termsAndConditionsController'
import {YoutubeModuleController} from './controllers/Module/youtubeModuleController'
import {Validator} from './learning-catalogue/validator/validator'
import {LearningProvider} from './learning-catalogue/model/learningProvider'
import {CancellationPolicy} from './learning-catalogue/model/cancellationPolicy'
import {TermsAndConditions} from './learning-catalogue/model/termsAndConditions'
import {Course} from './learning-catalogue/model/course'
import {ModuleFactory} from './learning-catalogue/model/factory/moduleFactory'
import {AudienceFactory} from './learning-catalogue/model/factory/audienceFactory'
import {EventFactory} from './learning-catalogue/model/factory/eventFactory'
import {ModuleValidator} from './learning-catalogue/validator/moduleValidator'

log4js.configure(config.LOGGING)

export class ApplicationContext {
	identityService: IdentityService
	auth: Auth
	axiosInstance: AxiosInstance
	homeController: HomeController
	learningCatalogueConfig: LearningCatalogueConfig
	learningCatalogue: LearningCatalogue
	courseController: CourseController
	courseValidator: Validator<Course>
	courseFactory: CourseFactory
	learningProviderFactory: LearningProviderFactory
	cancellationPolicyFactory: CancellationPolicyFactory
	termsAndConditionsFactory: TermsAndConditionsFactory
	learningProviderValidator: Validator<LearningProvider>
	cancellationPolicyValidator: Validator<CancellationPolicy>
	termsAndConditionsValidator: Validator<TermsAndConditions>
	learningProviderController: LearningProviderController
	cancellationPolicyController: CancellationPolicyController
	termsAndConditionsController: TermsAndConditionsController
	moduleController: YoutubeModuleController
	moduleValidator: ModuleValidator
	moduleFactory: ModuleFactory
	audienceFactory: AudienceFactory
	eventFactory: EventFactory
	pagination: Pagination

	@EnvValue('LPG_UI_URL')
	public lpgUiUrl: String

	constructor() {
		this.axiosInstance = axios.create({
			headers: {
				'Content-Type': 'application/json',
			},
			timeout: config.REQUEST_TIMEOUT,
		})

		this.identityService = new IdentityService(this.axiosInstance)

		this.auth = new Auth(
			new AuthConfig(
				config.AUTHENTICATION.clientId,
				config.AUTHENTICATION.clientSecret,
				config.AUTHENTICATION.authenticationServiceUrl,
				config.AUTHENTICATION.callbackUrl,
				config.AUTHENTICATION_PATH
			),
			passport,
			this.identityService
		)

		this.learningCatalogueConfig = new LearningCatalogueConfig(
			{
				username: config.COURSE_CATALOGUE.auth.username,
				password: config.COURSE_CATALOGUE.auth.password,
			},
			config.COURSE_CATALOGUE.url
		)

		this.learningCatalogue = new LearningCatalogue(this.learningCatalogueConfig)

		this.courseFactory = new CourseFactory()

		this.pagination = new Pagination()

		this.courseValidator = new Validator<Course>(this.courseFactory)
		this.courseController = new CourseController(this.learningCatalogue, this.courseValidator, this.courseFactory)

		this.homeController = new HomeController(this.learningCatalogue, this.pagination)
		this.learningProviderFactory = new LearningProviderFactory()
		this.cancellationPolicyFactory = new CancellationPolicyFactory()

		this.audienceFactory = new AudienceFactory()
		this.eventFactory = new EventFactory()
		this.moduleFactory = new ModuleFactory(this.audienceFactory, this.eventFactory)
		this.moduleValidator = new ModuleValidator()
		this.moduleController = new YoutubeModuleController(
			this.learningCatalogue,
			this.moduleValidator,
			this.moduleFactory
		)

		this.termsAndConditionsFactory = new TermsAndConditionsFactory()
		this.learningProviderValidator = new Validator<LearningProvider>(this.learningProviderFactory)
		this.learningProviderValidator = new Validator<LearningProvider>(this.learningProviderFactory)
		this.cancellationPolicyValidator = new Validator<CancellationPolicy>(this.cancellationPolicyFactory)
		this.termsAndConditionsValidator = new Validator<TermsAndConditions>(this.termsAndConditionsFactory)

		this.learningProviderController = new LearningProviderController(
			this.learningCatalogue,
			this.learningProviderFactory,
			this.learningProviderValidator,
			this.pagination
		)

		this.cancellationPolicyFactory = new CancellationPolicyFactory()

		this.cancellationPolicyController = new CancellationPolicyController(
			this.learningCatalogue,
			this.cancellationPolicyFactory,
			this.cancellationPolicyValidator
		)

		this.termsAndConditionsFactory = new TermsAndConditionsFactory()

		this.termsAndConditionsController = new TermsAndConditionsController(
			this.learningCatalogue,
			this.termsAndConditionsFactory,
			this.termsAndConditionsValidator
		)
	}

	addToResponseLocals() {
		return (req: Request, res: Response, next: NextFunction) => {
			res.locals.lpgUiUrl = this.lpgUiUrl
			res.locals.sessionFlash = req.session!.sessionFlash
			delete req.session!.sessionFlash

			next()
		}
	}
}
