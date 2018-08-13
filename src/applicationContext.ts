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
import {CourseValidator} from './learning-catalogue/validator/courseValidator'
import {EnvValue} from 'ts-json-properties'
import {CourseController} from './controllers/courseController'
import {CourseFactory} from './learning-catalogue/model/factory/courseFactory'
import {LearningProviderController} from './controllers/LearningProvider/learningProviderController'
import {LearningProviderFactory} from './learning-catalogue/model/factory/learningProviderFactory'
import {LearningProviderValidator} from './learning-catalogue/validator/learningProviderValidator'
import {CancellationPolicyFactory} from './learning-catalogue/model/factory/cancellationPolicyFactory'
import {CancellationPolicyValidator} from './learning-catalogue/validator/cancellationPolicyValidator'
import {TermsAndConditionsFactory} from './learning-catalogue/model/factory/termsAndConditionsFactory'
import {TermsAndConditionsValidator} from './learning-catalogue/validator/termsAndConditionsValidator'
import {NextFunction, Request, Response} from 'express'
import {Pagination} from './lib/pagination'
import {CancellationPolicyController} from './controllers/LearningProvider/cancellationPolicyController'
import {TermsAndConditionsController} from './controllers/LearningProvider/termsAndConditionsController'

log4js.configure(config.LOGGING)

export class ApplicationContext {
	homeController: HomeController
	courseController: CourseController
	learningProviderController: LearningProviderController
	identityService: IdentityService
	axiosInstance: AxiosInstance
	auth: Auth
	learningCatalogueConfig: LearningCatalogueConfig
	learningCatalogue: LearningCatalogue
	courseValidator: CourseValidator
	courseFactory: CourseFactory
	learningProviderFactory: LearningProviderFactory
	cancellationPolicyValidator: CancellationPolicyValidator
	cancellationPolicyFactory: CancellationPolicyFactory
	cancellationPolicyController: CancellationPolicyController
	termsAndConditionsValidator: TermsAndConditionsValidator
	termsAndConditionsFactory: TermsAndConditionsFactory
	termsAndConditionsController: TermsAndConditionsController
	learningProviderValidator: LearningProviderValidator
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

		this.courseValidator = new CourseValidator()
		this.courseFactory = new CourseFactory()
		this.learningProviderValidator = new LearningProviderValidator()
		this.learningProviderFactory = new LearningProviderFactory()
		this.pagination = new Pagination()

		this.courseController = new CourseController(this.learningCatalogue, this.courseValidator, this.courseFactory)
		this.homeController = new HomeController(this.learningCatalogue, this.pagination)
		this.learningProviderController = new LearningProviderController(
			this.learningCatalogue,
			this.learningProviderValidator,
			this.learningProviderFactory,
			this.pagination
		)

		this.cancellationPolicyValidator = new CancellationPolicyValidator()
		this.cancellationPolicyFactory = new CancellationPolicyFactory()

		this.cancellationPolicyController = new CancellationPolicyController(
			this.learningCatalogue,
			this.cancellationPolicyValidator,
			this.cancellationPolicyFactory
		)

		this.termsAndConditionsValidator = new TermsAndConditionsValidator()
		this.termsAndConditionsFactory = new TermsAndConditionsFactory()

		this.termsAndConditionsController = new TermsAndConditionsController(
			this.learningCatalogue,
			this.termsAndConditionsValidator,
			this.termsAndConditionsFactory
		)
	}

	addToResponseLocals() {
		return (req: Request, res: Response, next: NextFunction) => {
			res.locals.lpgUiUrl = this.lpgUiUrl
			next()
		}
	}
}
