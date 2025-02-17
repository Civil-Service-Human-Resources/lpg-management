import {Course} from '../../../src/learning-catalogue/model/course'
import {beforeEach, describe, it} from 'mocha'
import * as sinonChai from 'sinon-chai'
import * as sinon from 'sinon'
import * as chai from 'chai'
import {expect} from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import {LearningCatalogue} from '../../../src/learning-catalogue'
import {Module} from '../../../src/learning-catalogue/model/module'
import {EntityService} from '../../../src/learning-catalogue/service/entityService'
import {Auth} from '../../../src/identity/auth'
import {Event} from '../../../src/learning-catalogue/model/event'
import {Audience} from '../../../src/learning-catalogue/model/audience'
import {CslServiceClient} from '../../../src/csl-service/client'
import {RestServiceConfig} from '../../../src/lib/http/restServiceConfig'
import {CourseTypeAheadCache} from '../../../src/learning-catalogue/courseTypeaheadCache'
import {BasicCourse, CourseTypeAhead} from '../../../src/learning-catalogue/courseTypeAhead'
import {plainToInstance} from 'class-transformer'

chai.use(chaiAsPromised)
chai.use(sinonChai)

describe('Learning Catalogue tests', () => {
	let courseService: EntityService<Course>
	let moduleService: EntityService<Module>
	let audienceService: EntityService<Audience>
	let eventService: EntityService<Event>
	let cslService: CslServiceClient
	let courseTypeaheadCache: sinon.SinonStubbedInstance<CourseTypeAheadCache>

	const config = new RestServiceConfig('http://example.org', 60000)
	const typeahead = new CourseTypeAhead([new BasicCourse("course1", "Course 1")])

	let learningCatalogue: LearningCatalogue

	beforeEach(() => {
		courseService = <EntityService<Course>>{}
		moduleService = <EntityService<Module>>{}
		eventService = <EntityService<Event>>{}
		audienceService = <EntityService<Audience>>{}
		cslService = <CslServiceClient>{}
		cslService.clearCourseCache = sinon.stub()
		courseTypeaheadCache = sinon.createStubInstance(CourseTypeAheadCache)

		learningCatalogue = new LearningCatalogue(config, {} as Auth, cslService, courseTypeaheadCache as any)
		learningCatalogue.courseService = courseService
		learningCatalogue.moduleService = moduleService
		learningCatalogue.eventService = eventService
		learningCatalogue.audienceService = audienceService
	})

	describe('course service', () => {
		it('should call courseService when listing courses', async () => {
			courseService.listAllWithPagination = sinon.stub()

			await learningCatalogue.listCourses()

			return expect(courseService.listAllWithPagination).to.have.been.calledOnceWith('/courses/management?page=0&size=10&visibility=PRIVATE&visibility=PUBLIC')
		})

		it('should call courseService when searching courses', async () => {
			courseService.listAllWithPagination = sinon.stub()

			await learningCatalogue.searchCourses('test', 0, 10)

			return expect(courseService.listAllWithPagination).to.have.been.calledOnceWith(
				`/search/management/courses?status=DRAFT&status=PUBLISHED&status=ARCHIVED&query=test&page=0&size=10&visibility=PRIVATE&visibility=PUBLIC`
			)
		})

		it('should call courseService and add to the cache when creating a course', async () => {
			const course: Course = plainToInstance(Course, {id: "id", title: "title"})
			courseService.create = sinon.stub().resolves(course)

			courseTypeaheadCache.getTypeahead.withArgs().resolves(typeahead)
			await learningCatalogue.createCourse(course)

			expect(courseTypeaheadCache.setTypeahead).to.have.been.calledOnce
			return expect(courseService.create).to.have.been.calledOnceWith('/courses/', course)
		})

		it('should call courseService and update the cache when updating a course', async () => {
			const course: Course = plainToInstance(Course, {id: "id", title: "title"})
			courseService.update = sinon.stub().resolves(course)

			courseTypeaheadCache.getTypeahead.withArgs().resolves(typeahead)
			await learningCatalogue.updateCourse(course)

			expect(courseTypeaheadCache.setTypeahead).to.have.been.calledOnce
			return expect(courseService.update).to.have.been.calledOnceWith(`/courses/${course.id}`, course)
		})

		it('should call courseService when publishing a course', async () => {
			const course: Course = <Course>{}
			courseService.update = sinon.stub()

			await learningCatalogue.publishCourse(course)

			return expect(courseService.update).to.have.been.calledOnceWith(`/courses/${course.id}/publish`, course)
		})

		it('should call courseService when archiving a course', async () => {
			const course: Course = plainToInstance(Course, {id: "id", title: "title"})
			courseService.update = sinon.stub().resolves(course)

			courseTypeaheadCache.getTypeahead.withArgs().resolves(typeahead)
			await learningCatalogue.archiveCourse(course)

			expect(courseTypeaheadCache.setTypeahead).to.have.been.calledOnce
			return expect(courseService.update).to.have.been.calledOnceWith(`/courses/${course.id}/archive`, course)
		})

		it('should call courseService when getting a course', async () => {
			const courseId: string = 'course-id'
			courseService.get = sinon.stub()

			await learningCatalogue.getCourse(courseId)
			return expect(courseService.get).to.have.been.calledOnceWith(`/courses/${courseId}`)
		})
	})

	describe('module service', () => {
		it('should call moduleService when creating a module', async () => {
			const courseId: string = 'course-id'
			const module: Module = <Module>{}
			moduleService.create = sinon.stub()

			await learningCatalogue.createModule(courseId, module)

			return expect(moduleService.create).to.have.been.calledOnceWith(`/courses/${courseId}/modules/`, module)
		})

		it('should call moduleService when getting a module', async () => {
			const courseId: string = 'course-id'
			const moduleId: string = 'module-id'
			moduleService.get = sinon.stub()

			await learningCatalogue.getModule(courseId, moduleId)

			return expect(moduleService.get).to.have.been.calledOnceWith(`/courses/${courseId}/modules/${moduleId}`)
		})

		it('should call moduleService when updating a module', async () => {
			const courseId: string = 'course-id'
			const module: Module = <Module>{}
			module.id = 'id123'
			moduleService.update = sinon.stub()

			await learningCatalogue.updateModule(courseId, module)

			return expect(moduleService.update).to.have.been.calledOnceWith(`/courses/${courseId}/modules/${module.id}`)
		})

		it('should call moduleService when deleting a module', async () => {
			const courseId: string = 'course-id'
			const moduleId: string = 'module-id'
			moduleService.delete = sinon.stub()

			await learningCatalogue.deleteModule(courseId, moduleId)

			return expect(moduleService.delete).to.have.been.calledOnceWith(`/courses/${courseId}/modules/${moduleId}`)
		})
	})

	describe('event service', () => {
		it('should call eventService when creating an event', async () => {
			const courseId: string = 'course-id'
			const moduleId: string = 'module-id'
			const event: Event = <Event>{}

			eventService.create = sinon.stub()

			await learningCatalogue.createEvent(courseId, moduleId, event)

			return expect(eventService.create).to.have.been.calledOnceWith(`/courses/${courseId}/modules/${moduleId}/events`, event)
		})

		it('should call eventService when getting an event', async () => {
			const courseId: string = 'course-id'
			const moduleId: string = 'module-id'
			const eventId: string = 'event-id'

			eventService.get = sinon.stub()

			await learningCatalogue.getEvent(courseId, moduleId, eventId)

			return expect(eventService.get).to.have.been.calledOnceWith(`/courses/${courseId}/modules/${moduleId}/events/${eventId}`)
		})

		it('should call eventService when updating an event', async () => {
			const courseId: string = 'course-id'
			const moduleId: string = 'module-id'
			const eventId: string = 'event-id'
			const event: Event = <Event>{}

			eventService.update = sinon.stub()

			await learningCatalogue.updateEvent(courseId, moduleId, eventId, event)

			return expect(eventService.update).to.have.been.calledOnceWith(`/courses/${courseId}/modules/${moduleId}/events/${eventId}`, event)
		})
	})

	describe('audience service', () => {
		it('should call audienceService when creating an audience', async () => {
			const courseId: string = 'course-id'
			const audience: Audience = <Audience>{}

			audienceService.create = sinon.stub()

			await learningCatalogue.createAudience(courseId, audience)

			return expect(audienceService.create).to.have.been.calledOnceWith(`/courses/${courseId}/audiences`, audience)
		})

		it('should call audienceService when getting an audience', async () => {
			const courseId: string = 'course-id'
			const audienceId: string = 'audience-id'

			audienceService.get = sinon.stub()

			await learningCatalogue.getAudience(courseId, audienceId)

			return expect(audienceService.get).to.have.been.calledOnceWith(`/courses/${courseId}/audiences/${audienceId}`)
		})

		it('should call audienceService when updating an audience', async () => {
			const courseId: string = 'course-id'
			const audienceId: string = 'audience-id'
			const audience: Audience = <Audience>{}
			audience.id = audienceId

			audienceService.update = sinon.stub()

			await learningCatalogue.updateAudience(courseId, audience)

			return expect(audienceService.update).to.have.been.calledOnceWith(`/courses/${courseId}/audiences/${audienceId}`, audience)
		})

		it('should call audienceService when deleting an audience', async () => {
			const courseId: string = 'course-id'
			const audienceId: string = 'audience-id'

			audienceService.delete = sinon.stub()

			await learningCatalogue.deleteAudience(courseId, audienceId)

			return expect(audienceService.delete).to.have.been.calledOnceWith(`/courses/${courseId}/audiences/${audienceId}`)
		})
	})

})
