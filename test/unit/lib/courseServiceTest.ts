import {describe} from 'mocha'
import {Audience} from '../../../src/learning-catalogue/model/audience'
import {CourseService} from '../../../src/lib/courseService'
import {Course} from '../../../src/learning-catalogue/model/course'
import {Event} from '../../../src/learning-catalogue/model/event'
import {Module} from '../../../src/learning-catalogue/model/module'
import * as chai from 'chai'
import {expect} from 'chai'
import * as sinon from 'sinon'
import * as chaiAsPromised from 'chai-as-promised'
import {FaceToFaceModule} from '../../../src/learning-catalogue/model/faceToFaceModule'

chai.use(chaiAsPromised)

describe('CourseService tests', () => {
	let learningCatalogue: any = {}
	let courseService: CourseService

	before(() => {
		courseService = new CourseService(learningCatalogue)
	})

	it('should get course sortDateRanges modules and save course', async () => {
		const courseId = 'course-id'

		const module1: Module = new Module()
		module1.id = '1'

		const module2: Module = new Module()
		module2.id = '2'

		const module3: Module = new Module()
		module3.id = '3'

		let course: Course = new Course()
		course.modules = [module1, module2, module3]

		learningCatalogue.getCourse = sinon
			.stub()
			.withArgs(courseId)
			.returns(course)
		learningCatalogue.updateCourse = sinon
			.stub()
			.withArgs(courseId)
			.returns(course)

		expect(course.modules.map(m => m.id)).to.be.eql(['1', '2', '3'])

		const sortedCourse = await courseService.sortModules(courseId, ['3', '2', '1'])

		expect(sortedCourse.modules.map(m => m.id)).to.be.eql(['3', '2', '1'])
	})

	it('should throw error if module id does not exist in course', async () => {
		const courseId = 'course-id'

		const module1: Module = new Module()
		module1.id = '1'

		const module2: Module = new Module()
		module2.id = '2'

		const module3: Module = new Module()
		module3.id = '3'

		let course: Course = new Course()
		course.modules = [module1, module2, module3]

		learningCatalogue.getCourse = sinon
			.stub()
			.withArgs(courseId)
			.returns(course)
		learningCatalogue.updateCourse = sinon
			.stub()
			.withArgs(courseId)
			.returns(course)

		return expect(courseService.sortModules(courseId, ['4', '2', '1'])).to.be.rejectedWith(
			'Module (id: 4) not found in course (id: course-id)'
		)
	})

	it('should throw error if length of modules and module ids does not match', async () => {
		const courseId = 'course-id'

		const module1: Module = new Module()
		module1.id = '1'

		const module2: Module = new Module()
		module2.id = '2'

		const module3: Module = new Module()
		module3.id = '3'

		let course: Course = new Course()
		course.modules = [module1, module2, module3]

		learningCatalogue.getCourse = sinon
			.stub()
			.withArgs(courseId)
			.returns(course)
		learningCatalogue.updateCourse = sinon
			.stub()
			.withArgs(courseId)
			.returns(course)

		return expect(courseService.sortModules(courseId, ['3', '2'])).to.be.rejectedWith(
			'Course modules length(3) does not match module ids length(2)'
		)
	})

	describe('helper function for displaying audiences on front-end', () => {
		let course: Course
		const event1Id = 'event-id-1'
		const event2Id = 'event-id-2'
		const event3Id = 'event-id-3'
		const audience1Id = 'audience-id-1'
		const audience2Id = 'audience-id-2'
		let event1: Event
		let event2: Event
		const module1Id = 'module-id-1'
		const module2Id = 'module-id-2'

		beforeEach(() => {
			course = new Course()
			const module1 = new FaceToFaceModule()
			module1.id = module1Id
			module1.type = Module.Type.FACE_TO_FACE
			event1 = <Event>{id: event1Id}
			module1.events = [event1]
			const module2 = new FaceToFaceModule()
			module2.id = module2Id
			module2.type = Module.Type.FACE_TO_FACE
			event2 = <Event>{id: event2Id}
			const event3 = <Event>{id: event3Id}
			module2.events = [event2, event3]
			course.modules = [module1, module2]
			const audience1 = new Audience()
			audience1.type = Audience.Type.PRIVATE_COURSE
			audience1.id = audience1Id
			audience1.eventId = event1Id
			const audience2 = new Audience()
			audience2.type = Audience.Type.PRIVATE_COURSE
			audience2.id = audience2Id
			audience2.eventId = event2Id
			course.audiences = [audience1, audience2]
		})

		describe('#getAllEventsOnCourse', () => {
			it('should return an array of events on all course modules', () => {
				expect(courseService.getAllEventsOnCourse(course)).to.be.deep.equal([
					{id: event1Id},
					{id: event2Id},
					{id: event3Id},
				])
			})
		})

		describe('#getAudienceIdToEventMapping', () => {
			it('should return a map from an audience id to the audience private course event', () => {
				const expectedMap: any = {}
				expectedMap[audience1Id] = event1
				expectedMap[audience2Id] = event2
				expect(courseService.getAudienceIdToEventMapping(course)).to.be.deep.equal(expectedMap)
			})
		})

		describe('#getEventIdToModuleIdMapping', () => {
			it('should return a map from private course event id to its corresponding module id ', () => {
				const expectedMap: any = {}
				expectedMap[event1Id] = module1Id
				expectedMap[event2Id] = module2Id
				expectedMap[event3Id] = module2Id
				expect(courseService.getEventIdToModuleIdMapping(course)).to.be.deep.equal(expectedMap)
			})
		})

		describe('#getUniqueGrades', () => {
			it('should return a unique list of grades from all audiences', () => {
				let course = new Course()

				course.audiences = [
					{
						id: 'a',
						name: 'name',
						type: Audience.Type.OPEN,
						grades: ['a', 'b', 'c'],
					},
					{
						id: 'b',
						name: 'name',
						type: Audience.Type.OPEN,
						grades: ['c', 'd', 'e'],
					},
					{
						id: 'c',
						name: 'name',
						type: Audience.Type.OPEN,
						grades: ['e', 'f', 'g'],
					}
				]


				const uniqueGrades = courseService.getUniqueGrades(course)

				expect(uniqueGrades).to.eql(['a', 'b', 'c', 'd', 'e', 'f', 'g'])
			})

			it('should not crash if audiences are undefined', () => {
				let course = new Course()

				const uniqueGrades = courseService.getUniqueGrades(course)

				expect(uniqueGrades).to.eql([])
			})

		})
	})
})
