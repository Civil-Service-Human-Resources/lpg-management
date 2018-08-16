import {beforeEach, describe, it} from 'mocha'
import {expect} from 'chai'
import {DefaultPageResults} from '../../../../src/learning-catalogue/model/defaultPageResults'
import {Course} from '../../../../src/learning-catalogue/model/course'

describe('CoursePageResults tests', () => {
	let course: DefaultPageResults<Course>

	beforeEach(() => {
		course = new DefaultPageResults()
	})

	it('should be able to set page', () => {
		course.page = 0
		expect(course.page).to.equal(0)
	})

	it('should be able to set results', () => {
		const courses = [new Course(), new Course()]
		course.results = courses
		expect(course.results).to.equal(courses)
	})

	it('should be able to set size', () => {
		course.size = 10
		expect(course.size).to.equal(10)
	})

	it('should be able to set total results', () => {
		course.totalResults = 30
		expect(course.totalResults).to.equal(30)
	})

	it('should be able to get range start ', () => {
		course.page = 0
		course.size = 10
		expect(course.getRangeStart()).to.equal(1)
	})

	it('should be able to get range end ', () => {
		course.page = 0
		course.size = 10

		const courses = [new Course(), new Course()]
		course.results = courses

		expect(course.getRangeEnd()).to.equal(2)
	})

	it('should be able to get length ', () => {
		const courses = [new Course(), new Course()]
		course.results = courses

		expect(course.getLength()).to.equal(2)
	})

	it('should be able to get page count ', () => {
		course.size = 10
		course.totalResults = 100

		expect(course.getPageCount()).to.equal(10)
	})

	it('should be able to get next page', () => {
		course.page = 0

		expect(course.getNextPage()).to.equal(1)
	})

	it('should be able to get previous page', () => {
		course.page = 5

		expect(course.getPreviousPage()).to.equal(4)
	})
})
