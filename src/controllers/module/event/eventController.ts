import {LearningCatalogue} from '../../../learning-catalogue/index'
import {Validator} from '../../../learning-catalogue/validator/validator'
import {Request, Response, Router} from 'express'
import {EventFactory} from '../../../learning-catalogue/model/factory/eventFactory'
import {Event} from '../../../learning-catalogue/model/event'
import * as datetime from '../../../lib/datetime'
import {RequestUtil} from '../../../lib/requestUtil'

export class EventController {
	learningCatalogue: LearningCatalogue
	eventValidator: Validator<Event>
	eventFactory: EventFactory
	router: Router

	constructor(learningCatalogue: LearningCatalogue, eventValidator: Validator<Event>, eventFactory: EventFactory) {
		this.learningCatalogue = learningCatalogue
		this.eventValidator = eventValidator
		this.eventFactory = eventFactory
		this.router = Router()

		this.setRouterPaths()
	}

	/* istanbul ignore next */
	private setRouterPaths() {
		this.router.param('courseId', async (req, res, next, courseId) => {
			const course = await this.learningCatalogue.getCourse(courseId, RequestUtil.getAccessToken(req))

			if (course) {
				res.locals.course = course
				next()
			} else {
				res.sendStatus(404)
			}
		})

		this.router.param('moduleId', async (req, res, next, moduleId) => {
			const module = await this.learningCatalogue.getModule(res.locals.course.id, moduleId, RequestUtil.getAccessToken(req))

			if (module) {
				res.locals.module = module
				next()
			} else {
				res.sendStatus(404)
			}
		})

		this.router.param('eventId', async (req, res, next, eventId) => {
			const event = await this.learningCatalogue.getEvent(res.locals.course.id, res.locals.module.id, eventId, RequestUtil.getAccessToken(req))

			if (module) {
				res.locals.event = event
				next()
			} else {
				res.sendStatus(404)
			}
		})

		this.router.param('courseId', async (req, res, next, courseId) => {
			const date = new Date(Date.now())
			res.locals.exampleYear = date.getFullYear() + 1
			next()
		})

		this.router.get(
			'/content-management/courses/:courseId/modules/:moduleId/events/location/:eventId?',
			this.getLocation()
		)
		this.router.post(
			'/content-management/courses/:courseId/modules/:moduleId/events/location/:eventId?',
			this.setLocation()
		)

		this.router.get('/content-management/courses/:courseId/modules/:moduleId/events/:eventId?', this.getDateTime())
		this.router.post('/content-management/courses/:courseId/modules/:moduleId/events/:eventId?', this.setDateTime())
		this.router.get(
			'/content-management/courses/:courseId/modules/:moduleId/events-preview/:eventId?',
			this.getDatePreview()
		)
		this.router.get(
			'/content-management/courses/:courseId/modules/:moduleId/events-overview/:eventId',
			this.getEventOverview()
		)
	}

	public getDateTime() {
		return async (request: Request, response: Response) => {
			response.render('page/course/module/events/events', {event: request.session!.event})
		}
	}

	public setDateTime() {
		return async (request: Request, response: Response) => {
			let data = {
				...request.body,
			}

			const courseId = request.params.courseId
			const moduleId = request.params.moduleId
			const eventId = request.params.eventId

			data.dateRanges = datetime.parseDate(data)

			let errors = await this.eventValidator.check(data, ['event.dateRanges'])
			errors = datetime.validateDateTime(data, errors)
			errors.size = Object.keys(errors.fields).length

			let event = await this.eventFactory.create(data)

			if (errors.size) {
				request.session!.sessionFlash = {errors: errors, event: event}
				request.session!.save(() => {
					response.redirect(`/content-management/courses/${courseId}/modules/${moduleId}/events`)
				})
			} else {
				const eventToMerge = eventId ? response.locals.event : request.session!.event

				if (eventToMerge) {
					eventToMerge.dateRanges.push(event.dateRanges[0])
					event = eventToMerge
				}

				request.session!.event = event
				request.session!.save(() => {
					response.redirect(`/content-management/courses/${courseId}/modules/${moduleId}/events`)
				})
			}
		}
	}

	public getDatePreview() {
		return async (request: Request, response: Response) => {
			response.render('page/course/module/events/events-preview')
		}
	}

	public getLocation() {
		return async (req: Request, res: Response) => {
			res.render('page/course/module/events/event-location', {event: req.session!.event})
		}
	}

	public setLocation() {
		return async (req: Request, res: Response) => {
			const data = {
				venue: {
					location: req.body.location,
					address: req.body.address,
					capacity: parseInt(req.body.capacity, 10),
					minCapacity: parseInt(req.body.minCapacity, 10),
				},
			}

			const errors = await this.eventValidator.check(data, ['event.location'])
			const event = await this.eventFactory.create(data)

			if (errors.size) {
				req.session!.sessionFlash = {errors: errors}
				req.session!.event = req.session!.event
					? (function() {
							const mergedEvent = req.session!.event
							mergedEvent.venue = event.venue
							return mergedEvent
					  })()
					: event
				req.session!.save(() => {
					res.redirect(
						`/content-management/courses/${req.params.courseId}/modules/${
							req.params.moduleId
						}/events/location`
					)
				})
			} else {
				if (req.session!.event) {
					const mergedEvent = req.session!.event
					mergedEvent.venue = event.venue

					const savedEvent = await this.learningCatalogue.createEvent(
						req.params.courseId,
						req.params.moduleId,
						mergedEvent,
						RequestUtil.getAccessToken(req)
					)

					delete req.session!.event

					req.session!.sessionFlash = {event: savedEvent}

					req.session!.save(() => {
						res.redirect(
							`/content-management/courses/${req.params.courseId}/modules/${
								req.params.moduleId
							}/events-overview/${savedEvent.id}`
						)
					})
				} else {
					res.redirect(
						`/content-management/courses/${req.params.courseId}/modules/${req.params.moduleId}/events`
					)
				}
			}
		}
	}

	public getEventOverview() {
		return async (req: Request, res: Response) => {
			const event = res.locals.event
			const eventDateWithMonthAsText: string = datetime.convertDate(event.dateRanges[0].date)
			res.render('page/course/module/events/events-overview', {eventDateWithMonthAsText})
		}
	}
}
