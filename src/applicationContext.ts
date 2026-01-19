import * as config from './config'
import {HomeController} from './controllers/homeController'
import axios, {AxiosInstance} from 'axios'
import {Auth} from './identity/auth'
import * as passport from 'passport'
import {AuthConfig} from './identity/authConfig'
import {LearningCatalogue} from './learning-catalogue'
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
import {CacheService} from './lib/cache/cacheService'
import {DateRangeCommand} from './controllers/command/dateRangeCommand'
import {DateRangeCommandFactory} from './controllers/command/factory/dateRangeCommandFactory'
import {DateRange} from './learning-catalogue/model/dateRange'
import {DateRangeFactory} from './learning-catalogue/model/factory/dateRangeFactory'
import {LinkModule} from './learning-catalogue/model/linkModule'
import {SearchController} from './controllers/searchController'
import {LearnerRecord} from './learner-record'
import {OrganisationalUnitService} from './csrs/service/organisationalUnitService'
import {ReportService} from './report-service'
import {SkillsController} from './controllers/skills/skillsController'
import {AudienceService} from './lib/audienceService'
import {QuestionFactory} from './controllers/skills/questionFactory'
import {QuizFactory} from './controllers/skills/quizFactory'
import {Question} from "./controllers/skills/question"
import {AgencyTokenService} from './lib/agencyTokenService'
import { OrganisationalUnitCache } from './csrs/organisationalUnitCache'
import {CslServiceClient} from './csl-service/client'
import {Controller} from './controllers/controller'
import { CivilServantProfileService } from './csrs/service/civilServantProfileService'
import {CourseTypeAheadCache} from './learning-catalogue/courseTypeaheadCache'
import {createConfig, createOAuthConfig} from './lib/http/restServiceConfigFactory'
import {redisClient} from './lib/cache/redis'
import {ProfileCache} from './csrs/profileCache'
import { FormattedOrganisationListCache } from './csrs/formattedOrganisationListCache'
import {LearningPlanCache} from './csl-service/learningPlanCache'
import { RequiredLearningCache } from './csl-service/requiredLearningCache'
import {LearningRecordCache} from './csl-service/learningRecordCache'
import { LearningCacheManager } from './lib/learningCacheManager'
import {AgencyTokenController} from './controllers/organisationalUnit/agencyTokenController'
import {OrganisationalUnitTreeCache} from './csrs/organisationalUnitTreeCache'
import {OrganisationalUnitTree} from './csl-service/model/organisationalUnit/organisationalUnitTree'
import {Cache} from './lib/cache/redisCache'
import {OrganisationalUnitClient} from './csrs/client/organisationalUnitClient'
import {EntityService} from './learning-catalogue/service/entityService'
import {CourseTypeAhead} from './learning-catalogue/courseTypeAhead'
import {OrganisationalUnitCacheManager} from './csrs/organisationalUnitCacheManager'
export class ApplicationContext {

	controllers: Controller[] = []

	auth: Auth
	cslServiceConfig: OauthRestService
	courseCatalogueAuth: OauthRestService

	axiosInstance: AxiosInstance
	cacheService: CacheService
	homeController: HomeController
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
	courseService: CourseService
	csrsService: CsrsService
	dateRangeCommandFactory: DateRangeCommandFactory
	dateRangeCommandValidator: Validator<DateRangeCommand>
	dateRangeFactory: DateRangeFactory
	dateRangeValidator: Validator<DateRange>
	learningPlanCache: LearningPlanCache
	cslServiceClient: CslServiceClient
	learnerRecord: LearnerRecord
	profileCache: ProfileCache
	organisationalUnitClient: OrganisationalUnitClient
	organisationalUnitCache: OrganisationalUnitCache
	searchController: SearchController
	organisationalUnitService: OrganisationalUnitService
	reportService: ReportService
	skillsController: SkillsController
	audienceService: AudienceService
	agencyTokenService: AgencyTokenService
	agencyTokenController: AgencyTokenController
	questionFactory: QuestionFactory
	quizFactory: QuizFactory
	questionValidator: Validator<Question>
	civilServantProfileService: CivilServantProfileService
	formattedOrganisationListCache: FormattedOrganisationListCache
	requiredLearningCache: RequiredLearningCache
	learningRecordCache: LearningRecordCache
	learningCacheManager: LearningCacheManager
	organisationalUnitTreeCache: OrganisationalUnitTreeCache

	public lpgUiUrl: string = config.FRONTEND.LPG_UI_URL

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
			this.civilServantProfileService,
			this.lpgUiUrl
		)

		this.learningPlanCache = new LearningPlanCache(redisClient, 1)

		this.cslServiceConfig = createOAuthConfig(config.CSL_SERVICE, this.auth)
		this.cslServiceClient = new CslServiceClient(this.cslServiceConfig, this.learningPlanCache)
		this.organisationalUnitClient = new OrganisationalUnitClient(this.cslServiceConfig)

		this.requiredLearningCache = new RequiredLearningCache(redisClient, config.ORG_REDIS.ttl_seconds)
		this.learningRecordCache = new LearningRecordCache(redisClient, config.ORG_REDIS.ttl_seconds)
		this.courseTypeaheadCache = new CourseTypeAheadCache(
			new Cache(redisClient, config.ORG_REDIS.ttl_seconds, 'courses', CourseTypeAhead),
			new EntityService<Course>(this.courseCatalogueAuth, new CourseFactory()))
		this.learningCacheManager = new LearningCacheManager(this.requiredLearningCache, this.learningPlanCache, this.learningRecordCache)
		this.courseCatalogueAuth = createOAuthConfig(config.COURSE_CATALOGUE, this.auth)
		this.courseTypeaheadCache = new CourseTypeAheadCache(
			new Cache(redisClient, config.ORG_REDIS.ttl_seconds, 'courses', CourseTypeAhead),
			new EntityService<Course>(this.courseCatalogueAuth, new CourseFactory()))
		this.learningCatalogue = new LearningCatalogue(this.courseCatalogueAuth, this.cslServiceClient, this.courseTypeaheadCache, this.learningCacheManager)

		this.courseFactory = new CourseFactory()

		this.questionFactory = new QuestionFactory()

		this.quizFactory = new QuizFactory()

		this.pagination = new Pagination()

		this.cacheService = new CacheService({
			stdTTL: config.CACHE.TTL_SECONDS,
			checkperiod: config.CACHE.CHECK_PERIOD_SECONDS,
		})

		this.organisationalUnitCache = new OrganisationalUnitCache(redisClient, config.ORG_REDIS.ttl_seconds)
		this.formattedOrganisationListCache = new FormattedOrganisationListCache(redisClient, config.ORG_REDIS.ttl_seconds)
		this.organisationalUnitTreeCache = new OrganisationalUnitTreeCache(
			new Cache<OrganisationalUnitTree>(redisClient, config.ORG_REDIS.ttl_seconds, "organisationalUnits", OrganisationalUnitTree),
			this.organisationalUnitClient)

		this.organisationalUnitService = new OrganisationalUnitService(new OrganisationalUnitCacheManager(this.organisationalUnitCache, this.formattedOrganisationListCache, this.organisationalUnitTreeCache), this.organisationalUnitClient)

		this.csrsService = new CsrsService(createOAuthConfig(config.REGISTRY_SERVICE, this.auth), this.cacheService, this.organisationalUnitService)

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

		this.moduleController = new ModuleController(this.learningCatalogue, this.moduleFactory)
		this.fileController = new FileController(
			this.learningCatalogue,
			this.moduleValidator,
			this.moduleFactory,
			createOAuthConfig({url: config.COURSE_CATALOGUE.url + '/media', timeout: config.COURSE_CATALOGUE.timeout}, this.auth),
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

		this.learnerRecord = new LearnerRecord(createOAuthConfig(config.LEARNER_RECORD, this.auth))

		this.eventController = new EventController(
			this.learningCatalogue,
			this.learnerRecord,
			this.eventValidator,
			this.eventFactory,
			this.dateRangeCommandValidator,
			this.dateRangeValidator,
			this.dateRangeCommandFactory,
			this.cslServiceClient
		)

		this.audienceValidator = new Validator<Audience>(this.audienceFactory)
		this.audienceService = new AudienceService(this.csrsService)
		this.audienceController = new AudienceController(
			this.learningCatalogue,
			this.audienceValidator,
			this.audienceFactory,
			this.courseService,
			this.csrsService,
			this.audienceService
		)

		this.searchController = new SearchController(this.learningCatalogue, this.pagination)
		this.questionValidator = new Validator<Question>(this.questionFactory)
		this.skillsController = new SkillsController(this.csrsService, this.questionFactory, this.quizFactory, this.questionValidator)

	}

	addToResponseLocals() {
		return (req: Request, res: Response, next: NextFunction) => {
			res.locals.originalUrl = req.originalUrl
			res.locals.lpgUiUrl = this.lpgUiUrl
			res.locals.sessionFlash = req.session!.sessionFlash

			delete req.session!.sessionFlash

			next()
		}
	}
}
