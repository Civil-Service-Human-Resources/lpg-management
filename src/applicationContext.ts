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
import {NextFunction, Request, Response} from 'express'

log4js.configure(config.LOGGING)

export class ApplicationContext {
	@EnvValue('LPG_UI_URL')
	private lpgUiUrl: String

	homeController: HomeController
	courseController: CourseController
	identityService: IdentityService
	axiosInstance: AxiosInstance
	auth: Auth
	learningCatalogueConfig: LearningCatalogueConfig
	learningCatalogue: LearningCatalogue
	courseValidator: CourseValidator
	courseFactory: CourseFactory

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

		this.homeController = new HomeController(this.learningCatalogue)

		this.courseController = new CourseController(this.learningCatalogue, this.courseValidator, this.courseFactory)
	}

	addToResponseLocals() {
		return (req: Request, res: Response, next: NextFunction) => {
			res.locals.lpgUiUrl = this.lpgUiUrl
			next()
		}
	}
}
