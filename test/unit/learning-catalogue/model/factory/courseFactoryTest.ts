import {beforeEach, describe, it} from 'mocha'
import * as sinonChai from 'sinon-chai'
import * as chai from 'chai'
import {expect} from 'chai'
import {ModuleFactory} from '../../../../../src/learning-catalogue/model/factory/moduleFactory'
import {CourseFactory} from '../../../../../src/learning-catalogue/model/factory/courseFactory'
import {Module} from '../../../../../src/learning-catalogue/model/module'
import {Course} from '../../../../../src/learning-catalogue/model/course'
import * as sinon from 'sinon'
import {Audience} from '../../../../../src/learning-catalogue/model/audience'
import {AudienceFactory} from '../../../../../src/learning-catalogue/model/factory/audienceFactory'
import {LearningProvider} from '../../../../../src/learning-catalogue/model/learningProvider'
import {LearningProviderFactory} from '../../../../../src/learning-catalogue/model/factory/learningProviderFactory'
import {Status} from '../../../../../src/learning-catalogue/model/status'

chai.use(sinonChai)

describe('CourseFactory tests', () => {
	let moduleFactory: ModuleFactory
	let courseFactory: CourseFactory
	let learningProviderFactory: LearningProviderFactory

	beforeEach(() => {
		moduleFactory = new ModuleFactory()
		courseFactory = new CourseFactory()
		learningProviderFactory = new LearningProviderFactory()
		courseFactory.moduleFactory = moduleFactory
		courseFactory.learningProviderFactory = learningProviderFactory
	})

	it('should create a a Course from data', () => {
		const id: string = 'L1U3cK3GQtuf3iDg71NqJw'
		const title: string = 'Working with budgets'
		const shortDescription = 'This topic introduces yo… governance processes.'
		const description: string = 'You learn about creating…in government’ topic.'
		const learningOutcomes: string = 'After completing this to…h the financial cycle'
		const moduleData = {
			id: 'jksdhskdjhsdfk',
			type: 'link',
		}
		const courseModule: Module = new ModuleFactory().create(moduleData)
		const audienceData = {
			areasOfWork: ['digital'],
			departments: ['co', 'hmrc'],
			grades: ['AA', 'G7'],
			interests: ['project management'],
			requiredBy: '2019-01-01T00:00:00',
			frequency: 'YEARLY',
			mandatory: true,
		}
		const courseAudience: Audience = new AudienceFactory().create(audienceData)
		const learningProviderData = {
			id: 'learningProviderId',
			name: 'learningProvider',
		}
		const courseLearningProvider: LearningProvider = new LearningProviderFactory().create(learningProviderData)

		const data: object = {
			id: id,
			title: title,
			shortDescription: shortDescription,
			description: description,
			learningOutcomes: learningOutcomes,
			modules: [moduleData],
			audiences: [audienceData],
			learningProvider: learningProviderData,
		}

		const result: Course = courseFactory.create(data)

		expect(result.id).to.equal(id)
		expect(result.title).to.equal(title)
		expect(result.shortDescription).to.equal(shortDescription)
		expect(result.description).to.equal(description)
		expect(result.learningOutcomes).to.equal(learningOutcomes)
		expect(result.modules[0]).to.deep.equal(courseModule)
		expect(result.audiences[0]).to.deep.equal(courseAudience)
		expect(result.learningProvider).to.deep.equal(courseLearningProvider)
		expect(result.status).to.equal(Status.DRAFT)
	})

	it('should add empty list if modules is null', () => {
		const id: string = 'L1U3cK3GQtuf3iDg71NqJw'
		const title: string = 'Working with budgets'
		const shortDescription = 'This topic introduces yo… governance processes.'
		const description: string = 'You learn about creating…in government’ topic.'
		const learningOutcomes: string = 'After completing this to…h the financial cycle'

		const data: object = {
			id: id,
			title: title,
			shortDescription: shortDescription,
			description: description,
			learningOutcomes: learningOutcomes,
			modules: null,
			status: "Published"
		}

		moduleFactory.create = sinon.stub()

		const result: Course = courseFactory.create(data)

		expect(result.id).to.equal(id)
		expect(result.title).to.equal(title)
		expect(result.shortDescription).to.equal(shortDescription)
		expect(result.description).to.equal(description)
		expect(result.learningOutcomes).to.equal(learningOutcomes)
		expect(result.modules).to.eql([])
		expect(moduleFactory.create).to.not.have.been.called
		expect(result.status).to.equal(Status.PUBLISHED)
	})

	it('should add empty object if learning provider is null', () => {
		const id: string = 'L1U3cK3GQtuf3iDg71NqJw'
		const title: string = 'Working with budgets'
		const shortDescription = 'This topic introduces yo… governance processes.'
		const description: string = 'You learn about creating…in government’ topic.'
		const learningOutcomes: string = 'After completing this to…h the financial cycle'
		const moduleData = {
			id: 'jksdhskdjhsdfk',
			type: 'link',
		}
		const courseModule: Module = new ModuleFactory().create(moduleData)
		const audienceData = {
			areasOfWork: ['digital'],
			departments: ['co', 'hmrc'],
			grades: ['AA', 'G7'],
			interests: ['project management'],
			requiredBy: '2019-01-01T00:00:00',
			frequency: 'YEARLY',
			mandatory: true,
		}
		const courseAudience: Audience = new AudienceFactory().create(audienceData)

		const data: object = {
			id: id,
			title: title,
			shortDescription: shortDescription,
			description: description,
			learningOutcomes: learningOutcomes,
			modules: [moduleData],
			audiences: [audienceData],
			learningProvider: null,
		}

		learningProviderFactory.create = sinon.stub()

		const result: Course = courseFactory.create(data)

		expect(result.id).to.equal(id)
		expect(result.title).to.equal(title)
		expect(result.shortDescription).to.equal(shortDescription)
		expect(result.description).to.equal(description)
		expect(result.learningOutcomes).to.equal(learningOutcomes)
		expect(result.modules[0]).to.deep.equal(courseModule)
		expect(result.audiences[0]).to.deep.equal(courseAudience)
		expect(learningProviderFactory.create).to.have.been.calledOnceWith({})
	})
})
