import * as chai from 'chai'
import {expect} from 'chai'
import * as sinonChai from 'sinon-chai'
import {beforeEach, describe} from 'mocha'
import {EventController} from '../../../../../src/controllers/module/event/eventController'
import {LearningCatalogue} from '../../../../../src/learning-catalogue'
import {Validator} from '../../../../../src/learning-catalogue/validator/validator'
import {Event} from '../../../../../src/learning-catalogue/model/event'
import {EventFactory} from '../../../../../src/learning-catalogue/model/factory/eventFactory'
import {mockReq, mockRes} from 'sinon-express-mock'
import {NextFunction, Request, Response} from 'express'
import * as sinon from 'sinon'
import {DateRange} from '../../../../../src/learning-catalogue/model/dateRange'
import {DateRangeCommand} from '../../../../../src/controllers/command/dateRangeCommand'
import {DateRangeCommandFactory} from '../../../../../src/controllers/command/factory/dateRangeCommandFactory'
import {Venue} from '../../../../../src/learning-catalogue/model/venue'
import {LearnerRecord} from '../../../../../src/learner-record'
import {Course} from '../../../../../src/learning-catalogue/model/course'
import {Module} from '../../../../../src/learning-catalogue/model/module'
import {CslServiceClient} from '../../../../../src/csl-service/client'
import {EventOverview} from '../../../../../src/csl-service/model/management/EventOverview'
import {BookingOverviewPageModel} from '../../../../../src/controllers/module/event/model/BookingOverviewPageModel'

chai.use(sinonChai)

describe('EventController', function() {
	let eventController: EventController
	let learningCatalogue: LearningCatalogue
	let learnerRecord: LearnerRecord
	let eventValidator: Validator<Event>
	let eventFactory: EventFactory
	let dateRangeCommandValidator: Validator<DateRangeCommand>
	let dateRangeValidator: Validator<DateRange>
	let dateRangeCommandFactory: DateRangeCommandFactory
	let cslService: CslServiceClient
	let next: NextFunction
	let error: Error

	beforeEach(() => {
		learningCatalogue = <LearningCatalogue>{}
		learnerRecord = <LearnerRecord>{}
		eventValidator = <Validator<Event>>{}
		eventFactory = <EventFactory>{}
		dateRangeCommandValidator = <Validator<DateRangeCommand>>{}
		dateRangeValidator = <Validator<DateRange>>{}
		dateRangeCommandFactory = <DateRangeCommandFactory>{}
		cslService = <CslServiceClient>{}

		eventController = new EventController(
			learningCatalogue,
			learnerRecord,
			eventValidator,
			eventFactory,
			dateRangeCommandValidator,
			dateRangeValidator,
			dateRangeCommandFactory,
			cslService
		)

		next = sinon.stub()
		error = new Error()
	})

	describe('date time paths', function() {
		it('shoulder render events page', async function() {
			const res: Response = mockRes()

			await eventController.getDateTime()(mockReq(), res)

			expect(res.render).to.have.been.calledOnceWith('page/course/module/events/events')
		})

		it('should check for errors and redirect to event date time page', async function() {
			const req: Request = mockReq()
			const res: Response = mockRes()

			req.body = {
				day: '20',
				month: '12',
				year: '2030',
				startTime: ['09', '00'],
				endTime: ['17', '00'],
			}

			req.params.courseId = 'abc'
			req.params.moduleId = 'def'

			const dateRange = <DateRange>{}
			const dateRangeCommand = <DateRangeCommand>{}
			dateRangeCommand.asDateRange = sinon.stub().returns(dateRange)
			dateRangeCommandFactory.create = sinon.stub().returns(dateRangeCommand)
			dateRangeCommandValidator.check = sinon.stub().returns({fields: [], size: 0})
			dateRangeValidator.check = sinon.stub().returns({fields: [], size: 0})

			const event = new Event()
			eventFactory.create = sinon.stub().returns(event)

			await eventController.setDateTime()(req, res)

			expect(dateRangeCommandValidator.check).to.have.been.calledOnceWith(req.body)
			expect(res.render).to.have.been.calledWith('page/course/module/events/events', {
				courseId: 'abc',
				event: event,
				eventJson: JSON.stringify(event),
				moduleId: 'def',
			})
		})

		it('should render errors in DateRangeCommand', async function() {
			const req: Request = mockReq()
			const res: Response = mockRes()

			req.body = {
				day: '',
				month: '1',
				year: '2019',
				startTime: ['07', '00'],
				endTime: ['06', '00'],
			}

			const errors = {fields: {day: ['error']}, size: 1}
			dateRangeCommandValidator.check = sinon.stub().returns(errors)

			const event = new Event()
			eventFactory.create = sinon.stub().returns(event)

			await eventController.setDateTime()(req, res)

			expect(res.render).to.have.been.calledWith('page/course/module/events/events', {
				courseId: undefined,
				errors: errors,
				event: event,
				eventJson: JSON.stringify(event),
				moduleId: undefined,
			})
		})

		it('should render errors in DateRange', async function() {
			const req: Request = mockReq()
			const res: Response = mockRes()

			req.body = {
				day: '',
				month: '1',
				year: '2019',
				startTime: ['07', '00'],
				endTime: ['06', '00'],
			}

			dateRangeCommandValidator.check = sinon.stub().returns({})

			const event = new Event()
			eventFactory.create = sinon.stub().returns(event)

			const errors = {fields: {day: ['error']}, size: 1}
			dateRangeValidator.check = sinon.stub().returns(errors)

			const dateRangeCommand = new DateRangeCommand()
			dateRangeCommand.startTime = ['09:00']
			dateRangeCommand.endTime = ['17:00']
			dateRangeCommandFactory.create = sinon.stub().returns(dateRangeCommand)

			await eventController.setDateTime()(req, res)

			expect(res.render).to.have.been.calledOnceWith('page/course/module/events/events', {
				courseId: undefined,
				event: event,
				eventJson: JSON.stringify(event),
				errors: errors,
				moduleId: undefined,
			})
		})
	})

	describe('location paths', function() {
		it('should render location pagefor add', async function() {
			const res: Response = mockRes()

			await eventController.getLocation()(mockReq(), res)
			expect(res.render).to.have.been.calledOnceWith('page/course/module/events/event-location', {
				courseId: undefined,
				event: {},
				eventJson: undefined,
				moduleId: undefined,
			})
		})

		it('should render location pagefor edit', async function() {
			const res: Response = mockRes()

			await eventController.getLocation()(mockReq(), res)
			expect(res.render).to.have.been.calledOnceWith('page/course/module/events/event-location')
		})

		it('should create event and redirect to events overview page if no errors', async function() {
			const req: Request = mockReq()
			const res: Response = mockRes()
			let next: NextFunction

			req.params.courseId = 'course-id'
			req.params.moduleId = 'module-id'

			const venue = <Venue>{
				location: 'London',
				address: 'Victoria Street',
				capacity: 10,
				minCapacity: 5,
			}

			const event = {
				id: 'event-id',
				venue: venue,
				dateRanges: [],
				status: 'Active',
				cancellationReason: 'The event is no longer available',
			}

			req.body = {
				location: venue.location,
				address: venue.address,
				capacity: venue.capacity,
				minCapacity: venue.minCapacity,
				eventJson: JSON.stringify(event),
			}

			event.venue = venue

			eventValidator.check = sinon.stub().returns({fields: [], size: 0})
			learningCatalogue.createEvent = sinon.stub().returns(Promise.resolve(event))

			learnerRecord.createEvent = sinon.stub().returns(Promise.resolve(event))

			next = sinon.stub()

			await eventController.setLocation()(req, res, next)

			expect(learningCatalogue.createEvent).to.have.been.calledOnceWith(req.params.courseId, req.params.moduleId, event)
			expect(res.redirect).to.have.been.calledOnceWith(`/content-management/courses/course-id/modules/module-id/events-overview/event-id`)
		})

		it('should pass to next if error occurs when creating event', async function() {
			const req: Request = mockReq()
			const res: Response = mockRes()
			let next: NextFunction

			req.params.courseId = 'course-id'
			req.params.moduleId = 'module-id'

			const venue = <Venue>{
				location: 'London',
				address: 'Victoria Street',
				capacity: 10,
				minCapacity: 5,
			}

			const event = {
				id: 'event-id',
				venue: venue,
				dateRanges: [],
				status: 'Active',
				cancellationReason: 'The event is no longer available',
			}
			req.body = {
				location: venue.location,
				address: venue.address,
				capacity: venue.capacity,
				minCapacity: venue.minCapacity,
				eventJson: JSON.stringify(event),
			}

			event.venue = venue

			eventValidator.check = sinon.stub().returns({fields: [], size: 0})
			learningCatalogue.createEvent = sinon.stub().returns(Promise.resolve(event))

			const error: Error = new Error()
			learnerRecord.createEvent = sinon.stub().returns(Promise.reject(error))

			next = sinon.stub()

			await eventController.setLocation()(req, res, next)

			expect(learningCatalogue.createEvent).to.have.been.calledOnceWith(req.params.courseId, req.params.moduleId, event)
			expect(res.redirect).to.not.have.been.calledWith(`/content-management/courses/course-id/modules/module-id/events-overview/event-id`)
			expect(next).to.have.been.calledWith(error)
		})

		it('should update event and redirect to events overview page if no errors', async function() {
			const req: Request = mockReq()
			const res: Response = mockRes()

			req.params.courseId = 'course-id'
			req.params.moduleId = 'module-id'
			req.params.eventId = 'event-id'

			const venue = <Venue>{
				location: 'London',
				address: 'Victoria Street',
				capacity: 10,
				minCapacity: 5,
			}
			const event = {
				id: 'event-id',
				venue: {
					location: 'London',
					address: 'Victoria Street',
					capacity: 10,
					minCapacity: 5,
				},
				dateRanges: [
					{
						date: '2019-02-28',
						startTime: '09:00',
						endTime: '17:00',
					},
				],
			}
			res.locals.event = event
			req.body = {
				location: venue.location,
				address: venue.address,
				capacity: venue.capacity,
				minCapacity: venue.minCapacity,
			}

			eventValidator.check = sinon.stub().returns({fields: [], size: 0})
			learningCatalogue.updateEvent = sinon.stub().returns(Promise.resolve())

			await eventController.updateLocation()(req, res, next)

			expect(learningCatalogue.updateEvent).to.have.been.calledOnceWith(req.params.courseId, req.params.moduleId, req.params.eventId, event)
			expect(res.redirect).to.have.been.calledOnceWith(`/content-management/courses/course-id/modules/module-id/events-overview/event-id`)
		})

		it('should redirect back to location page if errors on create', async function() {
			const req: Request = mockReq()
			const res: Response = mockRes()
			let next: NextFunction

			const event: Event = new Event()

			req.params.courseId = 'courseId123'
			req.params.moduleId = 'moduleId123'
			req.body = {
				// required field 'location' missing to imitate error condition
				eventJson: JSON.stringify(new Event()),
			}

			const errors = {fields: [{location: ['validation.module.event.venue.location.empty']}], size: 1}

			eventValidator.check = sinon.stub().returns(errors)
			learningCatalogue.createEvent = sinon.stub().returns(event)
			next = sinon.stub()

			await eventController.setLocation()(req, res, next)

			expect(learningCatalogue.createEvent).to.not.have.been.called
			expect(res.render).to.have.been.calledOnceWith('page/course/module/events/event-location', {
				eventJson: req.body.eventJson,
				errors: errors,
			})
		})

		it('should redirect back to location page if errors on update', async function() {
			const req: Request = mockReq()
			const res: Response = mockRes()

			const event: Event = new Event()
			event.id = 'event-id'

			req.params.courseId = 'courseId123'
			req.params.moduleId = 'moduleId123'
			req.body = {
				location: '',
				address: 'Victoria Street',
				capacity: 10,
				minCapacity: 5,
			}

			const errors = {fields: [{location: ['validation.module.event.venue.location.empty']}], size: 1}

			eventValidator.check = sinon.stub().returns(errors)

			learningCatalogue.createEvent = sinon.stub().returns(event)

			await eventController.updateLocation()(req, res, next)

			expect(learningCatalogue.createEvent).to.not.have.been.called
			expect(res.render).to.have.been.calledOnceWith('page/course/module/events/event-location', {
				errors: errors,
				location: '',
				address: 'Victoria Street',
				capacity: 10,
				minCapacity: 5,
			})
		})
	})

	it('should render edit location page', async function() {
		const editLocation: (request: Request, response: Response) => void = eventController.editLocation()

		const request = mockReq()
		const response = mockRes()

		await editLocation(request, response)

		expect(response.render).to.have.been.calledOnceWith('page/course/module/events/event-location')
	})

	it('should render event overview page', async function() {
		const event: Event = new Event()
		event.dateRanges = [{date: '2019-02-01', startTime: '9:00:00', endTime: '17:00:00'}]

		const course: Course = new Course()
		const module: Module = new Module()

		const getEventOverview: (request: Request, response: Response) => void = eventController.getEventOverview()

		const request: Request = mockReq()
		const response: Response = mockRes()

		response.locals.event = event

		cslService.getEventOverview = sinon.stub().resolves({})

		await getEventOverview(request, response)

		expect(cslService.getEventOverview).to.have.been.calledOnceWith(course.id, module.id, event.id)
		expect(response.render).to.have.been.calledWith('page/course/module/events/events-overview')
	})

	it('Should invite user and redirect to event overview with success message', async () => {
		const request = mockReq()
		const response = mockRes()

		request.session!.save = callback => {
			callback(undefined)
		}

		request.body.learnerEmail = 'test@test.com'
		request.user = {accessToken: 'test-token'}

		request.params.courseUid = 'courseId'
		request.params.moduleUid = 'moduleId'
		request.params.eventUid = 'eventId'

		const dateRange = new DateRange()
		dateRange.date = '01-01-2020'
		const dateRanges: DateRange[] = [dateRange]
		response.locals.event = {dateRanges}

		cslService.inviteLearnerToEvent = sinon.stub()

		await eventController.inviteLearner()(request, response)

		expect(response.redirect).to.have.been.calledOnceWith(`/content-management/courses/courseId/modules/moduleId/events-overview/eventId`)
		expect(request.session.sessionFlash.emailAddressFoundMessage).is.equal('email_address_found_message')
	})

	it('should redirect to event overview page with error if email format is invalid', async () => {
		const request = mockReq()
		const response = mockRes()

		request.session!.save = callback => {
			callback(undefined)
		}

		request.body.learnerEmail = 'test'
		request.user = {accessToken: 'test-token'}

		request.params.courseUid = 'courseId'
		request.params.moduleUid = 'moduleId'
		request.params.eventUid = 'eventId'

		await eventController.inviteLearner()(request, response)

		expect(response.redirect).to.have.been.calledOnceWith(`/content-management/courses/courseId/modules/moduleId/events-overview/eventId`)
		expect(request.session.sessionFlash.errors.fields.learnerEmail[0]).is.equal('validation_email_address_invalid')
	})

	it('should render attendee details page', async function() {
		const getAttendeeDetails: (request: Request, response: Response) => void = eventController.getAttendeeDetails()

		const request: Request = mockReq()
		const response: Response = mockRes()

		// @ts-ignore
		request.params.courseUid = 'course'
		request.params.moduleUid = 'module'
		request.params.eventUid = 'event'
		request.params.bookingUid = '99'
		const eventOverview = new EventOverview()
		eventOverview.id = 'eventId'
		eventOverview.dates = ['01 Jan 2026']
		eventOverview.status = 'status'
		eventOverview.cancellationReason = 'cancellationReason'
		eventOverview.moduleId = 'moduleId'
		eventOverview.moduleTitle = 'moduleTitle'
		eventOverview.courseId = 'courseId'
		eventOverview.courseTitle = 'courseTitle'
		eventOverview.courseStatus = 'courseStatus'
		eventOverview.venue =  {location: 'Bristol', address: 'Bristol', capacity: 2, minCapacity: 1, availability: 1}
		eventOverview.bookings = [{id: 99, status: 'REQUESTED', reference: 'ABCDEF', learnerEmail: 'email@email.com'}]
		cslService.getEventOverview = sinon.stub().resolves(eventOverview)

		const overview = new BookingOverviewPageModel(99, 'courseId',
			'moduleId', 'eventId', 'Bristol, 01 Jan 2026', 'moduleTitle', 'courseTitle',
			'courseStatus', 'ABCDEF', 'email@email.com', 'REQUESTED')

		await getAttendeeDetails(request, response)

		expect(cslService.getEventOverview).to.have.been.calledOnceWith('course', 'module', 'event')
		expect(response.render).to.have.been.calledOnceWith('page/course/module/events/attendee', {
			pageModel: overview
		})
	})

	it('should change booking status to confirmed and redirect to attendee page', async function() {
		const registerLearner: (request: Request, response: Response) => void = eventController.updateBooking()

		const request: Request = mockReq()
		const response: Response = mockRes()

		request.params.courseUid = 'courseUid'
		request.params.moduleUid = 'moduleUid'
		request.params.eventUid = 'eventUid'
		// @ts-ignore
		request.params.bookingUid = 99

		request.body.action = 'register'

		cslService.approveBooking = sinon.stub()

		await registerLearner(request, response)

		expect(response.redirect).to.have.been.calledOnceWith(`/content-management/courses/courseUid/modules/moduleUid/events/eventUid/attendee/99`)
		expect(cslService.approveBooking).to.have.been.calledOnceWith('courseUid', 'moduleUid', 'eventUid', 99)
	})

	it('should change booking status to cancelled and redirect to event overview page', async function() {
		const registerLearner: (request: Request, response: Response) => void = eventController.cancelBooking()

		const request: Request = mockReq()
		const response: Response = mockRes()

		request.params.courseUid = 'courseUid'
		request.params.moduleUid = 'moduleUid'
		request.params.eventUid = 'eventUid'
		// @ts-ignore
		request.params.bookingUid = 99

		request.body.reason = 'cancel'

		cslService.cancelBooking = sinon.stub().resolves({})
		await registerLearner(request, response)

		expect(response.redirect).to.have.been.calledOnceWith(`/content-management/courses/courseUid/modules/moduleUid/events-overview/eventUid`)
		expect(cslService.cancelBooking).to.have.been.calledOnceWith('courseUid', 'moduleUid', 'eventUid', 99)
	})

	it('should redirect to cancel attendee page if cancellation reason is not selected', async function() {
		const request: Request = mockReq()
		const response: Response = mockRes()

		request.session!.save = callback => {
			callback(undefined)
		}

		cslService.cancelBooking = sinon.stub().resolves({})

		const registerLearner: (request: Request, response: Response) => void = eventController.cancelBooking()

		request.params.courseUid = 'courseUid'
		request.params.moduleUid = 'moduleUid'
		request.params.eventUid = 'eventUid'
		// @ts-ignore
		request.params.bookingUid = 99

		request.body.cancellationReason = ''
		await registerLearner(request, response)

		expect(response.redirect).to.have.been.calledOnceWith(`/content-management/courses/courseUid/modules/moduleUid/events/eventUid/attendee/99/cancel`)
	})

	it('should render cancel event page', async function() {
		const course: Course = new Course()
		const module: Module = new Module()

		const request: Request = mockReq()
		const response: Response = mockRes()

		learningCatalogue.getCourse = sinon.stub().returns(course)
		learningCatalogue.getModule = sinon.stub().returns(module)

		learnerRecord.getCancellationReasons = sinon.stub()

		await eventController.cancelEvent()(request, response)

		expect(response.render).to.have.been.calledOnceWith('page/course/module/events/cancel')
	})

	it('should cancel event and redirect to events overview page', async function() {
		const event = new Event()

		const request: Request = mockReq()
		const response: Response = mockRes()

		request.body.cancellationReason = 'reason'

		request.params.eventUid = 'eventUid'
		request.params.courseUid = 'courseUid'
		request.params.moduleUid = 'moduleUid'

		response.locals.event = event

		cslService.cancelEvent = sinon.stub()
		request.session!.save = sinon
			.stub()
			.returns(response.redirect(`/content-management/courses/${request.params.courseUid}/modules/${request.params.moduleUid}/events-overview/${request.params.eventUid}`))

		await eventController.setCancelEvent()(request, response)

		expect(cslService.cancelEvent).to.have.been.calledOnceWith('courseUid', 'moduleUid', 'eventUid', 'reason')
		expect(response.redirect).to.have.been.calledOnceWith('/content-management/courses/courseUid/modules/moduleUid/events-overview/eventUid')
	})

	it('should render cancel attendee page', async function() {
		const getCancelAttendee: (request: Request, response: Response, next: NextFunction) => void = eventController.getCancelBooking()

		const request: Request = mockReq()
		const response: Response = mockRes()
		const next: NextFunction = sinon.stub()
		request.params.courseUid = 'course'
		request.params.moduleUid = 'module'
		request.params.eventUid = 'event'
		request.params.bookingUid = '99'
		const eventOverview = new EventOverview()
		eventOverview.id = 'eventId'
		eventOverview.dates = ['01 Jan 2026']
		eventOverview.status = 'status'
		eventOverview.cancellationReason = 'cancellationReason'
		eventOverview.moduleId = 'moduleId'
		eventOverview.moduleTitle = 'moduleTitle'
		eventOverview.courseId = 'courseId'
		eventOverview.courseTitle = 'courseTitle'
		eventOverview.courseStatus = 'courseStatus'
		eventOverview.venue =  {location: 'Bristol', address: 'Bristol', capacity: 2, minCapacity: 1, availability: 1}
		eventOverview.bookings = [{id: 99, status: 'REQUESTED', reference: 'ABCDEF', learnerEmail: 'email@email.com'}]
		cslService.getEventOverview = sinon.stub().resolves(eventOverview)

		const overview = new BookingOverviewPageModel(99, 'courseId',
			'moduleId', 'eventId', 'Bristol, 01 Jan 2026', 'moduleTitle', 'courseTitle',
			'courseStatus', 'ABCDEF', 'email@email.com', 'REQUESTED')
		cslService.getEventOverview = sinon.stub().resolves(eventOverview)
		learnerRecord.getBookingCancellationReasons = sinon.stub().returns(Promise.resolve(undefined))

		await getCancelAttendee(request, response, next)

		expect(response.render).to.have.been.calledOnceWith('page/course/module/events/cancel-attendee', {
			cancellationReasons: undefined,
			pageModel: overview,
		})
	})

	describe('Edit and update DateRange', () => {
		it('should retrieve DateRange for edit', async () => {
			const courseId = 'course-id'
			const moduleId = 'module-id'
			const eventId = 'event-id'

			const requestConfig = {
				params: {
					courseId: courseId,
					moduleId: moduleId,
					eventId: eventId,
					dateRangeIndex: 0,
				},
			}

			let event = <Event>{
				id: 'event-id',
				venue: {
					location: 'London',
					address: 'London',
					minCapacity: 5,
					capacity: 10,
				},
				dateRanges: [
					{
						date: '2019-03-31',
						startTime: '09:15',
						endTime: '17:30',
					},
				],
			}

			const responseConfig = {
				locals: {
					event: event,
				},
			}

			const request = mockReq(requestConfig)
			const response = mockRes(responseConfig)

			await eventController.editDateRange()(request, response)

			expect(response.render).to.have.been.calledOnceWith('page/course/module/events/event-dateRange-edit', {
				day: 31,
				month: 3,
				year: 2019,
				startHours: '09',
				startMinutes: '15',
				endHours: '17',
				endMinutes: '30',
				dateRangeIndex: 0,
			})
		})

		it('should update date range successfully', async () => {
			const courseId = 'course-id'
			const moduleId = 'module-id'
			const eventId = 'event-id'

			const requestConfig = {
				params: {
					courseId: courseId,
					moduleId: moduleId,
					eventId: eventId,
					dateRangeIndex: 0,
				},
				body: {
					day: '01',
					month: '12',
					year: '2019',
					startTime: ['11', '30'],
					endTime: ['12', '30'],
				},
			}

			const request = mockReq(requestConfig)
			const response = mockRes()

			const errors: any = {}

			const dateRange = <DateRange>{
				date: '2019-12-01',
				startTime: '11:30',
				endTime: '12:30',
			}

			let dateRangeCommand = <DateRangeCommand>{}
			dateRangeCommandValidator.check = sinon.stub().returns(errors)
			dateRangeCommandFactory.create = sinon.stub().returns(dateRangeCommand)
			dateRangeCommand.asDateRange = sinon.stub().returns(dateRange)

			dateRangeValidator.check = sinon.stub().returns(errors)

			const event = {
				id: 'event-id',
				venue: {
					address: 'London',
					location: 'London',
					minCapacity: 5,
					capacity: 5,
					availability: 5,
				},
				dateRanges: [],
				status: 'Active',
				cancellationReason: 'The event is no longer available',
			}
			response.locals.event = event

			learningCatalogue.updateEvent = sinon.stub().returns(Promise.resolve(event))

			await eventController.updateDateRange()(request, response, next)

			expect(learningCatalogue.updateEvent).to.have.been.calledOnceWith(courseId, moduleId, eventId, {
				id: 'event-id',
				venue: {
					address: 'London',
					location: 'London',
					minCapacity: 5,
					capacity: 5,
					availability: 5,
				},
				dateRanges: [
					{
						date: '2019-12-01',
						startTime: '11:30',
						endTime: '12:30',
					},
				],
				status: 'Active',
				cancellationReason: 'The event is no longer available',
			})
			expect(response.redirect).to.have.been.calledOnceWith(`/content-management/courses/${courseId}/modules/${moduleId}/events/${eventId}/dateRanges`)
		})

		it('should pass to next if update throws errror', async () => {
			const courseId = 'course-id'
			const moduleId = 'module-id'
			const eventId = 'event-id'

			const requestConfig = {
				params: {
					courseId: courseId,
					moduleId: moduleId,
					eventId: eventId,
					dateRangeIndex: 0,
				},
				body: {
					day: '01',
					month: '12',
					year: '2019',
					startTime: ['11', '30'],
					endTime: ['12', '30'],
				},
			}

			const request = mockReq(requestConfig)
			const response = mockRes()

			const errors: any = {}

			const dateRange = <DateRange>{
				date: '2019-12-01',
				startTime: '11:30',
				endTime: '12:30',
			}

			let dateRangeCommand = <DateRangeCommand>{}
			dateRangeCommandValidator.check = sinon.stub().returns(errors)
			dateRangeCommandFactory.create = sinon.stub().returns(dateRangeCommand)
			dateRangeCommand.asDateRange = sinon.stub().returns(dateRange)

			dateRangeValidator.check = sinon.stub().returns(errors)

			response.locals.event = {
				id: 'event-id',
				venue: {
					address: 'London',
					location: 'London',
					minCapacity: 5,
					capacity: 5,
					availability: 5,
				},
				dateRanges: [],
				status: 'Active',
				cancellationReason: 'The event is no longer available',
			}
			learningCatalogue.updateEvent = sinon.stub().returns(Promise.reject(error))

			await eventController.updateDateRange()(request, response, next)
			expect(learningCatalogue.updateEvent).to.have.been.calledOnceWith(courseId, moduleId, eventId, {
				id: 'event-id',
				venue: {
					address: 'London',
					location: 'London',
					minCapacity: 5,
					capacity: 5,
					availability: 5,
				},
				dateRanges: [
					{
						date: '2019-12-01',
						startTime: '11:30',
						endTime: '12:30',
					},
				],
				status: 'Active',
				cancellationReason: 'The event is no longer available',
			})
			expect(next).to.have.been.calledOnceWith(error)
		})

		it('should display errors if form validation fails on update', async () => {
			const courseId = 'course-id'
			const moduleId = 'module-id'
			const eventId = 'event-id'
			const dateRangeIndex = 0

			const requestConfig = {
				params: {
					courseId: courseId,
					moduleId: moduleId,
					eventId: eventId,
					dateRangeIndex: dateRangeIndex,
				},
				body: {
					day: '01',
					month: '12',
					year: '2019',
					startTime: ['11', '30'],
					endTime: ['12', '30'],
				},
			}

			const request = mockReq(requestConfig)
			const response = mockRes()

			const errors: any = {
				fields: [
					{
						day: ['error'],
					},
				],
				size: 1,
			}

			dateRangeCommandValidator.check = sinon.stub().returns(errors)

			learningCatalogue.getCourse = sinon.stub()
			learningCatalogue.updateEvent = sinon.stub().returns(Promise.resolve())

			await eventController.updateDateRange()(request, response, next)

			expect(learningCatalogue.getCourse).to.have.not.been.called
			expect(learningCatalogue.updateEvent).to.not.have.been.called
			expect(response.render).to.have.been.calledOnceWith('page/course/module/events/event-dateRange-edit', {
				errors: errors,
				day: request.body.day,
				month: request.body.month,
				year: request.body.year,
				startHours: request.body.startHours,
				startMinutes: request.body.startMinutes,
				endHours: request.body.endHours,
				endMinutes: request.body.endMinutes,
				dateRangeIndex: dateRangeIndex,
			})
		})

		it('should display errors if DateRange validation fails on update', async () => {
			const courseId = 'course-id'
			const moduleId = 'module-id'
			const eventId = 'event-id'
			const dateRangeIndex = 0

			const requestConfig = {
				params: {
					courseId: courseId,
					moduleId: moduleId,
					eventId: eventId,
					dateRangeIndex: dateRangeIndex,
				},
				body: {
					day: '01',
					month: '12',
					year: '2019',
					startTime: ['11', '30'],
					endTime: ['12', '30'],
				},
			}

			const request = mockReq(requestConfig)
			const response = mockRes()

			const errors: any = {
				fields: [
					{
						day: ['error'],
					},
				],
				size: 1,
			}

			dateRangeCommandValidator.check = sinon.stub().returns({})

			const dateRangeCommand = <DateRangeCommand>{}
			const dateRange = <DateRange>{}
			dateRangeCommandFactory.create = sinon.stub().returns(dateRangeCommand)
			dateRangeCommand.asDateRange = sinon.stub().returns(dateRange)
			dateRangeValidator.check = sinon.stub().returns(errors)

			learningCatalogue.getCourse = sinon.stub()
			learningCatalogue.updateEvent = sinon.stub().returns(Promise.resolve())

			await eventController.updateDateRange()(request, response, next)

			expect(learningCatalogue.getCourse).to.have.not.been.called
			expect(learningCatalogue.updateEvent).to.not.have.been.called
			expect(dateRangeCommandValidator.check).to.have.been.calledOnceWith(request.body)
			expect(dateRangeCommandFactory.create).to.have.been.calledOnceWith(request.body)
			expect(dateRangeCommand.asDateRange).to.have.been.calledOnce
			expect(dateRangeValidator.check).to.have.been.calledOnceWith(dateRange)
			expect(response.render).to.have.been.calledOnceWith('page/course/module/events/event-dateRange-edit', {
				errors: errors,
				day: request.body.day,
				month: request.body.month,
				year: request.body.year,
				startHours: request.body.startHours,
				startMinutes: request.body.startMinutes,
				endHours: request.body.endHours,
				endMinutes: request.body.endMinutes,
				dateRangeIndex: dateRangeIndex,
			})
		})

		it('should render dateRange overview', async () => {
			const request = mockReq()
			const response = mockRes()
			response.locals.event = new Event()
			response.locals.event.dateRanges = []

			eventController.dateRangeOverview()(request, response)

			expect(response.render).to.have.been.calledOnceWith('page/course/module/events/event-dateRange-edit')
		})
	})

	describe('add date range', () => {
		it('should add date range successfully', async () => {
			const courseId = 'course-id'
			const moduleId = 'module-id'
			const eventId = 'event-id'

			const requestConfig = {
				params: {
					courseId: courseId,
					moduleId: moduleId,
					eventId: eventId,
					dateRangeIndex: 0,
				},
				body: {
					day: '01',
					month: '12',
					year: '2019',
					startTime: ['11', '30'],
					endTime: ['12', '30'],
				},
			}

			const request = mockReq(requestConfig)
			const response = mockRes()

			const errors: any = {}

			const dateRange = <DateRange>{
				date: '2019-12-01',
				startTime: '11:30',
				endTime: '12:30',
			}

			let dateRangeCommand = <DateRangeCommand>{}
			dateRangeCommandValidator.check = sinon.stub().returns(errors)
			dateRangeCommandFactory.create = sinon.stub().returns(dateRangeCommand)
			dateRangeCommand.asDateRange = sinon.stub().returns(dateRange)

			dateRangeValidator.check = sinon.stub().returns(errors)

			const event = <Event>{
				id: 'event-id',
				venue: {
					address: 'London',
					location: 'London',
					minCapacity: 5,
					capacity: 5,
				},
				dateRanges: [
					{
						date: '2019-03-31',
						startTime: '09:30',
						endTime: '16:30',
					},
				],
			}

			response.locals.event = event
			learningCatalogue.updateEvent = sinon.stub().returns(Promise.resolve(event))

			await eventController.addDateRange()(request, response, next)

			expect(learningCatalogue.updateEvent).to.have.been.calledOnceWith(courseId, moduleId, eventId, {
				id: 'event-id',
				venue: {
					address: 'London',
					location: 'London',
					minCapacity: 5,
					capacity: 5,
				},
				dateRanges: [
					{
						date: '2019-03-31',
						startTime: '09:30',
						endTime: '16:30',
					},
					{
						date: '2019-12-01',
						startTime: '11:30',
						endTime: '12:30',
					},
				],
			})
			expect(response.redirect).to.have.been.calledOnceWith(`/content-management/courses/${courseId}/modules/${moduleId}/events/${eventId}/dateRanges`)
		})

		it('should pass to next if error thrown', async () => {
			const courseId = 'course-id'
			const moduleId = 'module-id'
			const eventId = 'event-id'

			const requestConfig = {
				params: {
					courseId: courseId,
					moduleId: moduleId,
					eventId: eventId,
					dateRangeIndex: 0,
				},
				body: {
					day: '01',
					month: '12',
					year: '2019',
					startTime: ['11', '30'],
					endTime: ['12', '30'],
				},
			}

			const request = mockReq(requestConfig)
			const response = mockRes()

			const errors: any = {}

			const dateRange = <DateRange>{
				date: '2019-12-01',
				startTime: '11:30',
				endTime: '12:30',
			}

			let dateRangeCommand = <DateRangeCommand>{}
			dateRangeCommandValidator.check = sinon.stub().returns(errors)
			dateRangeCommandFactory.create = sinon.stub().returns(dateRangeCommand)
			dateRangeCommand.asDateRange = sinon.stub().returns(dateRange)

			dateRangeValidator.check = sinon.stub().returns(errors)

			response.locals.event = <Event>{
				id: 'event-id',
				venue: {
					address: 'London',
					location: 'London',
					minCapacity: 5,
					capacity: 5,
				},
				dateRanges: [
					{
						date: '2019-03-31',
						startTime: '09:30',
						endTime: '16:30',
					},
				],
			}

			learningCatalogue.updateEvent = sinon.stub().returns(Promise.reject(error))

			await eventController.addDateRange()(request, response, next)

			expect(learningCatalogue.updateEvent).to.have.been.calledOnceWith(courseId, moduleId, eventId, {
				id: 'event-id',
				venue: {
					address: 'London',
					location: 'London',
					minCapacity: 5,
					capacity: 5,
				},
				dateRanges: [
					{
						date: '2019-03-31',
						startTime: '09:30',
						endTime: '16:30',
					},
					{
						date: '2019-12-01',
						startTime: '11:30',
						endTime: '12:30',
					},
				],
			})
			expect(next).to.have.been.calledOnceWith(error)
		})

		it('should display errors if form validation fails on add', async () => {
			const courseId = 'course-id'
			const moduleId = 'module-id'
			const eventId = 'event-id'

			const requestConfig = {
				params: {
					courseId: courseId,
					moduleId: moduleId,
					eventId: eventId,
				},
				body: {
					day: '01',
					month: '12',
					year: '2019',
					startTime: ['11', '30'],
					endTime: ['12', '30'],
				},
			}

			const request = mockReq(requestConfig)
			const response = mockRes()

			const errors: any = {
				fields: [
					{
						day: ['error'],
					},
				],
				size: 1,
			}

			dateRangeCommandValidator.check = sinon.stub().returns(errors)

			learningCatalogue.getCourse = sinon.stub()
			learningCatalogue.updateEvent = sinon.stub().returns(Promise.resolve())

			await eventController.addDateRange()(request, response, next)

			expect(learningCatalogue.getCourse).to.have.not.been.called
			expect(learningCatalogue.updateEvent).to.not.have.been.called
			expect(response.render).to.have.been.calledOnceWith('page/course/module/events/event-dateRange-edit', {
				courseId: courseId,
				errors: errors,
				day: request.body.day,
				month: request.body.month,
				year: request.body.year,
				startHours: request.body.startHours,
				startMinutes: request.body.startMinutes,
				endHours: request.body.endHours,
				endMinutes: request.body.endMinutes,
				moduleId: moduleId,
			})
		})

		it('should display errors if DateRange validation fails on add', async () => {
			const courseId = 'course-id'
			const moduleId = 'module-id'
			const eventId = 'event-id'

			const requestConfig = {
				params: {
					courseId: courseId,
					moduleId: moduleId,
					eventId: eventId,
				},
				body: {
					day: '01',
					month: '12',
					year: '2019',
					startTime: ['11', '30'],
					endTime: ['12', '30'],
				},
			}

			const request = mockReq(requestConfig)
			const response = mockRes()

			const errors: any = {
				fields: [
					{
						day: ['error'],
					},
				],
				size: 1,
			}

			dateRangeCommandValidator.check = sinon.stub().returns({})

			const dateRangeCommand = <DateRangeCommand>{}
			const dateRange = <DateRange>{}
			dateRangeCommandFactory.create = sinon.stub().returns(dateRangeCommand)
			dateRangeCommand.asDateRange = sinon.stub().returns(dateRange)
			dateRangeValidator.check = sinon.stub().returns(errors)

			learningCatalogue.getCourse = sinon.stub()

			learningCatalogue.updateEvent = sinon.stub().returns(Promise.resolve())

			await eventController.addDateRange()(request, response, next)

			expect(learningCatalogue.getCourse).to.have.not.been.called
			expect(learningCatalogue.updateEvent).to.not.have.been.called
			expect(dateRangeCommandValidator.check).to.have.been.calledOnceWith(request.body)
			expect(dateRangeCommandFactory.create).to.have.been.calledOnceWith(request.body)
			expect(dateRangeCommand.asDateRange).to.have.been.calledOnce
			expect(dateRangeValidator.check).to.have.been.calledOnceWith(dateRange)
			expect(response.render).to.have.been.calledOnceWith('page/course/module/events/event-dateRange-edit', {
				courseId: courseId,
				errors: errors,
				day: request.body.day,
				month: request.body.month,
				year: request.body.year,
				startHours: request.body.startHours,
				startMinutes: request.body.startMinutes,
				endHours: request.body.endHours,
				endMinutes: request.body.endMinutes,
				moduleId: moduleId,
			})
		})
	})
})
