import _ = require('lodash')

import {LearningCatalogue} from '../../../learning-catalogue/index'
import {Validator} from '../../../learning-catalogue/validator/validator'
import {NextFunction, Request, Response, Router} from 'express'
import {EventFactory} from '../../../learning-catalogue/model/factory/eventFactory'
import {Event} from '../../../learning-catalogue/model/event'
import * as moment from 'moment'
import {DateRangeCommand} from '../../command/dateRangeCommand'
import {DateRange} from '../../../learning-catalogue/model/dateRange'
import {DateRangeCommandFactory} from '../../command/factory/dateRangeCommandFactory'
import {DateTime} from '../../../lib/dateTime'
import {LearnerRecord} from '../../../learner-record'
import {InviteFactory} from '../../../learner-record/model/factory/inviteFactory'
import * as config from '../../../config'
import {Booking} from '../../../learner-record/model/booking'
import * as asyncHandler from 'express-async-handler'
import {Validate} from '../../formValidator'
import {FormController} from '../../formController'
import {Course} from '../../../learning-catalogue/model/course'
import {Module} from '../../../learning-catalogue/model/module'
import { getLogger } from '../../../utils/logger'
import * as EmailValidator from 'email-validator'
import {CslServiceClient} from '../../../csl-service/client'
import {CancelBookingDto} from '../../../csl-service/model/CancelBookingDto'
import {applyLearningCatalogueMiddleware} from '../../middleware/learningCatalogueMiddleware'

const { xss } = require('express-xss-sanitizer')


export class EventController implements FormController {
	logger = getLogger('EventController')
	router: Router

	constructor(
		public learningCatalogue: LearningCatalogue,
		public learnerRecord: LearnerRecord,
		public eventValidator: Validator<Event>,
		public validator: Validator<Booking>,
		public eventFactory: EventFactory,
		public inviteFactory: InviteFactory,
		public dateRangeCommandValidator: Validator<DateRangeCommand>,
		public dateRangeValidator: Validator<DateRange>,
		public dateRangeCommandFactory: DateRangeCommandFactory,
		public cslService: CslServiceClient
	) {
		this.router = Router()
		this.setRouterPaths()
	}

	/* istanbul ignore next */
	private setRouterPaths() {
		this.router.param(
			'eventId',
			asyncHandler(async (req: Request, res: Response, next: NextFunction, eventId: string) => {
				const event = await this.learningCatalogue.getEvent(req.params.courseId, req.params.moduleId, eventId)
				if (event) {
					res.locals.event = event
					res.locals.courseId = req.params.courseId
					res.locals.moduleId = req.params.moduleId
					next()
				} else {
					res.status(404)
					return res.render("page/not-found")
				}
			})
		)

		this.router.param(
			'eventId',
			asyncHandler(async (req: Request, res: Response, next: NextFunction, eventId: string) => {
				const invitees = await this.learnerRecord.getEventInvitees(eventId)

				if (invitees) {
					res.locals.invitees = invitees
					next()
				} else {
					res.status(404)
					return res.render("page/not-found")
				}
			})
		)
		applyLearningCatalogueMiddleware({getModule: true}, this.router, this.learningCatalogue)

		this.router.post('/content-management/courses/:courseId/modules/:moduleId/events/location/create', xss(), asyncHandler(this.checkForEventViewRole()), asyncHandler(this.getLocation()))

		this.router.get('/content-management/courses/:courseId/modules/:moduleId/events/:eventId/location', xss(), asyncHandler(this.checkForEventViewRole()), asyncHandler(this.editLocation()))

		this.router.post('/content-management/courses/:courseId/modules/:moduleId/events/location/', xss(), asyncHandler(this.checkForEventViewRole()), asyncHandler(this.setLocation()))

		this.router.post('/content-management/courses/:courseId/modules/:moduleId/events/location/:eventId', xss(), asyncHandler(this.checkForEventViewRole()), asyncHandler(this.updateLocation()))

		this.router.get('/content-management/courses/:courseId/modules/:moduleId/events-preview/:eventId?', xss(), asyncHandler(this.checkForEventViewRole()), asyncHandler(this.getDatePreview()))
		this.router.get('/content-management/courses/:courseId/modules/:moduleId/events-overview/:eventId', xss(), asyncHandler(this.checkForEventViewRole()), asyncHandler(this.getEventOverview()))

		this.router.get('/content-management/courses/:courseId/modules/:moduleId/events/', xss(), asyncHandler(this.checkForEventViewRole()), asyncHandler(this.getDateTime()))
		this.router.post('/content-management/courses/:courseId/modules/:moduleId/events/', xss(), asyncHandler(this.checkForEventViewRole()), asyncHandler(this.setDateTime()))

		this.router.get('/content-management/courses/:courseId/modules/:moduleId/events/:eventId/dateRanges/:dateRangeIndex', xss(), asyncHandler(this.checkForEventViewRole()), asyncHandler(this.editDateRange()))

		this.router.get('/content-management/courses/:courseId/modules/:moduleId/events/:eventId/dateRanges/', xss(), asyncHandler(this.checkForEventViewRole()), asyncHandler(this.dateRangeOverview()))

		this.router.post('/content-management/courses/:courseId/modules/:moduleId/events/:eventId/dateRanges/', xss(), asyncHandler(this.checkForEventViewRole()), asyncHandler(this.addDateRange()))

		this.router.post('/content-management/courses/:courseId/modules/:moduleId/events/:eventId/dateRanges/:dateRangeIndex', xss(), asyncHandler(this.checkForEventViewRole()), asyncHandler(this.updateDateRange()))

		this.router.get('/content-management/courses/:courseId/modules/:moduleId/events/:eventId/attendee/:bookingId', xss(), asyncHandler(this.checkForEventViewRole()), asyncHandler(this.getAttendeeDetails()))

		this.router.post('/content-management/courses/:courseId/modules/:moduleId/events/:eventId/attendee/:bookingId/update', xss(), asyncHandler(this.checkForEventViewRole()), asyncHandler(this.updateBooking()))

		this.router.get('/content-management/courses/:courseId/modules/:moduleId/events/:eventId/cancel', xss(), asyncHandler(this.checkForEventViewRole()), asyncHandler(this.cancelEvent()))
		this.router.post('/content-management/courses/:courseId/modules/:moduleId/events/:eventId/cancel', xss(), asyncHandler(this.checkForEventViewRole()), asyncHandler(this.setCancelEvent()))

		this.router.get('/content-management/courses/:courseId/modules/:moduleId/events/:eventId/attendee/:bookingId/cancel', xss(), asyncHandler(this.checkForEventViewRole()), asyncHandler(this.getCancelBooking()))
		this.router.post('/content-management/courses/:courseId/modules/:moduleId/events/:eventId/attendee/:bookingId/cancel', xss(), asyncHandler(this.checkForEventViewRole()), asyncHandler(this.cancelBooking()))

		this.router.post('/content-management/courses/:courseId/modules/:moduleId/events/:eventId/invite', xss(), asyncHandler(this.checkForEventViewRole()), asyncHandler(this.inviteLearner()))
	}

	public checkForEventViewRole() {
		return (req: Request, res: Response, next: NextFunction) => {
			if (req.user && req.user.hasEventViewingRole()) {
				next()
			} else {
				if (req.user && req.user.uid) {
					this.logger.error('Rejecting user without event viewing role ' + req.user.uid + ' with IP '
						+ req.ip + ' from page ' + req.originalUrl)
					}
				res.render('page/unauthorised')
			}
		}
	}

	public getDateTime() {
		return async (request: Request, response: Response) => {
			response.render('page/course/module/events/events', {courseId: request.params.courseId, moduleId: request.params.moduleId})
		}
	}

	public setDateTime() {
		return async (request: Request, response: Response) => {
			let data = {
				...request.body,
			}
			const event = data.eventJson ? JSON.parse(data.eventJson) : this.eventFactory.create({})
			let errors = await this.dateRangeCommandValidator.check(data)

			if (errors.size) {
				response.render('page/course/module/events/events', {
					event: event,
					courseId: request.params.courseId,
					moduleId: request.params.moduleId,
					eventJson: JSON.stringify(event),
					errors: errors,
				})
			} else {
				const dateRangeCommand: DateRangeCommand = this.dateRangeCommandFactory.create(data)
				const dateRange: DateRange = dateRangeCommand.asDateRange()

				errors = await this.dateRangeValidator.check(dateRange)

				if (errors.size) {
					const event = data.eventJson ? JSON.parse(data.eventJson) : this.eventFactory.create({})
					response.render('page/course/module/events/events', {
						event: event,
						courseId: request.params.courseId,
						moduleId: request.params.moduleId,
						eventJson: JSON.stringify(event),
						errors: errors,
					})
				} else {
					const event = data.eventJson ? JSON.parse(data.eventJson) : this.eventFactory.create({})
					event.dateRanges.push(dateRange)

					response.render('page/course/module/events/events', {
						event: event,
						courseId: request.params.courseId,
						moduleId: request.params.moduleId,
						eventJson: JSON.stringify(event),
					})
				}
			}
		}
	}

	public dateRangeOverview() {
		return async (request: Request, response: Response) => {
			response.locals.event.dateRanges.sort(function compare(a: DateRange, b: DateRange) {
				const dateA = moment(_.get(a, 'date', '') + ' ' + _.get(a, 'startTime', ''))

				const dateB = moment(_.get(b, 'date', '') + ' ' + _.get(b, 'startTime', ''))
				// @ts-ignore
				return dateA - dateB
			})
			response.render('page/course/module/events/event-dateRange-edit')
		}
	}

	public editDateRange() {
		return async (request: Request, response: Response) => {
			const dateRangeIndex = request.params.dateRangeIndex

			const event = response.locals.event

			const dateRange = event!.dateRanges![dateRangeIndex]

			const date: any = moment(dateRange.date)

			const startTime = moment(dateRange.startTime, 'HH:mm')
			const endTime = moment(dateRange.endTime, 'HH:mm')

			response.render('page/course/module/events/event-dateRange-edit', {
				day: date.date(),
				month: date.month() + 1,
				year: date.year(),
				startHours: startTime.format('HH'),
				startMinutes: startTime.format('mm'),
				endHours: endTime.format('HH'),
				endMinutes: endTime.format('mm'),
				dateRangeIndex: dateRangeIndex,
			})
		}
	}

	public addDateRange() {
		return async (request: Request, response: Response, next: NextFunction) => {
			let data = {
				...request.body,
			}

			const courseId = request.params.courseId
			const moduleId = request.params.moduleId
			const eventId = request.params.eventId

			const errors = await this.dateRangeCommandValidator.check(data)

			if (errors.size) {
				response.render('page/course/module/events/event-dateRange-edit', {
					errors: errors,
					day: request.body.day,
					month: request.body.month,
					year: request.body.year,
					startHours: request.body.startHours,
					startMinutes: request.body.startMinutes,
					endHours: request.body.endHours,
					endMinutes: request.body.endMinutes,
					courseId: courseId,
					moduleId: moduleId,
				})
			} else {
				const dateRangeCommand = this.dateRangeCommandFactory.create(data)
				const dateRange = dateRangeCommand.asDateRange()

				const errors = await this.dateRangeValidator.check(dateRange)
				if (errors.size) {
					response.render('page/course/module/events/event-dateRange-edit', {
						errors: errors,
						day: request.body.day,
						month: request.body.month,
						year: request.body.year,
						startHours: request.body.startHours,
						startMinutes: request.body.startMinutes,
						endHours: request.body.endHours,
						endMinutes: request.body.endMinutes,
						courseId: courseId,
						moduleId: moduleId,
					})
				} else {
					const event = await this.learningCatalogue.getEvent(courseId, moduleId, eventId)

					event!.dateRanges!.push(dateRange)

					await this.learningCatalogue
						.updateEvent(courseId, moduleId, eventId, event)
						.then(() => {
							response.redirect(`/content-management/courses/${courseId}/modules/${moduleId}/events/${eventId}/dateRanges`)
						})
						.catch(error => {
							next(error)
						})
				}
			}
		}
	}

	public updateDateRange() {
		return async (request: Request, response: Response, next: NextFunction) => {
			let data = {
				...request.body,
			}

			const courseId = request.params.courseId
			const moduleId = request.params.moduleId
			const eventId = request.params.eventId
			const dateRangeIndex = request.params.dateRangeIndex

			const errors = await this.dateRangeCommandValidator.check(data)

			if (errors.size) {
				response.render('page/course/module/events/event-dateRange-edit', {
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
			} else {
				const dateRangeCommand = this.dateRangeCommandFactory.create(data)
				const dateRange = dateRangeCommand.asDateRange()

				const errors = await this.dateRangeValidator.check(dateRange)
				if (errors.size) {
					response.render('page/course/module/events/event-dateRange-edit', {
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
				} else {
					const event = await this.learningCatalogue.getEvent(courseId, moduleId, eventId)
					// @ts-ignore
					event!.dateRanges![dateRangeIndex] = dateRange

					await this.learningCatalogue
						.updateEvent(courseId, moduleId, eventId, event)
						.then(() => {
							response.redirect(`/content-management/courses/${courseId}/modules/${moduleId}/events/${eventId}/dateRanges`)
						})
						.catch(error => {
							next(error)
						})
				}
			}
		}
	}

	public getDatePreview() {
		return async (req: Request, res: Response) => {
			const course: Course = res.locals.course
			const module: Course = res.locals.module

			res.render('page/course/module/events/events-preview', {course: course, module: module})
		}
	}

	public getLocation() {
		return async (req: Request, res: Response) => {
			res.render('page/course/module/events/event-location', {
				event: JSON.parse(req.body.eventJson || '{}'),
				eventJson: req.body.eventJson,
				courseId: req.params.courseId,
				moduleId: req.params.moduleId,
			})
		}
	}

	public setLocation() {
		return async (req: Request, res: Response, next: NextFunction) => {
			const data = {
				venue: {
					location: req.body.location,
					address: req.body.address,
					capacity: parseInt(req.body.capacity, 10),
					minCapacity: parseInt(req.body.minCapacity, 10),
				},
			}

			const errors = await this.eventValidator.check(data, ['event.location'])

			if (errors.size) {
				res.render('page/course/module/events/event-location', {
					eventJson: req.body.eventJson,
					errors: errors,
				})
			} else {
				let event = JSON.parse(req.body.eventJson || '{}')
				event.venue = data.venue

				const savedEvent: any = await this.learningCatalogue.createEvent(req.params.courseId, req.params.moduleId, event).catch(error => {
					next(error)
				})

				const eventUri = `${config.COURSE_CATALOGUE.url}/courses/${req.params.courseId}/modules/${req.params.moduleId}/events/${savedEvent.id}`

				await this.learnerRecord
					.createEvent(savedEvent.id, eventUri)
					.then(() => {
						res.redirect(`/content-management/courses/${req.params.courseId}/modules/${req.params.moduleId}/events-overview/${savedEvent.id}`)
					})
					.catch(error => {
						next(error)
					})
			}
		}
	}

	public editLocation() {
		return async (req: Request, res: Response) => {
			res.render('page/course/module/events/event-location')
		}
	}

	public updateLocation() {
		return async (req: Request, res: Response, next: NextFunction) => {
			const data = {
				venue: {
					location: req.body.location,
					address: req.body.address,
					capacity: parseInt(req.body.capacity),
					minCapacity: parseInt(req.body.minCapacity),
					availability: parseInt(req.body.capacity),
				},
			}

			const errors = await this.eventValidator.check(data, ['event.location'])

			if (errors.size) {
				res.render('page/course/module/events/event-location', {
					location: req.body.location,
					address: req.body.address,
					capacity: req.body.capacity,
					minCapacity: req.body.minCapacity,
					errors: errors,
				})
			} else {
				let event = await this.learningCatalogue.getEvent(req.params.courseId, req.params.moduleId, req.params.eventId)

				event.venue = data.venue

				await this.learningCatalogue
					.updateEvent(req.params.courseId, req.params.moduleId, req.params.eventId, event)
					.then(() => {
						res.redirect(`/content-management/courses/${req.params.courseId}/modules/${req.params.moduleId}/events-overview/${req.params.eventId}`)
					})
					.catch(error => {
						next(error)
					})
			}
		}
	}

	public getEventOverview() {
		return async (req: Request, res: Response) => {
			const course: Course = res.locals.course
			const module: Module = res.locals.module

			const event = res.locals.event
			const eventDateWithMonthAsText: string = DateTime.convertDate(event.dateRanges[0].date)

			const bookings = await this.learnerRecord.getEventBookings(event.id)
			const activeBookings = bookings.filter((booking: Booking) => booking.status != Booking.Status.CANCELLED)

			res.render('page/course/module/events/events-overview', {
				bookings: activeBookings,
				eventDateWithMonthAsText,
				course: course,
				module: module,
			})
		}
	}

	public cancelEvent() {
		return async (req: Request, res: Response) => {
			const course: Course = res.locals.course
			const module: Module = res.locals.module

			const cancellationReasons = await this.learnerRecord.getCancellationReasons()

			res.render('page/course/module/events/cancel', {course: course, module: module, cancellationReasons: cancellationReasons})
		}
	}

	public setCancelEvent() {
		return async (req: Request, res: Response) => {
			let event = res.locals.event
			event.status = Event.Status.CANCELLED

			try {
				await this.learnerRecord.cancelEvent(req.params.eventId, event, req.body.cancellationReason)
			} catch (e) {
				this.logger.info(`The event has no attendees: ${e}`)
			}

			req.session!.sessionFlash = {
				eventCancelledMessage: 'event_cancelled_message',
			}

			return req.session!.save(() => {
				res.redirect(`/content-management/courses/${req.params.courseId}/modules/${req.params.moduleId}/events-overview/${req.params.eventId}`)
			})
		}
	}

	public inviteLearner() {
		return async (req: Request, res: Response) => {
			const data = {
				...req.body,
			}

			const emailAddress = data.learnerEmail

			data.event = `${config.COURSE_CATALOGUE.url}/courses/${req.params.courseId}/modules/${req.params.moduleId}/events/${req.params.eventId}`

			req.session!.sessionFlash = {
				emailAddressFoundMessage: 'email_address_found_message',
				emailAddress: emailAddress,
			}

			if (!EmailValidator.validate(emailAddress)) {
				req.session!.sessionFlash = {
					errors: {fields: {emailAddress: 'validation_email_address_invalid'}},
					emailAddressFoundMessage: 'validation_email_address_invalid',
					emailAddress: emailAddress,
				}
			} else {
				await this.learnerRecord.inviteLearner(req.params.eventId, this.inviteFactory.create(data)).catch(error => {
					if ((error.response.status = 400)) {
						req.session!.sessionFlash = {
							emailAddressFoundMessage: error.response.data.errors[0],
							emailAddress: emailAddress,
						}
					} else {
						req.session!.sessionFlash = {
							emailAddressFoundMessage: 'could_not_invite_learner',
							emailAddress: emailAddress,
						}
					}
				})
			}

			return req.session!.save(() => {
				res.redirect(`/content-management/courses/${req.params.courseId}/modules/${req.params.moduleId}/events-overview/${req.params.eventId}`)
			})
		}
	}

	public getAttendeeDetails() {
		return async (req: Request, res: Response) => {
			const course: Course = res.locals.course
			const module: Module = res.locals.module

			const event = res.locals.event
			const eventDateWithMonthAsText: string = DateTime.convertDate(event.dateRanges[0].date)

			const bookings = await this.learnerRecord.getEventBookings(event.id)
			const bookingId = req.params.bookingId
			// @ts-ignore
			const booking = this.findBooking(bookings, bookingId)

			res.render('page/course/module/events/attendee', {
				booking,
				eventDateWithMonthAsText,
				course: course,
				module: module,
			})
		}
	}

	public updateBooking() {
		return async (req: Request, res: Response) => {
			const courseId = req.params.courseId
			const moduleId = req.params.moduleId
			const eventId = req.params.eventId
			const bookingId = req.params.bookingId

			await this.cslService.approveBooking(courseId, moduleId, eventId, bookingId)
			return res.redirect(`/content-management/courses/${courseId}/modules/${moduleId}/events/${eventId}/attendee/${bookingId}`)
		}
	}

	public getCancelBooking() {
		return async (req: Request, res: Response, next: NextFunction) => {
			const event = res.locals.event
			const eventDateWithMonthAsText: string = DateTime.convertDate(event.dateRanges[0].date)

			const bookings = await this.learnerRecord.getEventBookings(event.id)
			const bookingId = req.params.bookingId
			// @ts-ignore
			const booking = this.findBooking(bookings, bookingId)

			await this.learnerRecord
				.getBookingCancellationReasons()
				.then(cancellationReasons => {
					return res.render('page/course/module/events/cancel-attendee', {
						booking: booking,
						eventDateWithMonthAsText: eventDateWithMonthAsText,
						cancellationReasons: cancellationReasons,
					})
				})
				.catch(error => next(error))
		}
	}

	@Validate({
		fields: ['reason'],
		redirect: `/content-management/courses/:courseId/modules/:moduleId/events/:eventId/attendee/:bookingId/cancel`,
	})
	public cancelBooking() {
		return async (req: Request, res: Response) => {
			const data = {
				...req.body,
			}

			const courseId = req.params.courseId
			const moduleId = req.params.moduleId
			const eventId = req.params.eventId

			await this.cslService.cancelBooking(courseId, moduleId, eventId,
				req.params.bookingId, new CancelBookingDto(data.cancellationReason))

			return res.redirect(`/content-management/courses/${courseId}/modules/${moduleId}/events-overview/${eventId}`)
		}
	}
	private findBooking(bookings: any, bookingId: number): Booking {
		return bookings.find(function(booking: Booking) {
			return booking.id == bookingId
		})
	}
}
