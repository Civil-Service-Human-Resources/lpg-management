import {Course} from 'src/learning-catalogue/model/course'
import {beforeEach, describe, it} from 'mocha'
import * as sinonChai from 'sinon-chai'
import * as sinon from 'sinon'
import * as chai from 'chai'
import {expect} from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import {LearningCatalogue} from '../../../src/learning-catalogue'
import {CourseService} from '../../../src/learning-catalogue/service/courseService'
import {ModuleService} from '../../../src/learning-catalogue/service/moduleService'
import {LearningCatalogueConfig} from '../../../src/learning-catalogue/learningCatalogueConfig'
import {Module} from '../../../src/learning-catalogue/model/module'
import {CancellationPolicyService} from '../../../src/learning-catalogue/service/cancellationPolicyService'
import {LearningProvider} from '../../../src/learning-catalogue/model/learningProvider'
import {LearningProviderService} from '../../../src/learning-catalogue/service/learningProviderService'
import {CancellationPolicy} from '../../../src/learning-catalogue/model/cancellationPolicy'
import {TermsAndConditions} from '../../../src/learning-catalogue/model/termsAndConditions'
import {TermsAndConditionsService} from '../../../src/learning-catalogue/service/termsAndConditionsService'

chai.use(chaiAsPromised)
chai.use(sinonChai)

describe('Learning Catalogue tests', () => {
	let courseService: CourseService
	let moduleService: ModuleService
	let learningProviderService: LearningProviderService
	let cancellationPolicyService: CancellationPolicyService
	let termsAndConditionsService: TermsAndConditionsService

	const config = new LearningCatalogueConfig({username: 'test-user', password: 'test-pass'}, 'http://example.org')

	let learningCatalogue: LearningCatalogue

	beforeEach(() => {
		courseService = <CourseService>{}
		moduleService = <ModuleService>{}
		learningProviderService = <LearningProviderService>{}
		cancellationPolicyService = <CancellationPolicyService>{}
		termsAndConditionsService = <TermsAndConditionsService>{}

		learningCatalogue = new LearningCatalogue(config)
		learningCatalogue.courseService = courseService
		learningCatalogue.moduleService = moduleService
		learningCatalogue.learningProviderService = learningProviderService
		learningCatalogue.cancellationPolicyService = cancellationPolicyService
		learningCatalogue.termsAndConditionsService = termsAndConditionsService
	})

	it('should call courseService when creating a course', async () => {
		const course: Course = <Course>{}
		courseService.create = sinon.stub()

		await learningCatalogue.createCourse(course)
		return expect(courseService.create).to.have.been.calledOnceWith(course)
	})

	it('should call courseService when getting a course', async () => {
		const courseId: string = 'course-id'
		courseService.get = sinon.stub()

		await learningCatalogue.getCourse(courseId)
		return expect(courseService.get).to.have.been.calledOnceWith(courseId)
	})

	it('should call courseService when listing courses', async () => {
		courseService.listAll = sinon.stub()

		await learningCatalogue.listCourses()
		return expect(courseService.listAll).to.have.been.calledOnce
	})

	it('should call moduleService when creating a module', async () => {
		const courseId: string = 'course-id'
		const module: Module = <Module>{}
		moduleService.create = sinon.stub()

		await learningCatalogue.createModule(courseId, module)
		return expect(moduleService.create).to.have.been.calledOnceWith(courseId, module)
	})

	it('should call moduleService when getting a module', async () => {
		const courseId: string = 'course-id'
		const moduleId: string = 'module-id'
		moduleService.get = sinon.stub()

		await learningCatalogue.getModule(courseId, moduleId)
		return expect(moduleService.get).to.have.been.calledOnceWith(courseId, moduleId)
	})

	it('should call moduleService when creating a module', async () => {
		const courseId: string = 'course-id'
		const module: Module = <Module>{}
		moduleService.create = sinon.stub()

		await learningCatalogue.createModule(courseId, module)
		return expect(moduleService.create).to.have.been.calledOnceWith(courseId, module)
	})

	it('should call moduleService when getting a module', async () => {
		const courseId: string = 'course-id'
		const moduleId: string = 'module-id'
		moduleService.get = sinon.stub()

		await learningCatalogue.getModule(courseId, moduleId)
		return expect(moduleService.get).to.have.been.calledOnceWith(courseId, moduleId)
	})

	it('should call learningProviderService when creating a learning provider', async () => {
		const learningProvider: LearningProvider = <LearningProvider>{}
		learningProviderService.create = sinon.stub()

		await learningCatalogue.createLearningProvider(learningProvider)
		return expect(learningProviderService.create).to.have.been.calledOnceWith(learningProvider)
	})

	it('should call learningProviderService when getting a learning provider', async () => {
		const learningProviderId: string = 'learning-provider-id'
		learningProviderService.get = sinon.stub()

		await learningCatalogue.getLearningProvider(learningProviderId)
		return expect(learningProviderService.get).to.have.been.calledOnceWith(learningProviderId)
	})

	it('should call learningProviderService when listing learning providers', async () => {
		learningProviderService.listAll = sinon.stub()

		await learningCatalogue.listLearningProviders()
		return expect(learningProviderService.listAll).to.have.been.calledOnce
	})

	it('should call cancellationPolicyService when creating a cancellation policy', async () => {
		const cancellationPolicy: CancellationPolicy = <CancellationPolicy>{}
		const learningProviderId: string = 'learning-provider-id'

		cancellationPolicyService.create = sinon.stub()

		await learningCatalogue.createCancellationPolicy(learningProviderId, cancellationPolicy)
		return expect(cancellationPolicyService.create).to.have.been.calledOnceWith(
			learningProviderId,
			cancellationPolicy
		)
	})

	it('should call cancellationPolicyService when getting a cancellation policy', async () => {
		const cancellationPolicyId: string = 'cancellation-policy-id'
		const learningProviderId: string = 'learning-provider-id'

		cancellationPolicyService.get = sinon.stub()

		await learningCatalogue.getCancellationPolicy(learningProviderId, cancellationPolicyId)
		return expect(cancellationPolicyService.get).to.have.been.calledOnceWith(
			learningProviderId,
			cancellationPolicyId
		)
	})

	it('should call termsAndConditionsService when creating a terms and conditions', async () => {
		const termsAndConditions: TermsAndConditions = <TermsAndConditions>{}
		const learningProviderId: string = 'learning-provider-id'

		termsAndConditionsService.create = sinon.stub()

		await learningCatalogue.createTermsAndConditions(learningProviderId, termsAndConditions)

		return expect(termsAndConditionsService.create).to.have.been.calledOnceWith(
			learningProviderId,
			termsAndConditions
		)
	})

	it('should call termsAndConditionsService when getting a terms and conditions', async () => {
		const termsAndConditionsId: string = 'terms-and-conditions-id'
		const learningProviderId: string = 'learning-provider-id'

		termsAndConditionsService.get = sinon.stub()

		await learningCatalogue.getTermsAndConditions(learningProviderId, termsAndConditionsId)

		return expect(termsAndConditionsService.get).to.have.been.calledOnceWith(
			learningProviderId,
			termsAndConditionsId
		)
	})
})
