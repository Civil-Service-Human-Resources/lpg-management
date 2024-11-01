import * as config from './config'
import {HomeController} from './controllers/homeController'
import axios, {AxiosInstance} from 'axios'
import {Auth} from './identity/auth'
import * as passport from 'passport'
import {AuthConfig} from './identity/authConfig'
import {LearningCatalogue} from './learning-catalogue'
import {EnvValue} from 'ts-json-properties'
import {CourseController} from './controllers/courseController'
import {CourseFactory} from './learning-catalogue/model/factory/courseFactory'
import {NextFunction, Request, Response} from 'express'
import {Pagination} from './lib/pagination'
import {YoutubeModuleController} from './controllers/module/youtubeModuleController'
import {Validator} from './learning-catalogue/validator/validator'
import {Course} from './learning-catalogue/model/course'
import {ModuleFactory} from './learning-catalogue/model/factory/moduleFactory'
import {AudienceFactory} from './learning-catalogue/model/factory/audienceFactory'
import {EventFactory} from './learning-catalogue/model/factory/eventFactory'
import {ModuleController} from './controllers/module/moduleController'
import {Module} from './learning-catalogue/model/module'
import {FileController} from './controllers/module/fileController'
import {LinkModuleController} from './controllers/module/linkModuleController'
import {FaceToFaceModuleController} from './controllers/module/faceToFaceModuleController'
import {EventController} from './controllers/module/event/eventController'
import {Event} from './learning-catalogue/model/event'
import {AudienceController} from './controllers/audience/audienceController'
import {Audience} from './learning-catalogue/model/audience'
import {CourseService} from './lib/courseService'
import {CsrsService} from './csrs/service/csrsService'
import {YoutubeService} from './youtube/youtubeService'
import {OauthRestService} from './lib/http/oauthRestService'
import {CacheService} from './lib/cacheService'
import {DateRangeCommand} from './controllers/command/dateRangeCommand'
import {DateRangeCommandFactory} from './controllers/command/factory/dateRangeCommandFactory'
import {DateRange} from './learning-catalogue/model/dateRange'
import {DateRangeFactory} from './learning-catalogue/model/factory/dateRangeFactory'
import {LinkModule} from './learning-catalogue/model/linkModule'
import {SearchController} from './controllers/searchController'
import {OrganisationController} from './controllers/organisationalUnit/organisationController'
import {OrganisationalUnitPageModelFactory} from './csrs/model/organisationalUnitPageModelFactory'
import {LearnerRecord} from './learner-record'
import {InviteFactory} from './learner-record/model/factory/inviteFactory'
import {BookingFactory} from './learner-record/model/factory/bookingFactory'
import {Booking} from './learner-record/model/booking'
import {ReportingController} from './controllers/reportingController'
import {OrganisationalUnitService} from './csrs/service/organisationalUnitService'
import {ReportService} from './report-service'
import {SkillsController} from './controllers/skills/skillsController'
import {AudienceService} from './lib/audienceService'
import {QuestionFactory} from './controllers/skills/questionFactory'
import {QuizFactory} from './controllers/skills/quizFactory'
import {Question} from "./controllers/skills/question"
import {AgencyToken} from './csrs/model/agencyToken'
import {AgencyTokenFactory} from './csrs/model/agencyTokenFactory'
import {AgencyTokenService} from './lib/agencyTokenService'
import {AgencyTokenController} from './controllers/organisationalUnit/agencyTokenController'
import {AgencyTokenCapacityUsedHttpService} from './identity/agencyTokenCapacityUsedHttpService'
import { OrganisationalUnitPageModel } from './csrs/model/organisationalUnitPageModel'
import { OrganisationalUnitClient } from './csrs/client/organisationalUnitClient'
import { OrganisationalUnitCache } from './csrs/organisationalUnitCache'
import { AgencyTokenHttpService } from './csrs/agencyTokenHttpService'
import { OrganisationalUnitTypeaheadCache } from './csrs/organisationalUnitTypeaheadCache'
import {CslServiceClient} from './csl-service/client'
import {Controller} from './controllers/controller'
import { CivilServantProfileService } from './csrs/service/civilServantProfileService'
import {CourseTypeAheadCache} from './learning-catalogue/courseTypeaheadCache'
import {RestServiceConfig} from './lib/http/restServiceConfig'
import {createConfig} from './lib/http/restServiceConfigFactory'
import {redisClient} from './lib/redis'
import {ProfileCache} from './csrs/profileCache'

export class ApplicationContext {

	controllers: Controller[] = []

	auth: Auth
	identityConfig: RestServiceConfig
	axiosInstance: AxiosInstance
	cacheService: CacheService
	homeController: HomeController
	learningCatalogueConfig: RestServiceConfig
	courseTypeaheadCache: CourseTypeAheadCache
	learningCatalogue: LearningCatalogue
	courseController: CourseController
	courseValidator: Validator<Course>
	courseFactory: CourseFactory
	moduleController: ModuleController
	linkModuleController: LinkModuleController
	moduleFactory: ModuleFactory
	youtubeModuleController: YoutubeModuleController
	moduleValidator: Validator<Module>
	linkModuleValidator: Validator<LinkModule>
	eventValidator: Validator<Event>
	audienceController: AudienceController
	audienceValidator: Validator<Audience>
	audienceFactory: AudienceFactory
	eventFactory: EventFactory
	fileController: FileController
	pagination: Pagination
	youtubeService: YoutubeService
	faceToFaceController: FaceToFaceModuleController
	eventController: EventController
	mediaConfig: RestServiceConfig
	courseService: CourseService
	csrsConfig: RestServiceConfig
	csrsService: CsrsService
	dateRangeCommandFactory: DateRangeCommandFactory
	dateRangeCommandValidator: Validator<DateRangeCommand>
	dateRangeFactory: DateRangeFactory
	dateRangeValidator: Validator<DateRange>
	cslServiceConfig: RestServiceConfig
	cslService: CslServiceClient
	learnerRecord: LearnerRecord
	learnerRecordConfig: RestServiceConfig
	inviteFactory: InviteFactory
	bookingFactory: BookingFactory
	bookingValidator: Validator<Booking>
	organisationalUnitPageModelFactory: OrganisationalUnitPageModelFactory
	organisationalUnitPageModelValidator: Validator<OrganisationalUnitPageModel>
	profileCache: ProfileCache
	organisationalUnitCache: OrganisationalUnitCache
	organisationalUnitTypeaheadCache: OrganisationalUnitTypeaheadCache
	organisationalUnitClient: OrganisationalUnitClient
	organisationController: OrganisationController
	agencyTokenHttpService: AgencyTokenHttpService
	agencyTokenCapacityUsedHttpService: AgencyTokenCapacityUsedHttpService
	searchController: SearchController
	reportingController: ReportingController
	organisationalUnitService: OrganisationalUnitService
	reportService: ReportService
	skillsController: SkillsController
	audienceService: AudienceService
	agencyTokenFactory: AgencyTokenFactory
	agencyTokenValidator: Validator<AgencyToken>
	agencyTokenService: AgencyTokenService
	agencyTokenController: AgencyTokenController
	questionFactory: QuestionFactory
	quizFactory: QuizFactory
	questionValidator: Validator<Question>
	civilServantProfileService: CivilServantProfileService


	@EnvValue('LPG_UI_URL')
	public lpgUiUrl: String

	@EnvValue('FEEDBACK_URL')
	public feedbackUrl: String

	constructor() {
		this.axiosInstance = axios.create({
			headers: {
				'Content-Type': 'application/json',
			},
			timeout: config.REQUEST_TIMEOUT_MS,
		})

		this.profileCache = new ProfileCache(
			redisClient, config.PROFILE_REDIS.ttl_seconds
		)

		this.civilServantProfileService = new CivilServantProfileService(this.axiosInstance, this.profileCache)

		this.auth = new Auth(
			new AuthConfig(
				config.AUTHENTICATION.clientId,
				config.AUTHENTICATION.clientSecret,
				config.AUTHENTICATION.authenticationServiceUrl,
				config.AUTHENTICATION.callbackUrl,
				config.AUTHENTICATION_PATH,
				config.AUTHENTICATION.endpoints.authorization,
				config.AUTHENTICATION.endpoints.token,
				config.AUTHENTICATION.endpoints.logout
			),
			passport,
			this.civilServantProfileService
		)

		this.identityConfig = createConfig({
			url: config.AUTHENTICATION.authenticationServiceUrl,
			timeout: config.AUTHENTICATION.timeout,
		})

		this.cslServiceConfig = createConfig(config.CSL_SERVICE)
		this.cslService = new CslServiceClient(new OauthRestService(this.cslServiceConfig, this.auth))

		this.learningCatalogueConfig = createConfig(config.COURSE_CATALOGUE)

		this.courseTypeaheadCache = new CourseTypeAheadCache(redisClient, config.ORG_REDIS.ttl_seconds)
		this.learningCatalogue = new LearningCatalogue(this.learningCatalogueConfig, this.auth, this.cslService, this.courseTypeaheadCache)

		this.courseFactory = new CourseFactory()

		this.questionFactory = new QuestionFactory()

		this.quizFactory = new QuizFactory()

		this.pagination = new Pagination()

		this.cacheService = new CacheService({
			stdTTL: config.CACHE.TTL_SECONDS,
			checkperiod: config.CACHE.CHECK_PERIOD_SECONDS,
		})

		this.agencyTokenCapacityUsedHttpService = new AgencyTokenCapacityUsedHttpService(this.identityConfig, this.auth)

		this.organisationalUnitCache = new OrganisationalUnitCache(
			redisClient, config.ORG_REDIS.ttl_seconds
		)

		this.organisationalUnitTypeaheadCache = new OrganisationalUnitTypeaheadCache(
			redisClient, config.ORG_REDIS.ttl_seconds
		)
		this.csrsConfig = createConfig(config.REGISTRY_SERVICE)
		this.organisationalUnitClient = new OrganisationalUnitClient(new OauthRestService(this.csrsConfig, this.auth))
		this.organisationalUnitService = new OrganisationalUnitService(
			this.organisationalUnitCache,
			this.organisationalUnitTypeaheadCache,
			this.organisationalUnitClient,
			this.agencyTokenCapacityUsedHttpService)

		this.csrsService = new CsrsService(new OauthRestService(this.csrsConfig, this.auth), this.cacheService, this.organisationalUnitService)

		this.courseValidator = new Validator<Course>(this.courseFactory)
		this.courseService = new CourseService(this.learningCatalogue)
		this.courseController = new CourseController(this.learningCatalogue, this.courseValidator, this.courseFactory, this.courseService, this.csrsService)

		this.homeController = new HomeController(this.learningCatalogue, this.pagination)

		this.youtubeService = new YoutubeService(createConfig({url: '', timeout: config.YOUTUBE.timeout}), this.auth, config.YOUTUBE.api_key)
		this.audienceFactory = new AudienceFactory()
		this.eventFactory = new EventFactory()
		this.moduleFactory = new ModuleFactory()
		this.moduleValidator = new Validator<Module>(this.moduleFactory)
		this.youtubeModuleController = new YoutubeModuleController(this.learningCatalogue, this.moduleValidator, this.moduleFactory, this.youtubeService, this.courseService)

		this.mediaConfig = createConfig({url: config.COURSE_CATALOGUE.url + '/media', timeout: config.COURSE_CATALOGUE.timeout})

		this.moduleController = new ModuleController(this.learningCatalogue, this.moduleFactory)
		this.fileController = new FileController(
			this.learningCatalogue,
			this.moduleValidator,
			this.moduleFactory,
			new OauthRestService(this.mediaConfig, this.auth),
			this.courseService
		)
		this.linkModuleValidator = new Validator<LinkModule>(this.moduleFactory)
		this.linkModuleController = new LinkModuleController(this.learningCatalogue, this.moduleFactory, this.linkModuleValidator, this.courseService)

		this.faceToFaceController = new FaceToFaceModuleController(this.learningCatalogue, this.moduleValidator, this.moduleFactory, this.courseService)

		this.eventValidator = new Validator<Event>(this.eventFactory)

		this.dateRangeCommandFactory = new DateRangeCommandFactory()
		this.dateRangeCommandValidator = new Validator<DateRangeCommand>(this.dateRangeCommandFactory)
		this.dateRangeFactory = new DateRangeFactory()
		this.dateRangeValidator = new Validator<DateRange>(this.dateRangeFactory)

		this.bookingFactory = new BookingFactory()
		this.inviteFactory = new InviteFactory()

		this.learnerRecordConfig = createConfig(config.LEARNER_RECORD)
		this.learnerRecord = new LearnerRecord(this.learnerRecordConfig, this.auth, this.bookingFactory, this.inviteFactory)

		this.bookingValidator = new Validator<Booking>(this.bookingFactory)

		this.eventController = new EventController(
			this.learningCatalogue,
			this.learnerRecord,
			this.eventValidator,
			this.bookingValidator,
			this.eventFactory,
			this.inviteFactory,
			this.dateRangeCommandValidator,
			this.dateRangeValidator,
			this.dateRangeCommandFactory,
			this.cslService
		)

		this.audienceValidator = new Validator<Audience>(this.audienceFactory)
		this.agencyTokenHttpService = new AgencyTokenHttpService(this.csrsConfig, this.auth)

		this.audienceService = new AudienceService(this.csrsService)
		this.audienceController = new AudienceController(
			this.learningCatalogue,
			this.audienceValidator,
			this.audienceFactory,
			this.courseService,
			this.csrsService,
			this.audienceService
		)
		this.organisationalUnitPageModelFactory = new OrganisationalUnitPageModelFactory()
		this.organisationalUnitPageModelValidator = new Validator<OrganisationalUnitPageModel>(this.organisationalUnitPageModelFactory)

		this.organisationController = new OrganisationController(
			this.organisationalUnitPageModelValidator,
			this.organisationalUnitPageModelFactory,
			this.organisationalUnitService
		)

		this.agencyTokenFactory = new AgencyTokenFactory()
		this.agencyTokenValidator = new Validator<AgencyToken>(this.agencyTokenFactory)
		this.agencyTokenService = new AgencyTokenService()
		this.agencyTokenController = new AgencyTokenController(
			this.agencyTokenValidator,
			this.agencyTokenService,
			this.organisationalUnitService,
			this.agencyTokenFactory,
		)

		this.searchController = new SearchController(this.learningCatalogue, this.pagination)

		this.reportingController = new ReportingController(this.reportService, this.csrsService, this.organisationalUnitService)
		this.questionValidator = new Validator<Question>(this.questionFactory)
		this.skillsController = new SkillsController(this.csrsService, this.questionFactory, this.quizFactory, this.questionValidator)

	}

	addToResponseLocals() {
		return (req: Request, res: Response, next: NextFunction) => {
			res.locals.originalUrl = req.originalUrl
			res.locals.lpgUiUrl = this.lpgUiUrl
			res.locals.feedbackUrl = this.feedbackUrl
			res.locals.sessionFlash = req.session!.sessionFlash

			delete req.session!.sessionFlash

			next()
		}
	}
}
