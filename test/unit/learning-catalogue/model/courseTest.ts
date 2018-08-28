import {beforeEach, describe, it} from 'mocha'
import {expect} from 'chai'
import {Course} from '../../../../src/learning-catalogue/model/course'
import {VideoModule} from '../../../../src/learning-catalogue/model/videoModule'
import {LinkModule} from '../../../../src/learning-catalogue/model/linkModule'
import {FaceToFaceModule} from '../../../../src/learning-catalogue/model/faceToFaceModule'
import {Module} from '../../../../src/learning-catalogue/model/module'

describe('Course tests', () => {
	let course: Course

	beforeEach(() => {
		course = new Course()
	})

	it('should be able to set id', () => {
		course.id = 'test-id'
		expect(course.id).to.equal('test-id')
	})

	it('should be able to set title', () => {
		course.title = 'test-title'
		expect(course.title).to.equal('test-title')
	})

	it('should be able to set shortDescription', () => {
		course.shortDescription = 'test-shortDescription'
		expect(course.shortDescription).to.equal('test-shortDescription')
	})

	it('should be able to set description', () => {
		course.description = 'test-description'
		expect(course.description).to.equal('test-description')
	})

	it('should be able to set duration', () => {
		course.duration = 999
		expect(course.duration).to.equal(999)
	})

	it('should be able to set learningOutcomes', () => {
		course.learningOutcomes = 'test-learningOutcomes'
		expect(course.learningOutcomes).to.equal('test-learningOutcomes')
	})

	it('should be able to set price', () => {
		course.price = 1000
		expect(course.price).to.equal(1000)
	})

	it('should be able to set modules', () => {
		const modules = [new Module()]

		course.modules = modules

		expect(course.modules).to.equal(modules)
	})

	it('should be able to get costs by sum of module costs', () => {
		const module1 = new VideoModule()
		module1.price = 100

		const module2 = new LinkModule()
		module2.price = 50

		const module3 = new FaceToFaceModule()
		module3.price = 25.25

		course.modules = [module1, module2, module3]

		expect(course.getCost()).to.equal(175.25)
	})

	it('should get null if no module costs', () => {
		course.modules = []

		expect(course.getCost()).to.equal(null)
	})

	it('should get 0 if no module costs are 0', () => {
		const module1 = new VideoModule()
		module1.price = 0

		const module2 = new LinkModule()
		module2.price = 0

		const module3 = new FaceToFaceModule()
		module3.price = 0

		course.modules = [module1, module2, module3]
		expect(course.getCost()).to.equal(0)
	})

	it('should get type to be null if no modules', () => {
		course.modules = []

		expect(course.getType()).to.equal('course')
	})

	it('should get type to be blended if more than one module', () => {
		course.modules = [new Module(), new Module(), new Module()]

		expect(course.getType()).to.equal('blended')
	})

	it('should get type to be type of module if only one module', () => {
		const module1 = new Module()
		module1.type = 'video'

		course.modules = [module1]

		expect(course.getType()).to.equal('video')
	})
})
