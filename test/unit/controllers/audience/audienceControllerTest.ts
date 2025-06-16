import * as chai from 'chai'
import {expect} from 'chai'
import * as sinonChai from 'sinon-chai'
import * as sinon from 'sinon'
import {beforeEach, describe} from 'mocha'
import {LearningCatalogue} from '../../../../src/learning-catalogue'
import {Validator} from '../../../../src/learning-catalogue/validator/validator'
import {AudienceController} from '../../../../src/controllers/audience/audienceController'
import {AudienceFactory} from '../../../../src/learning-catalogue/model/factory/audienceFactory'
import {Audience} from '../../../../src/learning-catalogue/model/audience'
import {mockReq, mockRes} from 'sinon-express-mock'
import {NextFunction, Request, Response} from 'express'
import {CourseService} from '../../../../src/lib/courseService'
import {CsrsService} from '../../../../src/csrs/service/csrsService'
import {DateTime} from '../../../../src/lib/dateTime'
import * as moment from 'moment'
import {Course} from '../../../../src/learning-catalogue/model/course'
import {AudienceService} from 'lib/audienceService'
import { OrganisationalUnitTypeAhead } from '../../../../src/csrs/model/organisationalUnitTypeAhead'

chai.use(sinonChai)

describe('AudienceController', () => {
	let audienceController: AudienceController
	let audienceFactory: AudienceFactory
	let audienceValidator: Validator<Audience>
	let csrsService: CsrsService
	let learningCatalogue: LearningCatalogue
	let courseService: CourseService
	let audienceService: AudienceService
	let req: Request
	let res: Response
	let next: NextFunction
	let error: Error

	const courseId = 'course-id'
	const audienceId = 'audience-id'

	beforeEach(() => {
		learningCatalogue = <LearningCatalogue>{}
		csrsService = <CsrsService>{}
		courseService = new CourseService(learningCatalogue)
		audienceFactory = new AudienceFactory()
		audienceValidator = new Validator(audienceFactory)
		audienceService = <AudienceService>{}
		audienceController = new AudienceController(learningCatalogue, audienceValidator, audienceFactory, courseService, csrsService, audienceService)

		req = mockReq()
		req.session!.save = callback => {
			callback(undefined)
		}
		req.params.courseId = courseId

		res = mockRes()
		next = sinon.stub()
		error = new Error()
	})

	describe('#getConfigureAudience', () => {
		it('should render audience configuration page', async function() {
			req.params.audienceId = audienceId
			res.locals.audience = {departments: []}

			csrsService.getDepartmentCodeToNameMapping = sinon.stub()
			csrsService.getGradeCodeToNameMapping = sinon.stub()
			courseService.getAudienceIdToEventMapping = sinon.stub()

			await audienceController.getConfigureAudience()(req, res)

			expect(res.render).to.have.been.calledOnceWith('page/course/audience/configure-audience')
		})
	})

	describe('#deleteAudienceConfirmation', () => {
		it('should render delete audience confirmation page', async function() {
			await audienceController.deleteAudienceConfirmation()(req, res)

			expect(res.render).to.have.been.calledOnceWith('page/course/audience/delete-audience-confirmation')
		})
	})

	describe('#deleteAudience', () => {
		it('should delete course audience ', async function() {
			req.params.courseId = courseId
			req.params.audienceId = audienceId

			learningCatalogue.deleteAudience = sinon.stub().returns(Promise.resolve())

			await audienceController.deleteAudience()(req, res, next)

			expect(learningCatalogue.deleteAudience).to.have.been.calledOnceWith(courseId, audienceId)
			expect(res.redirect).to.have.been.calledOnceWith(`/content-management/courses/${courseId}/overview`)
		})

		it('should pass to next if delete throws error', async function() {
			req.params.courseId = courseId
			req.params.audienceId = audienceId

			learningCatalogue.deleteAudience = sinon.stub().returns(Promise.reject(error))

			await audienceController.deleteAudience()(req, res, next)

			expect(learningCatalogue.deleteAudience).to.have.been.calledOnceWith(courseId, audienceId)
			expect(next).to.have.been.calledOnceWith(error)
		})
	})

	describe('#getOrganisation', () => {
		it('should render add-organisation page', async function() {
			const departments = {departments: ['co', 'dh']}
			res.locals.audience = {
				departments: departments,
			}
			const organisations = new OrganisationalUnitTypeAhead([])
			csrsService.listOrganisationalUnitsForTypehead = sinon.stub().resolves(organisations)
			await audienceController.getOrganisation()(req, res)

			expect(res.render).to.have.been.calledOnceWith('page/course/audience/add-organisation', {organisationalUnits: [], selectedOrganisations: departments})
		})
	})

	describe('#setOrganisation', () => {
		it('should update course audience with selected organisation code', async function() {
			req.params.audienceId = audienceId

			const hmrcName = 'HM Revenue & Customs'
			const hmrcCode = 'hmrc'

			req.body = {organisation: 'selected', 'input-autocomplete': hmrcName}

			const audience = {id: audienceId, departments: [hmrcCode]}
			res.locals.audience = audience

			const id = '123'
			const course = {audiences: [audience], id: id}
			res.locals.course = course
			audienceService.getAudienceName = sinon.stub().returns('my audience name')
			learningCatalogue.updateAudience = sinon.stub().returns(Promise.resolve(audience))

			await audienceController.setOrganisation()(req, res, next)

			expect(learningCatalogue.updateAudience).to.have.been.calledOnceWith(id, audience)
			expect(res.redirect).to.have.been.calledOnceWith(`/content-management/courses/${courseId}/audiences/${audienceId}/organisation`)
		})

		it('should pass to next if update throws error', async function() {
			req.params.audienceId = audienceId

			const hmrcName = 'HM Revenue & Customs'
			const hmrcCode = 'hmrc'

			req.body = {organisation: 'selected', 'input-autocomplete': hmrcName}

			const audience = {id: audienceId, departments: [hmrcCode]}
			res.locals.audience = audience

			const id = '123'
			const course = {audiences: [audience], id: id}
			res.locals.course = course

			audienceService.getAudienceName = sinon.stub().returns('my audience name')
			learningCatalogue.updateAudience = sinon.stub().returns(Promise.reject(error))

			await audienceController.setOrganisation()(req, res, next)

			expect(learningCatalogue.updateAudience).to.have.been.calledOnceWith(id, audience)
			expect(next).to.have.been.calledWith(error)
		})

		it('should update course audience with all organisation codes if "all" is selected', async function() {
			req.params.audienceId = audienceId
			req.body = {organisation: 'all', 'input-autocomplete': ''}
			const audience = {id: audienceId, departments: []}
			res.locals.course = {audiences: [audience], id: courseId}
			res.locals.audience = audience

			const hmrcCode = 'hmrc'
			const dwpCode = 'dwp'
			csrsService.listOrganisationalUnitsForTypehead = sinon.stub().returns({
				_embedded: {
					organisationalUnits: [{code: hmrcCode, name: 'HM Revenue & Customs'}, {code: dwpCode, name: 'Department for Work and Pensions'}],
				},
			})
			audienceService.getAudienceName = sinon.stub().returns('my audience name')
			learningCatalogue.updateAudience = sinon.stub().returns(Promise.resolve(audience))

			await audienceController.setOrganisation()(req, res, next)

			expect(learningCatalogue.updateAudience).to.have.been.calledOnceWith(courseId, audience)

			expect(res.redirect).to.have.been.calledOnceWith(`/content-management/courses/${courseId}/audiences/${audienceId}/organisation`)
		})
	})

	describe('#deleteOrganisation', () => {
		it('should update course audience with empty list of organisations and redirect to audience configuration page', async function() {
			req.params.audienceId = audienceId
			const audience = {id: audienceId, departments: ['hmrc']}
			res.locals.course = {audiences: [audience], id: courseId}
			res.locals.audience = audience
			req.params.audienceId = audienceId

			audienceService.getAudienceName = sinon.stub().returns('my audience name')
			learningCatalogue.updateAudience = sinon.stub().returns(Promise.resolve(audience))

			await audienceController.deleteOrganisation()(req, res, next)

			expect(learningCatalogue.updateAudience).to.have.been.calledOnceWith(courseId, audience)
			expect(res.redirect).to.have.been.calledOnceWith(`/content-management/courses/${courseId}/audiences/${audienceId}/organisation`)
		})

		it('should pass to next if update throws error', async function() {
			req.params.audienceId = audienceId
			const audience = {id: audienceId, departments: ['hmrc']}
			res.locals.course = {audiences: [audience], id: courseId}
			res.locals.audience = audience
			req.params.audienceId = audienceId

			audienceService.getAudienceName = sinon.stub().returns('my audience name')
			learningCatalogue.updateAudience = sinon.stub().returns(Promise.reject(error))

			await audienceController.deleteOrganisation()(req, res, next)

			expect(learningCatalogue.updateAudience).to.have.been.calledOnceWith(courseId, audience)
			expect(next).to.have.been.calledOnceWith(error)
		})
	})

	describe('#getAreasOfWork', () => {
		it('should render add-are-of-work page', async function() {
			csrsService.getAreasOfWork = sinon.stub().returns({})
			await audienceController.getAreasOfWork()(req, res)

			expect(res.render).to.have.been.calledOnceWith('page/course/audience/add-area-of-work', {areasOfWork: {}})
		})
	})

	describe('#setAreasOfWork', () => {
		it('should update course with area of work if the area of work is valid and redirect to audience configuration page', async () => {
			req.params.audienceId = audienceId
			const aowHumanResources = 'Human resources'
			req.body = {'area-of-work': aowHumanResources}
			const audience = {id: audienceId, areasOfWork: []}
			res.locals.course = {audiences: [audience], id: courseId}
			res.locals.audience = audience

			csrsService.isAreaOfWorkValid = sinon.stub().returns(true)
			audienceService.getAudienceName = sinon.stub().returns('my audience name')
			learningCatalogue.updateAudience = sinon.stub().returns(Promise.resolve(audience))

			await audienceController.setAreasOfWork()(req, res, next)

			expect(learningCatalogue.updateAudience).to.have.been.calledOnceWith(courseId, audience)
			expect(res.redirect).to.have.been.calledOnceWith(`/content-management/courses/${courseId}/audiences/${audienceId}/configure`)
		})

		it('should pass to next if update throws error', async () => {
			req.params.audienceId = audienceId
			const aowHumanResources = 'Human resources'
			req.body = {'area-of-work': aowHumanResources}
			const audience = {id: audienceId, areasOfWork: []}
			res.locals.course = {audiences: [audience], id: courseId}
			res.locals.audience = audience

			audienceService.getAudienceName = sinon.stub().returns('my audience name')
			csrsService.isAreaOfWorkValid = sinon.stub().returns(true)
			learningCatalogue.updateAudience = sinon.stub().returns(Promise.reject(error))

			await audienceController.setAreasOfWork()(req, res, next)

			expect(learningCatalogue.updateAudience).to.have.been.calledOnceWith(courseId, audience)
			expect(next).to.have.been.calledOnceWith(error)
		})
	})

	describe('#deleteAreasOfWork', () => {
		it('should update course with empty areas of work array and redirect to audience configuration page', async () => {
			req.params.audienceId = audienceId
			const audience = {id: audienceId, areasOfWork: ['some area of work']}
			res.locals.course = {audiences: [audience], id: courseId}
			res.locals.audience = audience

			audienceService.getAudienceName = sinon.stub().returns('my audience name')
			learningCatalogue.updateAudience = sinon.stub().returns(Promise.resolve(res.locals.course))

			await audienceController.deleteAreasOfWork()(req, res, next)

			expect(learningCatalogue.updateAudience).to.have.been.calledOnceWith(courseId, audience)

			expect(res.redirect).to.have.been.calledOnceWith(`/content-management/courses/${courseId}/audiences/${audienceId}/configure`)
		})

		it('should pass to next if error occurs during update', async () => {
			req.params.audienceId = audienceId
			const audience = {id: audienceId, areasOfWork: ['some area of work']}
			res.locals.course = {audiences: [audience], id: courseId}
			res.locals.audience = audience

			audienceService.getAudienceName = sinon.stub().returns('my audience name')
			learningCatalogue.updateAudience = sinon.stub().returns(Promise.reject(error))

			await audienceController.deleteAreasOfWork()(req, res, next)

			expect(learningCatalogue.updateAudience).to.have.been.calledOnceWith(courseId, audience)

			expect(next).to.have.been.calledOnceWith(error)
		})
	})

	describe('#getGrades', () => {
		it('should render add-grades page', async () => {
			csrsService.getGrades = sinon.stub()
			await audienceController.getGrades()(req, res)
			expect(res.render).to.have.been.calledOnceWith('page/course/audience/add-grades')
		})
	})

	describe('#setGrades', () => {
		it('should update course with grades if the grade codes are valid and redirect to audience configuration page', async () => {
			req.params.audienceId = audienceId
			const gradeCode = 'AA'
			req.body = {grades: gradeCode}
			const audience = {id: audienceId, grades: []}
			res.locals.course = {audiences: [audience], id: courseId}
			res.locals.audience = audience

			audienceService.getAudienceName = sinon.stub().returns('my audience name')
			csrsService.isGradeCodeValid = sinon.stub().returns(true)
			learningCatalogue.updateAudience = sinon.stub().returns(Promise.resolve(res.locals.course))

			await audienceController.setGrades()(req, res, next)

			expect(learningCatalogue.updateAudience).to.have.been.calledOnceWith(courseId, audience)

			expect(res.redirect).to.have.been.calledOnceWith(`/content-management/courses/${courseId}/audiences/${audienceId}/configure`)
		})

		it('should pass to next if error occurs on update', async () => {
			req.params.audienceId = audienceId
			const gradeCode = 'AA'
			req.body = {grades: gradeCode}
			const audience = {id: audienceId, grades: []}
			res.locals.course = {audiences: [audience], id: courseId}
			res.locals.audience = audience

			csrsService.isGradeCodeValid = sinon.stub().returns(true)
			audienceService.getAudienceName = sinon.stub().returns('my audience name')
			learningCatalogue.updateAudience = sinon.stub().returns(Promise.reject(error))

			await audienceController.setGrades()(req, res, next)

			expect(learningCatalogue.updateAudience).to.have.been.calledOnceWith(courseId, audience)

			expect(next).to.have.been.calledOnceWith(error)
		})
	})

	describe('#deleteGrades', () => {
		it('should update course with empty grades array and redirect to audience configuration page', async () => {
			req.params.audienceId = audienceId
			const audience = {id: audienceId, grades: ['some grade']}
			res.locals.course = {audiences: [audience], id: courseId}
			res.locals.audience = audience

			learningCatalogue.updateAudience = sinon.stub().returns(Promise.resolve(res.locals.course))
			audienceService.getAudienceName = sinon.stub().returns('my audience name')

			await audienceController.deleteGrades()(req, res, next)

			expect(learningCatalogue.updateAudience).to.have.been.calledOnceWith(courseId, audience)

			expect(res.redirect).to.have.been.calledOnceWith(`/content-management/courses/${courseId}/audiences/${audienceId}/configure`)
		})

		it('should pass to next if error occurs on update', async () => {
			req.params.audienceId = audienceId
			const audience = {id: audienceId, grades: ['some grade']}
			res.locals.course = {audiences: [audience], id: courseId}
			res.locals.audience = audience

			learningCatalogue.updateAudience = sinon.stub().returns(Promise.reject(error))
			audienceService.getAudienceName = sinon.stub().returns('my audience name')

			await audienceController.deleteGrades()(req, res, next)

			expect(learningCatalogue.updateAudience).to.have.been.calledOnceWith(courseId, audience)

			expect(next).to.have.been.calledOnceWith(error)
		})
	})

	describe('#getCoreLearning', () => {
		it('should render add-core-learning page', async () => {
			csrsService.getCoreLearning = sinon.stub()
			await audienceController.getCoreLearning()(req, res)
			expect(res.render).to.have.been.calledOnceWith('page/course/audience/add-core-learning')
		})
	})

	describe('#setCoreLearning', () => {
		it('should update course with interests if the interest codes are valid and redirect to audience configuration page', async () => {
			req.params.audienceId = audienceId
			const interestCode = 'AA'
			req.body = {interests: interestCode}
			const audience = {id: audienceId, interests: []}
			res.locals.course = {audiences: [audience], id: courseId}
			res.locals.audience = audience

			csrsService.isCoreLearningValid = sinon.stub().returns(true)
			learningCatalogue.updateAudience = sinon.stub().returns(Promise.resolve(res.locals.course))
			audienceService.getAudienceName = sinon.stub().returns('my audience name')

			await audienceController.setCoreLearning()(req, res, next)

			expect(learningCatalogue.updateAudience).to.have.been.calledOnceWith(courseId, audience)

			expect(res.redirect).to.have.been.calledOnceWith(`/content-management/courses/${courseId}/audiences/${audienceId}/configure`)
		})

		it('should pass to next if error occurs on update', async () => {
			req.params.audienceId = audienceId
			const interestCode = 'AA'
			req.body = {interests: interestCode}
			const audience = {id: audienceId, interests: []}
			res.locals.course = {audiences: [audience], id: courseId}
			res.locals.audience = audience

			csrsService.isCoreLearningValid = sinon.stub().returns(true)
			audienceService.getAudienceName = sinon.stub().returns('my audience name')
			learningCatalogue.updateAudience = sinon.stub().returns(Promise.reject(error))

			await audienceController.setCoreLearning()(req, res, next)

			expect(learningCatalogue.updateAudience).to.have.been.calledOnceWith(courseId, audience)

			expect(next).to.have.been.calledOnceWith(error)
		})
	})

	describe('#deleteCoreLearning', () => {
		it('should update course with empty interests array and redirect to audience configuration page', async () => {
			req.params.audienceId = audienceId
			const audience = {id: audienceId, interests: ['some interest']}
			res.locals.course = {audiences: [audience], id: courseId}
			res.locals.audience = audience

			learningCatalogue.updateAudience = sinon.stub().returns(Promise.resolve(res.locals.course))

			await audienceController.deleteCoreLearning()(req, res, next)

			expect(learningCatalogue.updateAudience).to.have.been.calledOnceWith(courseId, audience)

			expect(res.redirect).to.have.been.calledOnceWith(`/content-management/courses/${courseId}/audiences/${audienceId}/configure`)
		})

		it('should pass to next if error occurs on update', async () => {
			req.params.audienceId = audienceId
			const audience = {id: audienceId, interests: ['some interest']}
			res.locals.course = {audiences: [audience], id: courseId}
			res.locals.audience = audience

			learningCatalogue.updateAudience = sinon.stub().returns(Promise.reject(error))

			await audienceController.deleteCoreLearning()(req, res, next)

			expect(learningCatalogue.updateAudience).to.have.been.calledOnceWith(courseId, audience)

			expect(next).to.have.been.calledOnceWith(error)
		})
	})

	describe('#getRequiredLearning', () => {
		it('should render required learning page', async () => {
			const exampleYear = new Date(Date.now()).getFullYear() + 1

			await audienceController.getRequiredLearning()(req, res)

			expect(res.render).to.have.been.calledOnceWith('page/course/audience/add-required-learning', {exampleYear: exampleYear})
		})
	})

	describe('#setRequiredLearning', () => {
		it('should update course and redirect to configure audience page', async () => {
			const course = new Course()
			const audience = new Audience()

			const year = '2020'
			const month = '01'
			const day = '02'
			const years = '1'
			const months = '6'

			const requiredBy = DateTime.yearMonthDayToDate(year, month, day).toDate()
			const frequency = moment.duration(parseInt(years) * 12 + parseInt(months), 'months')

			const data = {
				year,
				month,
				day,
				years,
				months,
			}
			req.body = data

			res.locals.course = course
			res.locals.audience = audience

			learningCatalogue.updateAudience = sinon.stub().resolves()

			await audienceController.setRequiredLearning()(req, res, next)

			expect(learningCatalogue.updateAudience).to.have.been.calledOnceWith(course.id, audience)
			expect(audience.requiredBy).to.eql(requiredBy)
			expect(audience.frequency).to.eql(frequency)
		})
	})

	describe('#deleteRequiredLearning', () => {
		it('should update audience and redirect to configure audience page', async () => {
			const course = new Course()
			course.id = 'courseId'
			const audience = new Audience()

			audience.type = Audience.Type.REQUIRED_LEARNING
			audience.requiredBy = new Date()
			audience.frequency = moment.duration()

			res.locals.course = course
			res.locals.audience = audience

			req.params.courseId = 'courseId'
			req.params.audienceId = 'audienceId'

			learningCatalogue.updateAudience = sinon.stub().returns(Promise.resolve(res.locals.course))

			await audienceController.deleteRequiredLearning()(req, res, next)

			expect(learningCatalogue.updateAudience).to.have.been.calledOnceWith('courseId', audience)
			expect(res.redirect).to.have.been.calledOnceWith(`/content-management/courses/courseId/audiences/audienceId/configure`)
			expect(audience.type).to.eql(Audience.Type.OPEN)
			expect(audience.requiredBy).to.eql(undefined)
			expect(audience.frequency).to.eql(undefined)
		})
	})
})
