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
import {Request, Response} from 'express'
import {CourseService} from '../../../../src/lib/courseService'
import {CsrsService} from '../../../../src/csrs/service/csrsService'
import {Module} from '../../../../src/learning-catalogue/model/module'
import moment = require('moment')

chai.use(sinonChai)

describe('AudienceController', () => {
	let audienceController: AudienceController
	let audienceFactory: AudienceFactory
	let audienceValidator: Validator<Audience>
	let csrsService: CsrsService
	let learningCatalogue: LearningCatalogue
	let courseService: CourseService
	let req: Request
	let res: Response

	const courseId = 'course-id'
	const audienceId = 'audience-id'

	beforeEach(() => {
		learningCatalogue = <LearningCatalogue>{}
		csrsService = <CsrsService>{}
		courseService = new CourseService(learningCatalogue)
		audienceFactory = new AudienceFactory()
		audienceValidator = new Validator(audienceFactory)
		audienceController = new AudienceController(
			learningCatalogue,
			audienceValidator,
			audienceFactory,
			courseService,
			csrsService
		)

		req = mockReq()
		req.session!.save = callback => {
			callback(undefined)
		}
		req.params.courseId = courseId

		res = mockRes()
	})

	describe('#getAudienceName', () => {
		it('should render audience-name page', async function() {
			await audienceController.getAudienceName()(req, res)

			expect(res.render).to.have.been.calledOnceWith('page/course/audience/audience-name')
		})
	})

	describe('#setAudienceName', () => {
		it('should redirect back to audience name page if validation error', async function() {
			req.body = {name: ''}

			const errors = {size: 1}
			audienceValidator.check = sinon.stub().returns(errors)
			audienceFactory.create = sinon.stub().returns({})

			await audienceController.setAudienceName()(req, res)

			expect(audienceValidator.check).to.have.been.calledWith(req.body, ['audience.name'])
			expect(audienceValidator.check).to.have.returned(errors)
			expect(req.session!.sessionFlash.errors).to.be.equal(errors)
			expect(res.redirect).to.have.been.calledWith(`/content-management/courses/${courseId}/audiences/`)
		})

		it('should redirect to audience type page if audience name validated successfully', async function() {
			req.body = {name: 'audience name'}

			const errors = {size: 0}
			audienceValidator.check = sinon.stub().returns(errors)
			const audience = <Audience>{}
			audienceFactory.create = sinon.stub().returns(audience)

			await audienceController.setAudienceName()(req, res)

			expect(audienceValidator.check).to.have.been.calledWith(req.body, ['audience.name'])
			expect(audienceValidator.check).to.have.returned(errors)
			expect(req.session!.sessionFlash.errors).to.be.undefined
			expect(res.redirect).to.have.been.calledWith(`/content-management/courses/${courseId}/audiences/type`)
		})
	})

	describe('#getAudienceType', () => {
		it('should render audience-type page', async function() {
			await audienceController.getAudienceType()(req, res)

			expect(res.render).to.have.been.calledOnceWith('page/course/audience/audience-type')
		})
	})

	describe('#setAudienceType', () => {
		it('should redirect back to audience type page if validation error', async function() {
			req.body = {type: ''}

			const errors = {size: 1}
			audienceValidator.check = sinon.stub().returns(errors)
			audienceFactory.create = sinon.stub().returns({})

			await audienceController.setAudienceType()(req, res)

			expect(audienceValidator.check).to.have.been.calledWith(req.body, ['audience.type'])
			expect(audienceValidator.check).to.have.returned(errors)
			expect(req.session!.sessionFlash.errors).to.be.equal(errors)
			expect(req.session!.sessionFlash.errors).to.be.equal(errors)
			expect(res.redirect).to.have.been.calledWith(`/content-management/courses/${courseId}/audiences/type`)
		})

		it('should redirect to audience configuration page if audience created successfully', async function() {
			req.body = {name: 'audience name', type: 'OPEN'}

			const errors = {size: 0}
			audienceValidator.check = sinon.stub().returns(errors)
			const audience = <Audience>{}
			audienceFactory.create = sinon.stub().returns(audience)
			const newAudienceId = 'new-audience-id'
			learningCatalogue.createAudience = sinon.stub().returns({id: newAudienceId})

			await audienceController.setAudienceType()(req, res)

			expect(audienceValidator.check).to.have.been.calledWith(req.body, ['audience.type'])
			expect(audienceValidator.check).to.have.returned(errors)
			expect(req.session!.sessionFlash).to.be.undefined
			expect(learningCatalogue.createAudience).to.have.been.calledOnceWith(courseId, audience)
			expect(res.redirect).to.have.been.calledWith(
				`/content-management/courses/${courseId}/audiences/${newAudienceId}/configure`
			)
		})
	})

	describe('#getConfigureAudience', () => {
		it('should render audience configuration page', async function() {
			req.params.audienceId = audienceId
			res.locals.audience = {departments: []}

			csrsService.getOrganisations = sinon.stub()
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
		it('should redirect to course overview page after deleting the audience', async function() {
			req.params.audienceId = audienceId

			learningCatalogue.deleteAudience = sinon.stub()

			await audienceController.deleteAudience()(req, res)

			expect(learningCatalogue.deleteAudience).to.have.been.calledOnceWith(courseId, audienceId)
			expect(res.redirect).to.have.been.calledOnceWith(`/content-management/courses/${courseId}/overview`)
		})
	})

	describe('#getOrganisation', () => {
		it('should render add-organisation page', async function() {
			csrsService.getOrganisations = sinon.stub()
			await audienceController.getOrganisation()(req, res)

			expect(res.render).to.have.been.calledOnceWith('page/course/audience/add-organisation')
		})
	})

	describe('#setOrganisation', () => {
		it('should update course audience with selected organisation code', async function() {
			req.params.audienceId = audienceId

			const hmrcName = 'HM Revenue & Customs'
			req.body = {organisation: 'selected', 'input-autocomplete': hmrcName}

			const audience = {id: audienceId, departments: []}
			res.locals.course = {audiences: [audience]}
			res.locals.audience = audience

			const hmrcCode = 'hmrc'
			csrsService.getOrganisations = sinon
				.stub()
				.returns({_embedded: {organisationalUnits: [{code: hmrcCode, name: hmrcName}]}})
			learningCatalogue.updateCourse = sinon.stub()

			await audienceController.setOrganisation()(req, res)

			expect(learningCatalogue.updateCourse).to.have.been.calledOnceWith({
				audiences: [{id: audienceId, departments: [hmrcCode]}],
			})
			expect(res.redirect).to.have.been.calledOnceWith(
				`/content-management/courses/${courseId}/audiences/${audienceId}/configure`
			)
		})

		it('should update course audience with all organisation codes if "all" is selected', async function() {
			req.params.audienceId = audienceId
			req.body = {organisation: 'all', 'input-autocomplete': ''}
			const audience = {id: audienceId, departments: []}
			res.locals.course = {audiences: [audience]}
			res.locals.audience = audience

			const hmrcCode = 'hmrc'
			const dwpCode = 'dwp'
			csrsService.getOrganisations = sinon.stub().returns({
				_embedded: {
					organisationalUnits: [
						{code: hmrcCode, name: 'HM Revenue & Customs'},
						{code: dwpCode, name: 'Department for Work and Pensions'},
					],
				},
			})
			learningCatalogue.updateCourse = sinon.stub()

			await audienceController.setOrganisation()(req, res)

			expect(learningCatalogue.updateCourse).to.have.been.calledOnceWith({
				audiences: [{id: audienceId, departments: [hmrcCode, dwpCode]}],
			})
			expect(res.redirect).to.have.been.calledOnceWith(
				`/content-management/courses/${courseId}/audiences/${audienceId}/configure`
			)
		})
	})

	describe('#deleteOrganisation', () => {
		it('should update course audience with empty list of organisations and redirect to audience configuration page', async function() {
			req.params.audienceId = audienceId
			const audience = {id: audienceId, departments: ['hmrc']}
			res.locals.course = {audiences: [audience]}
			res.locals.audience = audience

			learningCatalogue.updateCourse = sinon.stub()

			await audienceController.deleteOrganisation()(req, res)

			expect(learningCatalogue.updateCourse).to.have.been.calledOnceWith({
				audiences: [{id: audienceId, departments: []}],
			})
			expect(res.redirect).to.have.been.calledOnceWith(
				`/content-management/courses/${courseId}/audiences/${audienceId}/configure`
			)
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
			res.locals.course = {audiences: [audience]}
			res.locals.audience = audience

			csrsService.isAreaOfWorkValid = sinon.stub().returns(true)
			learningCatalogue.updateCourse = sinon.stub()

			await audienceController.setAreasOfWork()(req, res)

			expect(learningCatalogue.updateCourse).to.have.been.calledOnceWith({
				audiences: [{id: audienceId, areasOfWork: [aowHumanResources]}],
			})
			expect(res.redirect).to.have.been.calledOnceWith(
				`/content-management/courses/${courseId}/audiences/${audienceId}/configure`
			)
		})
	})

	describe('#deleteAreasOfWork', () => {
		it('should update course with empty areas of work array and redirect to audience configuration page', async () => {
			req.params.audienceId = audienceId
			const audience = {id: audienceId, areasOfWork: ['some area of work']}
			res.locals.course = {audiences: [audience]}
			res.locals.audience = audience

			learningCatalogue.updateCourse = sinon.stub()

			await audienceController.deleteAreasOfWork()(req, res)

			expect(learningCatalogue.updateCourse).to.have.been.calledOnceWith({
				audiences: [{id: audienceId, areasOfWork: []}],
			})
			expect(res.redirect).to.have.been.calledOnceWith(
				`/content-management/courses/${courseId}/audiences/${audienceId}/configure`
			)
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
			res.locals.course = {audiences: [audience]}
			res.locals.audience = audience

			csrsService.isGradeCodeValid = sinon.stub().returns(true)
			learningCatalogue.updateCourse = sinon.stub()

			await audienceController.setGrades()(req, res)

			expect(learningCatalogue.updateCourse).to.have.been.calledOnceWith({
				audiences: [{id: audienceId, grades: [gradeCode]}],
			})
			expect(res.redirect).to.have.been.calledOnceWith(
				`/content-management/courses/${courseId}/audiences/${audienceId}/configure`
			)
		})
	})

	describe('#deleteGrades', () => {
		it('should update course with empty grades array and redirect to audience configuration page', async () => {
			req.params.audienceId = audienceId
			const audience = {id: audienceId, grades: ['some grade']}
			res.locals.course = {audiences: [audience]}
			res.locals.audience = audience

			learningCatalogue.updateCourse = sinon.stub()

			await audienceController.deleteGrades()(req, res)

			expect(learningCatalogue.updateCourse).to.have.been.calledOnceWith({
				audiences: [{id: audienceId, grades: []}],
			})
			expect(res.redirect).to.have.been.calledOnceWith(
				`/content-management/courses/${courseId}/audiences/${audienceId}/configure`
			)
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
			res.locals.course = {audiences: [audience]}
			res.locals.audience = audience

			csrsService.isCoreLearningValid = sinon.stub().returns(true)
			learningCatalogue.updateCourse = sinon.stub()

			await audienceController.setCoreLearning()(req, res)

			expect(learningCatalogue.updateCourse).to.have.been.calledOnceWith({
				audiences: [{id: audienceId, interests: [interestCode]}],
			})
			expect(res.redirect).to.have.been.calledOnceWith(
				`/content-management/courses/${courseId}/audiences/${audienceId}/configure`
			)
		})
	})

	describe('#deleteCoreLearning', () => {
		it('should update course with empty interests array and redirect to audience configuration page', async () => {
			req.params.audienceId = audienceId
			const audience = {id: audienceId, interests: ['some interest']}
			res.locals.course = {audiences: [audience]}
			res.locals.audience = audience

			learningCatalogue.updateCourse = sinon.stub()

			await audienceController.deleteCoreLearning()(req, res)

			expect(learningCatalogue.updateCourse).to.have.been.calledOnceWith({
				audiences: [{id: audienceId, interests: []}],
			})
			expect(res.redirect).to.have.been.calledOnceWith(
				`/content-management/courses/${courseId}/audiences/${audienceId}/configure`
			)
		})
	})

	describe('#getDeadlineAndFrequency', () => {
		it('should render add deadline page', async () => {
			res.locals.audience = {}
			await audienceController.getDeadlineAndFrequency()(req, res)
			expect(res.render).to.have.been.calledOnceWith('page/course/audience/add-deadline-and-frequency')
		})
	})

	describe('#setDeadlineAndFrequency', () => {
		it('should update course with deadline date if the date is valid and redirect to audience configuration page', async () => {
			req.params.audienceId = audienceId
			const audience = {id: audienceId, requiredBy: null}
			res.locals.course = {audiences: [audience]}
			res.locals.audience = audience
			req.body = {'deadline-year': '2018', 'deadline-month': '12', 'deadline-day': '16'}

			learningCatalogue.updateCourse = sinon.stub()

			await audienceController.setDeadlineAndFrequency()(req, res)

			expect(learningCatalogue.updateCourse).to.have.been.calledOnceWith({
				audiences: [{id: audienceId, requiredBy: moment('2018-12-16').toDate()}],
			})
			expect(res.redirect).to.have.been.calledOnceWith(
				`/content-management/courses/${courseId}/audiences/${audienceId}/configure`
			)
		})

		it('should error when deadline date is in the past', async () => {
			req.params.audienceId = audienceId
			const audience = {id: audienceId, requiredBy: null}
			res.locals.course = {audiences: [audience]}
			res.locals.audience = audience
			req.body = {'deadline-year': '1999', 'deadline-month': '1', 'deadline-day': '1'}

			await audienceController.setDeadlineAndFrequency()(req, res)

			expect(req.session!.sessionFlash.errors).is.not.undefined
			expect(res.redirect).to.have.been.calledOnceWith(
				`/content-management/courses/${courseId}/audiences/${audienceId}/deadline-and-frequency`
			)
		})
	})

	describe('#deleteDeadlineAndFrequency', () => {
		it('should update course with null deadline and redirect to audience configuration page', async () => {
			req.params.audienceId = audienceId
			const audience = {id: audienceId, requiredBy: new Date()}
			res.locals.course = {audiences: [audience]}
			res.locals.audience = audience

			learningCatalogue.updateCourse = sinon.stub()

			await audienceController.deleteDeadlineAndFrequency()(req, res)

			expect(learningCatalogue.updateCourse).to.have.been.calledOnceWith({
				audiences: [{id: audienceId, requiredBy: undefined, frequency: undefined}],
			})
		})
	})

	describe('#getPrivateCourseEvent', () => {
		it('should gather events from all face-to-face modules into an events array and render add event page', async () => {
			const dateRanges = [{date: '2018-10-08'}]
			res.locals.course = {
				modules: [
					{type: Module.Type.FACE_TO_FACE, events: undefined},
					{type: Module.Type.FACE_TO_FACE, events: [{id: 1, dateRanges}, {id: 2, dateRanges}]},
					{type: Module.Type.FACE_TO_FACE, events: [{id: 3, dateRanges}]},
				],
			}

			await audienceController.getPrivateCourseEvent()(req, res)

			expect(res.render).to.have.been.calledOnceWith('page/course/audience/add-event', {
				courseEvents: [{id: 1, dateRanges}, {id: 2, dateRanges}, {id: 3, dateRanges}],
			})
		})
	})

	describe('#setPrivateCourseEvent', () => {
		it('should update audience with selected event ID and redirect to audience configuration page', async () => {
			const eventId = 'event-id'
			req.body.events = eventId
			req.params.audienceId = audienceId
			const audience = {id: audienceId, eventId: null}
			res.locals.course = {audiences: [audience]}
			res.locals.audience = audience

			courseService.getAllEventsOnCourse = sinon.stub().returns([{id: eventId}])
			learningCatalogue.updateCourse = sinon.stub()

			await audienceController.setPrivateCourseEvent()(req, res)

			expect(audience.eventId).to.be.equal(eventId)
			expect(learningCatalogue.updateCourse).to.have.been.calledOnceWith({
				audiences: [{id: audienceId, eventId: eventId}],
			})
			expect(res.redirect).to.have.been.calledOnceWith(
				`/content-management/courses/${courseId}/audiences/${audienceId}/configure`
			)
		})
	})

	describe('#deletePrivateCourseEvent', () => {
		it('should update audience with null event ID and redirect to audience configuration page', async () => {
			req.params.audienceId = audienceId
			const audience = {id: audienceId, eventId: 'event-id'}
			res.locals.course = {audiences: [audience]}
			res.locals.audience = audience

			learningCatalogue.updateCourse = sinon.stub()

			await audienceController.deletePrivateCourseEvent()(req, res)

			expect(learningCatalogue.updateCourse).to.have.been.calledOnceWith({
				audiences: [{id: audienceId, eventId: undefined}],
			})
			expect(res.redirect).to.have.been.calledOnceWith(
				`/content-management/courses/${courseId}/audiences/${audienceId}/configure`
			)
		})
	})
})
