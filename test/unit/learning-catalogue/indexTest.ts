import {Course} from 'src/learning-catalogue/model/course'
import {beforeEach, describe, it} from 'mocha'
import * as sinonChai from 'sinon-chai'
import * as sinon from 'sinon'
import * as chai from 'chai'
import {expect} from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import {LearningCatalogue} from '../../../src/learning-catalogue'
import {LearningCatalogueConfig} from '../../../src/learning-catalogue/learningCatalogueConfig'
import {Module} from '../../../src/learning-catalogue/model/module'
import {LearningProvider} from '../../../src/learning-catalogue/model/learningProvider'
import {CancellationPolicy} from '../../../src/learning-catalogue/model/cancellationPolicy'
import {TermsAndConditions} from '../../../src/learning-catalogue/model/termsAndConditions'
import {EntityService} from '../../../src/learning-catalogue/service/entityService'
import {Auth} from '../../../src/identity/auth'
import {Event} from '../../../src/learning-catalogue/model/event'
import {Audience} from '../../../src/learning-catalogue/model/audience'

chai.use(chaiAsPromised)
chai.use(sinonChai)

describe('Learning Catalogue tests', () => {
	let courseService: EntityService<Course>
	let moduleService: EntityService<Module>
	let audienceService: EntityService<Audience>
	let learningProviderService: EntityService<LearningProvider>
	let cancellationPolicyService: EntityService<CancellationPolicy>
	let termsAndConditionsService: EntityService<TermsAndConditions>
	let eventService: EntityService<Event>

	const config = new LearningCatalogueConfig('http://example.org')

	let learningCatalogue: LearningCatalogue

	beforeEach(() => {
		courseService = <EntityService<Course>>{}
		moduleService = <EntityService<Module>>{}
		eventService = <EntityService<Event>>{}
		audienceService = <EntityService<Audience>>{}
		learningProviderService = <EntityService<LearningProvider>>{}
		cancellationPolicyService = <EntityService<CancellationPolicy>>{}
		termsAndConditionsService = <EntityService<TermsAndConditions>>{}

		learningCatalogue = new LearningCatalogue(config, {} as Auth)
		learningCatalogue.courseService = courseService
		learningCatalogue.moduleService = moduleService
		learningCatalogue.eventService = eventService
		learningCatalogue.audienceService = audienceService
		learningCatalogue.learningProviderService = learningProviderService
		learningCatalogue.cancellationPolicyService = cancellationPolicyService
		learningCatalogue.termsAndConditionsService = termsAndConditionsService
	})

	describe('course service', () => {
		it('should call courseService when listing courses', async () => {
			courseService.listAllWithPagination = sinon.stub()

			await learningCatalogue.listCourses()

			return expect(courseService.listAllWithPagination).to.have.been.calledOnceWith('/courses/management?page=0&size=10')
		})

		it('should call courseService when searching courses', async () => {
			courseService.listAllWithPagination = sinon.stub()

			await learningCatalogue.searchCourses('test', 0, 10)

			return expect(courseService.listAllWithPagination).to.have.been.calledOnceWith(
				`/search/management/courses/?status=Draft&status=Published&status=Archived&query=test&page=0&size=10`
			)
		})

		it('should call courseService when creating a course', async () => {
			const course: Course = <Course>{}
			courseService.create = sinon.stub()

			await learningCatalogue.createCourse(course)

			return expect(courseService.create).to.have.been.calledOnceWith('/courses/', course)
		})

		it('should call courseService when updating a course', async () => {
			const course: Course = <Course>{}
			courseService.update = sinon.stub()

			await learningCatalogue.updateCourse(course)

			return expect(courseService.update).to.have.been.calledOnceWith(`/courses/${course.id}`, course)
		})

		it('should call courseService when publishing a course', async () => {
			const course: Course = <Course>{}
			courseService.update = sinon.stub()

			await learningCatalogue.publishCourse(course)

			return expect(courseService.update).to.have.been.calledOnceWith(`/courses/${course.id}/publish`, course)
		})

		it('should call courseService when archiving a course', async () => {
			const course: Course = <Course>{}
			courseService.update = sinon.stub()

			await learningCatalogue.archiveCourse(course)

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

	describe('learning provider service', () => {
		it('should call learningProviderService when creating a learning provider', async () => {
			const learningProvider: LearningProvider = <LearningProvider>{}
			learningProviderService.create = sinon.stub()

			await learningCatalogue.createLearningProvider(learningProvider)
			return expect(learningProviderService.create).to.have.been.calledOnceWith('/learning-providers/', learningProvider)
		})

		it('should call learningProviderService when getting a learning provider', async () => {
			const learningProviderId: string = 'learning-provider-id'
			learningProviderService.get = sinon.stub()

			await learningCatalogue.getLearningProvider(learningProviderId)
			return expect(learningProviderService.get).to.have.been.calledOnceWith(`/learning-providers/${learningProviderId}`)
		})

		it('should call learningProviderService when listing learning providers', async () => {
			learningProviderService.listAllWithPagination = sinon.stub()

			await learningCatalogue.listLearningProviders()
			return expect(learningProviderService.listAllWithPagination).to.have.been.calledOnce
		})

		it('should call cancellationPolicyService when creating a cancellation policy', async () => {
			const cancellationPolicy: CancellationPolicy = <CancellationPolicy>{}
			const learningProviderId: string = 'learning-provider-id'

			cancellationPolicyService.create = sinon.stub()

			await learningCatalogue.createCancellationPolicy(learningProviderId, cancellationPolicy)
			return expect(cancellationPolicyService.create).to.have.been.calledOnceWith(`/learning-providers/${learningProviderId}/cancellation-policies`, cancellationPolicy)
		})

		it('should call cancellationPolicyService when updating a cancellation policy', async () => {
			const learningProviderId: string = 'learning-provider-id'

			const cancellationPolicy: CancellationPolicy = <CancellationPolicy>{}
			cancellationPolicy.id = 'cancellation-policy-id'

			cancellationPolicyService.update = sinon.stub()

			await learningCatalogue.updateCancellationPolicy(learningProviderId, cancellationPolicy)
			return expect(cancellationPolicyService.update).to.have.been.calledOnceWith(
				`/learning-providers/${learningProviderId}/cancellation-policies/${cancellationPolicy.id}`,
				cancellationPolicy
			)
		})

		it('should call cancellationPolicyService when getting a cancellation policy', async () => {
			const cancellationPolicyId: string = 'cancellation-policy-id'
			const learningProviderId: string = 'learning-provider-id'

			cancellationPolicyService.get = sinon.stub()

			await learningCatalogue.getCancellationPolicy(learningProviderId, cancellationPolicyId)
			return expect(cancellationPolicyService.get).to.have.been.calledOnceWith(`/learning-providers/${learningProviderId}/cancellation-policies/${cancellationPolicyId}`)
		})

		it('should call cancellationPolicyService when deleting a cancellation policy', async () => {
			const learningProviderId: string = 'learning-provider-id'

			const cancellationPolicy: CancellationPolicy = <CancellationPolicy>{}
			cancellationPolicy.id = 'cancellation-policy-id'

			cancellationPolicyService.delete = sinon.stub()

			await learningCatalogue.deleteCancellationPolicy(learningProviderId, cancellationPolicy.id)
			return expect(cancellationPolicyService.delete).to.have.been.calledOnceWith(`/learning-providers/${learningProviderId}/cancellation-policies/${cancellationPolicy.id}`)
		})

		it('should call termsAndConditionsService when creating a terms and conditions', async () => {
			const termsAndConditions: TermsAndConditions = <TermsAndConditions>{}
			const learningProviderId: string = 'learning-provider-id'

			termsAndConditionsService.create = sinon.stub()

			await learningCatalogue.createTermsAndConditions(learningProviderId, termsAndConditions)

			return expect(termsAndConditionsService.create).to.have.been.calledOnceWith(`/learning-providers/${learningProviderId}/terms-and-conditions`, termsAndConditions)
		})

		it('should call termsAndConditionsService when getting a terms and conditions', async () => {
			const termsAndConditionsId: string = 'terms-and-conditions-id'
			const learningProviderId: string = 'learning-provider-id'

			termsAndConditionsService.get = sinon.stub()

			await learningCatalogue.getTermsAndConditions(learningProviderId, termsAndConditionsId)

			return expect(termsAndConditionsService.get).to.have.been.calledOnceWith(`/learning-providers/${learningProviderId}/terms-and-conditions/${termsAndConditionsId}`)
		})

		it('should call termsAndConditionsService when updating a terms and conditions', async () => {
			const termsAndConditionsId: string = 'terms-and-conditions-id'
			const learningProviderId: string = 'learning-provider-id'

			const termsAndConditions: TermsAndConditions = <TermsAndConditions>{}
			termsAndConditions.id = 'terms-and-conditions-id'

			termsAndConditionsService.update = sinon.stub()

			await learningCatalogue.updateTermsAndConditions(learningProviderId, termsAndConditions)

			return expect(termsAndConditionsService.update).to.have.been.calledOnceWith(`/learning-providers/${learningProviderId}/terms-and-conditions/${termsAndConditionsId}`)
		})

		it('should call termsAndConditionsService when deleting a terms and conditions', async () => {
			const termsAndConditionsId: string = 'terms-and-conditions-id'
			const learningProviderId: string = 'learning-provider-id'

			termsAndConditionsService.delete = sinon.stub()

			await learningCatalogue.deleteTermsAndConditions(learningProviderId, termsAndConditionsId)

			return expect(termsAndConditionsService.delete).to.have.been.calledOnceWith(`/learning-providers/${learningProviderId}/terms-and-conditions/${termsAndConditionsId}`)
		})
	})
})
