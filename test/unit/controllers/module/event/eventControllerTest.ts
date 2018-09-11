import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import {beforeEach} from 'mocha'
import {EventController} from '../../../../../src/controllers/module/event/eventController'
import {LearningCatalogue} from '../../../../../src/learning-catalogue'
import {Validator} from '../../../../../src/learning-catalogue/validator/validator'
import {Event} from '../../../../../src/learning-catalogue/model/event'
import {EventFactory} from '../../../../../src/learning-catalogue/model/factory/eventFactory'
import {mockReq, mockRes} from 'sinon-express-mock'
import {Request, Response} from 'express'
import {expect} from 'chai'
import * as sinon from 'sinon'
import {Module} from '../../../../../src/learning-catalogue/model/module'
import * as datetime from '../../../../../src/lib/datetime'

chai.use(sinonChai)

describe('Event Controller Test', function() {
	let eventController: EventController
	let learningCatalouge: LearningCatalogue
	let eventValidator: Validator<Event>
	let eventFactory: EventFactory

	beforeEach(() => {
		learningCatalouge = <LearningCatalogue>{}
		eventValidator = <Validator<Event>>{}
		eventFactory = <EventFactory>{}

		eventController = new EventController(learningCatalouge, eventValidator, eventFactory)
	})

	it('shoulder render events page', async function() {
		const getDateTime: (request: Request, response: Response) => void = eventController.getDateTime()

		const request: Request = mockReq()
		const response: Response = mockRes()

		await getDateTime(request, response)

		expect(response.render).to.have.been.calledOnceWith('page/course/module/events/events')
	})

	it('should check for errors, create event and and redirect to event preview page', async function() {
		const event = new Event()
		event.id = 'ghi'

		const setDateTime: (request: Request, response: Response) => void = eventController.setDateTime()

		const request: Request = mockReq()
		const response: Response = mockRes()

		request.body = {
			'start-date-day': '20',
			'start-date-month': '12',
			'start-date-year': '2030',
			'start-time': ['09', '00'],
			'end-time': ['17', '00'],
		}

		request.params.courseId = 'abc'
		request.params.moduleId = 'def'

		eventFactory.create = sinon.stub().returns(event)
		eventValidator.check = sinon.stub().returns({fields: [], size: 0})
		learningCatalouge.createEvent = sinon.stub().returns(event)

		await setDateTime(request, response)

		expect(eventValidator.check).to.have.been.calledOnce
		expect(eventFactory.create).to.have.been.calledOnce
		expect(learningCatalouge.createEvent).to.have.been.calledOnceWith('abc', 'def', event)
		expect(response.redirect).to.have.been.calledWith(
			`/content-management/courses/abc/modules/def/events-preview/ghi`
		)
	})

	it('should check for errors, update event and and redirect to event preview page', async function() {
		const event = new Event()
		event.id = 'ghi'

		const setDateTime: (request: Request, response: Response) => void = eventController.setDateTime()

		const request: Request = mockReq()
		const response: Response = mockRes()

		request.body = {
			'start-date-day': '20',
			'start-date-month': '12',
			'start-date-year': '2030',
			'start-time': ['09', '00'],
			'end-time': ['17', '00'],
		}

		event.dateRanges = datetime.parseDate(request.body)

		request.params.courseId = 'abc'
		request.params.moduleId = 'def'
		request.params.eventId = 'ghi'

		response.locals.event = event

		eventFactory.create = sinon.stub().returns(event)
		eventValidator.check = sinon.stub().returns({fields: [], size: 0})
		learningCatalouge.updateEvent = sinon.stub().returns(event)

		await setDateTime(request, response)

		expect(eventValidator.check).to.have.been.calledOnce
		expect(eventFactory.create).to.have.been.calledOnce
		expect(learningCatalouge.updateEvent).to.have.been.calledOnceWith('abc', 'def', 'ghi', event)
		expect(response.redirect).to.have.been.calledWith(
			`/content-management/courses/abc/modules/def/events-preview/ghi`
		)
	})

	it('should check for errors and redirect to events page', async function() {
		const module = new Module()
		const event = new Event()

		const setDateTime: (request: Request, response: Response) => void = eventController.setDateTime()

		const request: Request = mockReq()
		const response: Response = mockRes()

		request.body = {
			'start-date-day': '',
			'start-date-month': '',
			'start-date-year': '',
			'start-time': ['07', '00'],
			'end-time': ['06', '00'],
		}

		request.params.courseId = 'abc'
		request.params.moduleId = 'def'

		eventFactory.create = sinon.stub().returns(event)
		eventValidator.check = sinon.stub().returns({fields: ['validation.module.event.dateRanges.empty'], size: 1})
		learningCatalouge.createEvent = sinon.stub().returns(module)

		await setDateTime(request, response)

		expect(eventValidator.check).to.have.been.calledOnce
		expect(eventFactory.create).to.have.been.calledOnce
		expect(response.redirect).to.have.been.calledWith(`/content-management/courses/abc/modules/def/events/`)
	})

	it('should render event preview page', async function() {
		const getDatePreview: (request: Request, response: Response) => void = eventController.getDatePreview()

		const request: Request = mockReq()
		const response: Response = mockRes()

		await getDatePreview(request, response)

		expect(response.render).to.have.been.calledOnceWith('page/course/module/events/events-preview')
	})

	it('should render event overview page', async function() {
		let event: Event = new Event()
		event.dateRanges = [{date: '2019-02-01', startTime: '9:00:00', endTime: '17:00:00'}]

		const getEventOverview: (request: Request, response: Response) => void = eventController.getEventOverview()

		const request: Request = mockReq()
		const response: Response = mockRes()

		response.locals.event = event

		await getEventOverview(request, response)

		expect(response.render).to.have.been.calledWith('page/course/module/events/events-overview')
	})
})
