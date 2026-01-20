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
import {LearnerRecord} from '../../../learner-record'
import * as asyncHandler from 'express-async-handler'
import {FormController} from '../../formController'
import {Course} from '../../../learning-catalogue/model/course'
import {Module} from '../../../learning-catalogue/model/module'
import { getLogger } from '../../../utils/logger'
import {CslServiceClient} from '../../../csl-service/client'
import {CancelBookingDto} from '../../../csl-service/model/CancelBookingDto'
import {applyLearningCatalogueMiddleware} from '../../middleware/learningCatalogueMiddleware'
import {roleCheckMiddleware} from '../../middleware/roleCheckMiddleware'
import {eventViewingRole} from '../../../identity/identity'
import {plainToInstance} from 'class-transformer'
import {LearnerEmailModel} from './model/learnerEmailModel'
import {validateAndMapErrors} from '../../../validators/util'
import {BookingOverviewPageModel} from './model/BookingOverviewPageModel'

const { xss } = require('express-xss-sanitizer')


export class EventController implements FormController {
	logger = getLogger('EventController')
	router: Router

	constructor(
		public learningCatalogue: LearningCatalogue,
		public learnerRecord: LearnerRecord,
		public validator: Validator<Event>,
		public eventFactory: EventFactory,
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

		const roleCheck = asyncHandler(roleCheckMiddleware(eventViewingRole))

		applyLearningCatalogueMiddleware({getModule: true, getEvent: true}, this.router, this.learningCatalogue)

		this.router.post('/content-management/courses/:courseId/modules/:moduleId/events/location/create', xss(), roleCheck, asyncHandler(this.getLocation()))

		this.router.get('/content-management/courses/:courseId/modules/:moduleId/events/:eventId/location', xss(), roleCheck, asyncHandler(this.editLocation()))

		this.router.post('/content-management/courses/:courseId/modules/:moduleId/events/location/', xss(), roleCheck, asyncHandler(this.setLocation()))

		this.router.post('/content-management/courses/:courseId/modules/:moduleId/events/location/:eventId', xss(), roleCheck, asyncHandler(this.updateLocation()))

		this.router.get('/content-management/courses/:courseId/modules/:moduleId/events-preview/:eventId?', xss(), roleCheck, asyncHandler(this.getDatePreview()))

		// Use uid parameters here to avoid the middleware
		this.router.get('/content-management/courses/:courseUid/modules/:moduleUid/events-overview/:eventUid', xss(), roleCheck, asyncHandler(this.getEventOverview()))

		this.router.get('/content-management/courses/:courseId/modules/:moduleId/events/', xss(), roleCheck, asyncHandler(this.getDateTime()))
		this.router.post('/content-management/courses/:courseId/modules/:moduleId/events/', xss(), roleCheck, asyncHandler(this.setDateTime()))

		this.router.get('/content-management/courses/:courseId/modules/:moduleId/events/:eventId/dateRanges/:dateRangeIndex', xss(), roleCheck, asyncHandler(this.editDateRange()))

		this.router.get('/content-management/courses/:courseId/modules/:moduleId/events/:eventId/dateRanges/', xss(), roleCheck, asyncHandler(this.dateRangeOverview()))

		this.router.post('/content-management/courses/:courseId/modules/:moduleId/events/:eventId/dateRanges/', xss(), roleCheck, asyncHandler(this.addDateRange()))

		this.router.post('/content-management/courses/:courseId/modules/:moduleId/events/:eventId/dateRanges/:dateRangeIndex', xss(), roleCheck, asyncHandler(this.updateDateRange()))

		// Use uid parameters here to avoid the middleware
		this.router.get('/content-management/courses/:courseUid/modules/:moduleUid/events/:eventUid/attendee/:bookingUid', xss(), roleCheck, asyncHandler(this.getAttendeeDetails()))
		this.router.post('/content-management/courses/:courseUid/modules/:moduleUid/events/:eventUid/attendee/:bookingUid/update', xss(), roleCheck, asyncHandler(this.updateBooking()))

		this.router.get('/content-management/courses/:courseId/modules/:moduleId/events/:eventId/cancel', xss(), roleCheck, asyncHandler(this.cancelEvent()))
		this.router.post('/content-management/courses/:courseUid/modules/:moduleUid/events/:eventUid/cancel', xss(), roleCheck, asyncHandler(this.setCancelEvent()))

		this.router.get('/content-management/courses/:courseUid/modules/:moduleUid/events/:eventUid/attendee/:bookingUid/cancel', xss(), roleCheck, asyncHandler(this.getCancelBooking()))
		this.router.post('/content-management/courses/:courseUid/modules/:moduleUid/events/:eventUid/attendee/:bookingUid/cancel', xss(), roleCheck, asyncHandler(this.cancelBooking()))

		this.router.post('/content-management/courses/:courseUid/modules/:moduleUid/events/:eventUid/invite', xss(), roleCheck, asyncHandler(this.inviteLearner()))
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
					const event: Event = response.locals.event

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
					const event: Event = response.locals.event
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

			const errors = await this.validator.check(data, ['event.location'])

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

				await this.learnerRecord
					.createEvent(savedEvent.id)
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

			const errors = await this.validator.check(data, ['event.location'])

			if (errors.size) {
				res.render('page/course/module/events/event-location', {
					location: req.body.location,
					address: req.body.address,
					capacity: req.body.capacity,
					minCapacity: req.body.minCapacity,
					errors: errors,
				})
			} else {
				let event: Event = res.locals.event

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
			const eventOverview = await this.cslService.getEventOverview(req.params.courseUid, req.params.moduleUid, req.params.eventUid)
			res.render('page/course/module/events/events-overview', {
				pageModel: eventOverview,
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
			const courseUid = req.params.courseUid
			const moduleUid = req.params.moduleUid
			const eventUid = req.params.eventUid

			try {
				await this.cslService.cancelEvent(courseUid, moduleUid, eventUid, req.body.cancellationReason)
			} catch (e) {
				this.logger.info(`The event has no attendees: ${e}`)
			}

			req.session!.sessionFlash = {
				eventCancelledMessage: 'event_cancelled_message',
			}

			return req.session!.save(() => {
				res.redirect(`/content-management/courses/${courseUid}/modules/${moduleUid}/events-overview/${eventUid}`)
			})
		}
	}

	public inviteLearner() {
		return async (req: Request, res: Response) => {
			const learnerEmailModel = plainToInstance(LearnerEmailModel, req.body as LearnerEmailModel)
			let errors = await validateAndMapErrors(learnerEmailModel)

			if (errors !== undefined) {
				req.session!.sessionFlash = {
					errors,
					learnerEmail: learnerEmailModel.learnerEmail
				}
				return req.session!.save(() => {
					res.redirect(`/content-management/courses/${req.params.courseUid}/modules/${req.params.moduleUid}/events-overview/${req.params.eventUid}`)
				})
			}

			try {
				await this.cslService.inviteLearnerToEvent(req.params.courseUid, req.params.moduleUid, req.params.eventUid, learnerEmailModel.learnerEmail)
				req.session!.sessionFlash = {
					emailAddressFoundMessage: 'email_address_found_message',
					emailAddress: learnerEmailModel.learnerEmail,
				}
			} catch (error) {
				let errorMsg = 'could_not_invite_learner_unknown_error'
				if (error.statusCode === 404) {
					errorMsg = 'email_address_not_found_message'
				} else if (error.statusCode === 400) {
					errorMsg = 'could_not_invite_learner'
				}
				req.session!.sessionFlash = {
					errors: {fields: {learnerEmail: [errorMsg]}},
					learnerEmail: learnerEmailModel.learnerEmail
				}
			}

			return req.session!.save(() => {
				res.redirect(`/content-management/courses/${req.params.courseUid}/modules/${req.params.moduleUid}/events-overview/${req.params.eventUid}`)
			})
		}
	}

	public getAttendeeDetails() {
		return async (req: Request, res: Response) => {
			const eventOverview = await this.cslService.getEventOverview(req.params.courseUid, req.params.moduleUid, req.params.eventUid)
			const pageModel = BookingOverviewPageModel.fromEventOverview(eventOverview, parseInt(req.params.bookingUid))
			if (pageModel === undefined) {
				res.status(404)
				res.render("page/not-found")
			} else {
				res.render('page/course/module/events/attendee', {pageModel})
			}
		}
	}

	public updateBooking() {
		return async (req: Request, res: Response) => {
			const courseUid = req.params.courseUid
			const moduleUid = req.params.moduleUid
			const eventUid = req.params.eventUid
			const bookingUid = req.params.bookingUid

			await this.cslService.approveBooking(courseUid, moduleUid, eventUid, bookingUid)
			return res.redirect(`/content-management/courses/${courseUid}/modules/${moduleUid}/events/${eventUid}/attendee/${bookingUid}`)
		}
	}

	public getCancelBooking() {
		return async (req: Request, res: Response, next: NextFunction) => {
			const eventOverview = await this.cslService.getEventOverview(req.params.courseUid, req.params.moduleUid, req.params.eventUid)
			const pageModel = BookingOverviewPageModel.fromEventOverview(eventOverview, parseInt(req.params.bookingUid))
			if (pageModel === undefined) {
				res.status(404)
				return res.render("page/not-found")
			} else {
				await this.learnerRecord
					.getBookingCancellationReasons()
					.then(cancellationReasons => {
						return res.render('page/course/module/events/cancel-attendee', {pageModel, cancellationReasons})
					})
					.catch(error => next(error))
			}
		}
	}

	public cancelBooking() {
		return async (req: Request, res: Response) => {
			const data = {
				...req.body,
			}

			const courseUid = req.params.courseUid
			const moduleUid = req.params.moduleUid
			const eventUid = req.params.eventUid

			if (data.cancellationReason === '') {
				req.session!.sessionFlash = {
					errors: {fields: {cancellationReason: ['attendee.validation.cancellationReason.empty']}}}
				return req.session!.save(() => {
					res.redirect(`/content-management/courses/${req.params.courseUid}/modules/${req.params.moduleUid}/events/${req.params.eventUid}/attendee/${req.params.bookingUid}/cancel`)
				})
			}

			try {
				await this.cslService.cancelBooking(courseUid, moduleUid, eventUid,
					req.params.bookingUid, new CancelBookingDto(data.cancellationReason))
			} catch (error) {
				req.session!.sessionFlash = {
					errors: {fields: {cancellationReason: ['attendee.validation.cancellationReason.empty']}}}
				return req.session!.save(() => {
					res.redirect(`/content-management/courses/${req.params.courseUid}/modules/${req.params.moduleUid}/events/${req.params.eventUid}/attendee/${req.params.bookingUid}/cancel`)
				})
			}

			return res.redirect(`/content-management/courses/${courseUid}/modules/${moduleUid}/events-overview/${eventUid}`)
		}
	}
}
