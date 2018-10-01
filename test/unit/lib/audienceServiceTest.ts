import {describe} from 'mocha'
import {expect} from 'chai'
import {AudienceService} from '../../../src/lib/audienceService'
import {CourseFactory} from '../../../src/learning-catalogue/model/factory/courseFactory'

describe('AudienceService', () => {
	const learningCatalogue: any = {}
	let audienceService: AudienceService

	before(() => {
		audienceService = new AudienceService(learningCatalogue)
	})

	describe('#setDepartmentsOnAudience', () => {
		it('should set departments on given course and audienceId', () => {
			const audienceId = 'audienceId'
			const course = new CourseFactory().create({
				audiences: [
					{
						id: audienceId,
						departments: [],
					},
				],
			})
			const departments = ['dep1', 'dep2']

			audienceService.setDepartmentsOnAudience(course, audienceId, departments)
			expect(course.audiences[0].departments).to.be.equal(departments)
		})
	})

	describe('#setAreasOfWorkOnAudience', () => {
		it('should set areas of work on given course and audienceId', () => {
			const audienceId = 'audienceId'
			const course = new CourseFactory().create({
				audiences: [
					{
						id: audienceId,
						areasOfWork: [],
					},
				],
			})
			const areasOfWork = ['aow1', 'aow2']

			audienceService.setAreasOfWorkOnAudience(course, audienceId, areasOfWork)
			expect(course.audiences[0].areasOfWork).to.be.equal(areasOfWork)
		})
	})
})
