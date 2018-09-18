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

chai.use(chaiAsPromised)
chai.use(sinonChai)

describe('Learning Catalogue tests', () => {
	let courseService: EntityService<Course>
	let moduleService: EntityService<Module>
	let learningProviderService: EntityService<LearningProvider>
	let cancellationPolicyService: EntityService<CancellationPolicy>
	let termsAndConditionsService: EntityService<TermsAndConditions>
	const accessToken: string = 'access-token'

	const config = new LearningCatalogueConfig({username: 'test-user', password: 'test-pass'}, 'http://example.org')

	let learningCatalogue: LearningCatalogue

	beforeEach(() => {
		courseService = <EntityService<Course>>{}
		moduleService = <EntityService<Module>>{}
		learningProviderService = <EntityService<LearningProvider>>{}
		cancellationPolicyService = <EntityService<CancellationPolicy>>{}
		termsAndConditionsService = <EntityService<TermsAndConditions>>{}

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

		await learningCatalogue.createCourse(course, accessToken)
		return expect(courseService.create).to.have.been.calledOnceWith('/courses/', course, accessToken)
	})

	it('should call courseService when updating a course', async () => {
		const course: Course = <Course>{}
		courseService.update = sinon.stub()

		await learningCatalogue.updateCourse(course, accessToken)
		return expect(courseService.update).to.have.been.calledOnceWith(`/courses/${course.id}`, course, accessToken)
	})

	it('should call courseService when getting a course', async () => {
		const courseId: string = 'course-id'
		courseService.get = sinon.stub()

		await learningCatalogue.getCourse(courseId, accessToken)
		return expect(courseService.get).to.have.been.calledOnceWith(`/courses/${courseId}`, accessToken)
	})

	it('should call courseService when listing courses', async () => {
		courseService.listAll = sinon.stub()

		await learningCatalogue.listCourses(accessToken)
		return expect(courseService.listAll).to.have.been.calledOnceWith('/courses?page=0&size=10', accessToken)
	})

	it('should call moduleService when creating a module', async () => {
		const courseId: string = 'course-id'
		const module: Module = <Module>{}
		moduleService.create = sinon.stub()

		await learningCatalogue.createModule(courseId, module, accessToken)
		return expect(moduleService.create).to.have.been.calledOnceWith(
			`/courses/${courseId}/modules/`,
			module,
			accessToken
		)
	})

	it('should call moduleService when getting a module', async () => {
		const courseId: string = 'course-id'
		const moduleId: string = 'module-id'
		moduleService.get = sinon.stub()

		await learningCatalogue.getModule(courseId, moduleId, accessToken)
		return expect(moduleService.get).to.have.been.calledOnceWith(
			`/courses/${courseId}/modules/${moduleId}`,
			accessToken
		)
	})

	it('should call learningProviderService when creating a learning provider', async () => {
		const learningProvider: LearningProvider = <LearningProvider>{}
		learningProviderService.create = sinon.stub()

		await learningCatalogue.createLearningProvider(learningProvider, accessToken)
		return expect(learningProviderService.create).to.have.been.calledOnceWith(
			'/learning-providers/',
			learningProvider,
			accessToken
		)
	})

	it('should call learningProviderService when getting a learning provider', async () => {
		const learningProviderId: string = 'learning-provider-id'
		learningProviderService.get = sinon.stub()

		await learningCatalogue.getLearningProvider(learningProviderId, accessToken)
		return expect(learningProviderService.get).to.have.been.calledOnceWith(
			`/learning-providers/${learningProviderId}`,
			accessToken
		)
	})

	it('should call learningProviderService when listing learning providers', async () => {
		learningProviderService.listAll = sinon.stub()

		await learningCatalogue.listLearningProviders(accessToken)
		return expect(learningProviderService.listAll).to.have.been.calledOnceWith(
			'/learning-providers?page=0&size=10',
			accessToken
		)
	})

	it('should call cancellationPolicyService when creating a cancellation policy', async () => {
		const cancellationPolicy: CancellationPolicy = <CancellationPolicy>{}
		const learningProviderId: string = 'learning-provider-id'

		cancellationPolicyService.create = sinon.stub()

		await learningCatalogue.createCancellationPolicy(learningProviderId, cancellationPolicy, accessToken)
		return expect(cancellationPolicyService.create).to.have.been.calledOnceWith(
			`/learning-providers/${learningProviderId}/cancellation-policies`,
			cancellationPolicy,
			accessToken
		)
	})

	it('should call cancellationPolicyService when updating a cancellation policy', async () => {
		const learningProviderId: string = 'learning-provider-id'

		const cancellationPolicy: CancellationPolicy = <CancellationPolicy>{}
		cancellationPolicy.id = 'cancellation-policy-id'

		cancellationPolicyService.update = sinon.stub()

		await learningCatalogue.updateCancellationPolicy(learningProviderId, cancellationPolicy, accessToken)
		return expect(cancellationPolicyService.update).to.have.been.calledOnceWith(
			`/learning-providers/${learningProviderId}/cancellation-policies/${cancellationPolicy.id}`,
			cancellationPolicy,
			accessToken
		)
	})

	it('should call cancellationPolicyService when getting a cancellation policy', async () => {
		const cancellationPolicyId: string = 'cancellation-policy-id'
		const learningProviderId: string = 'learning-provider-id'

		cancellationPolicyService.get = sinon.stub()

		await learningCatalogue.getCancellationPolicy(learningProviderId, cancellationPolicyId, accessToken)
		return expect(cancellationPolicyService.get).to.have.been.calledOnceWith(
			`/learning-providers/${learningProviderId}/cancellation-policies/${cancellationPolicyId}`,
			accessToken
		)
	})

	it('should call cancellationPolicyService when deleting a cancellation policy', async () => {
		const learningProviderId: string = 'learning-provider-id'

		const cancellationPolicy: CancellationPolicy = <CancellationPolicy>{}
		cancellationPolicy.id = 'cancellation-policy-id'

		cancellationPolicyService.delete = sinon.stub()

		await learningCatalogue.deleteCancellationPolicy(learningProviderId, cancellationPolicy.id, accessToken)
		return expect(cancellationPolicyService.delete).to.have.been.calledOnceWith(
			`/learning-providers/${learningProviderId}/cancellation-policies/${cancellationPolicy.id}`,
			accessToken
		)
	})

	it('should call termsAndConditionsService when creating a terms and conditions', async () => {
		const termsAndConditions: TermsAndConditions = <TermsAndConditions>{}
		const learningProviderId: string = 'learning-provider-id'

		termsAndConditionsService.create = sinon.stub()

		await learningCatalogue.createTermsAndConditions(learningProviderId, termsAndConditions, accessToken)

		return expect(termsAndConditionsService.create).to.have.been.calledOnceWith(
			`/learning-providers/${learningProviderId}/terms-and-conditions`,
			termsAndConditions,
			accessToken
		)
	})

	it('should call termsAndConditionsService when getting a terms and conditions', async () => {
		const termsAndConditionsId: string = 'terms-and-conditions-id'
		const learningProviderId: string = 'learning-provider-id'

		termsAndConditionsService.get = sinon.stub()

		await learningCatalogue.getTermsAndConditions(learningProviderId, termsAndConditionsId, accessToken)

		return expect(termsAndConditionsService.get).to.have.been.calledOnceWith(
			`/learning-providers/${learningProviderId}/terms-and-conditions/${termsAndConditionsId}`,
			accessToken
		)
	})

	it('should call termsAndConditionsService when updating a terms and conditions', async () => {
		const termsAndConditionsId: string = 'terms-and-conditions-id'
		const learningProviderId: string = 'learning-provider-id'

		const termsAndConditions: TermsAndConditions = <TermsAndConditions>{}
		termsAndConditions.id = 'terms-and-conditions-id'

		termsAndConditionsService.update = sinon.stub()

		await learningCatalogue.updateTermsAndConditions(learningProviderId, termsAndConditions, accessToken)

		return expect(termsAndConditionsService.update).to.have.been.calledOnceWith(
			`/learning-providers/${learningProviderId}/terms-and-conditions/${termsAndConditionsId}`,
			termsAndConditions,
			accessToken
		)
	})

	it('should call termsAndConditionsService when deleting a terms and conditions', async () => {
		const termsAndConditionsId: string = 'terms-and-conditions-id'
		const learningProviderId: string = 'learning-provider-id'

		termsAndConditionsService.delete = sinon.stub()

		await learningCatalogue.deleteTermsAndConditions(learningProviderId, termsAndConditionsId, accessToken)

		return expect(termsAndConditionsService.delete).to.have.been.calledOnceWith(
			`/learning-providers/${learningProviderId}/terms-and-conditions/${termsAndConditionsId}`,
			accessToken
		)
	})
})
