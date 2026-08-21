import {describe, it} from 'mocha'
import {expect} from 'chai'
import {LearningTagCourseSearchParams} from '../../../../../src/controllers/learningTag/model/learningTagCourseSearchParams'
import {LearningTagHyperlinksSearchParams} from '../../../../../src/controllers/learningTag/model/learningTagHyperlinksSearchParams'

describe('Learning tag search params tests', () => {
	describe('LearningTagCourseSearchParams', () => {
		it('should generate URL with #courses anchor', () => {
			const params = new LearningTagCourseSearchParams(123)
			const url = params.getAsUrlParams(2)
			expect(url).to.eql('/content-management/learning-tags/123/courses?p=2#courses')
		})

		it('should generate base URL correctly', () => {
			const params = new LearningTagCourseSearchParams(123)
			expect(params.getBaseUrl()).to.eql('/content-management/learning-tags/123/courses')
		})
	})

	describe('LearningTagHyperlinksSearchParams', () => {
		it('should generate URL with #links anchor', () => {
			const params = new LearningTagHyperlinksSearchParams(123)
			const url = params.getAsUrlParams(2)
			expect(url).to.eql('/content-management/learning-tags/123/courses?p=2#links')
		})

		it('should generate base URL correctly', () => {
			const params = new LearningTagHyperlinksSearchParams(123)
			expect(params.getBaseUrl()).to.eql('/content-management/learning-tags/123/courses')
		})
	})
})
