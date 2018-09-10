import {LearningCatalogue} from '../../../learning-catalogue/index'
import {Validator} from '../../../learning-catalogue/validator/validator'
import {Request, Response, Router} from 'express'
import {EventFactory} from '../../../learning-catalogue/model/factory/eventFactory'
import {Event} from '../../../learning-catalogue/model/event'
import * as datetime from '../../../lib/datetime'

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
			const course = await this.learningCatalogue.getCourse(courseId)

			if (course) {
				res.locals.course = course
				next()
			} else {
				res.sendStatus(404)
			}
		})

		this.router.param('moduleId', async (req, res, next, moduleId) => {
			const module = await this.learningCatalogue.getModule(res.locals.course.id, moduleId)

			if (module) {
				res.locals.module = module
				next()
			} else {
				res.sendStatus(404)
			}
		})

		this.router.param('eventId', async (req, res, next, eventId) => {
			const event = await this.learningCatalogue.getEvent(res.locals.course.id, res.locals.module.id, eventId)

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

		this.router.get('/content-management/courses/:courseId/modules/:moduleId/events/:eventId?', this.getDateTime())
		this.router.post('/content-management/courses/:courseId/modules/:moduleId/events/:eventId?', this.setDateTime())
		this.router.get(
			'/content-management/courses/:courseId/modules/:moduleId/events-preview/:eventId?',
			this.getDatePreview()
		)
	}

	public getDateTime() {
		return async (request: Request, response: Response) => {
			response.render('page/course/module/events/events')
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
			if (eventId) {
				event = response.locals.event
			}

			if (errors.size) {
				request.session!.sessionFlash = {errors: errors, event: event}
				return response.redirect(`/content-management/courses/${courseId}/modules/${moduleId}/events/`)
			}

			let savedEvent
			if (eventId) {
				event.dateRanges.push(data.dateRanges[0])

				savedEvent = await this.learningCatalogue.updateEvent(courseId, moduleId, eventId, event)
			} else {
				savedEvent = await this.learningCatalogue.createEvent(courseId, moduleId, event)
			}

			request.session!.sessionFlash = {event: savedEvent}

			return response.redirect(
				`/content-management/courses/${courseId}/modules/${moduleId}/events-preview/${savedEvent.id}`
			)
		}
	}

	public getDatePreview() {
		return async (request: Request, response: Response) => {
			response.render('page/course/module/events/events-preview')
		}
	}
}
