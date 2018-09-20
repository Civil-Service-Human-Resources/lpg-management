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

chai.use(sinonChai)

describe('AudienceController', function() {
	let audienceController: AudienceController
	let learningCatalogue: LearningCatalogue
	let audienceValidator: Validator<Audience>
	let audienceFactory: AudienceFactory
	let csrsService: CsrsService
	let req: Request
	let res: Response

	beforeEach(() => {
		learningCatalogue = <LearningCatalogue>{}
		audienceValidator = <Validator<Audience>>{}
		audienceFactory = <AudienceFactory>{}
		csrsService = <CsrsService>{}
		audienceController = new AudienceController(
			learningCatalogue,
			audienceValidator,
			audienceFactory,
			new CourseService(learningCatalogue),
			csrsService
		)

		req = mockReq()
		req.session!.save = callback => {
			callback(undefined)
		}
		res = mockRes()
	})

	describe('#getAudienceName', function() {
		it('should render audience-name page', async function() {
			await audienceController.getAudienceName()(req, res)

			expect(res.render).to.have.been.calledOnceWith('page/course/audience/audience-name')
		})
	})

	describe('#setAudienceName', function() {
		it('should redirect back to audience name page if validation error', async function() {
			req.params.courseId = 'course-id'
			req.body = {name: ''}

			const errors = {size: 1}
			audienceValidator.check = sinon.stub().returns(errors)
			audienceFactory.create = sinon.stub().returns({})

			await audienceController.setAudienceName()(req, res)

			expect(audienceValidator.check).to.have.been.calledWith(req.body, ['audience.name'])
			expect(audienceValidator.check).to.have.returned(errors)
			expect(req.session!.sessionFlash.errors).to.be.equal(errors)
			expect(res.redirect).to.have.been.calledWith(`/content-management/courses/${req.params.courseId}/audience`)
		})

		it('should redirect to course overview page if audience created successfully', async function() {
			req.params.courseId = 'course-id'
			req.body = {name: 'audience name'}

			const errors = {size: 0}
			audienceValidator.check = sinon.stub().returns(errors)
			const audience = <Audience>{}
			audienceFactory.create = sinon.stub().returns(audience)
			learningCatalogue.createAudience = sinon.stub()

			await audienceController.setAudienceName()(req, res)

			expect(audienceValidator.check).to.have.been.calledWith(req.body, ['audience.name'])
			expect(audienceValidator.check).to.have.returned(errors)
			Object.is(req.session!.sessionFlash.errors, undefined)
			expect(learningCatalogue.createAudience).to.have.been.calledOnceWith(req.params.courseId, audience)
			expect(res.redirect).to.have.been.calledWith(
				`/content-management/courses/${req.params.courseId}/audience-type`
			)
		})
	})
})
