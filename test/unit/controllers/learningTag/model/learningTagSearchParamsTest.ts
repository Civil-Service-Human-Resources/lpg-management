import {describe, it} from 'mocha'
import {expect} from 'chai'
import {plainToInstance} from 'class-transformer'
import {LearningTagCourseSearchParams} from '../../../../../src/controllers/learningTag/model/learningTagCourseSearchParams'
import {LearningTagHyperlinksSearchParams} from '../../../../../src/controllers/learningTag/model/learningTagHyperlinksSearchParams'

describe('Learning tag search params tests', () => {
	describe('LearningTagCourseSearchParams', () => {
		it('should generate URL with #courses anchor and coursePage', () => {
			const params = new LearningTagCourseSearchParams(123)
			const url = params.getAsUrlParams(2)
			expect(url).to.eql('/content-management/learning-tags/123/courses?coursePage=2#courses')
		})

		it('should preserve linkPage when generating course URL', () => {
			const params = new LearningTagCourseSearchParams(123)
			params.linkPage = 1
			const url = params.getAsUrlParams(2)
			expect(url).to.eql('/content-management/learning-tags/123/courses?coursePage=2&linkPage=2#courses')
		})

		it('should transform coursePage query parameter', () => {
			const params = plainToInstance(LearningTagCourseSearchParams, {coursePage: '3', linkPage: '2'})
			expect(params.coursePage).to.eql(2)
			expect(params.linkPage).to.eql(1)
			expect(params.p).to.eql(2)
		})

		it('should transform p query parameter when coursePage is not provided', () => {
			const params = plainToInstance(LearningTagCourseSearchParams, {p: '3'})
			expect(params.coursePage).to.eql(2)
			expect(params.p).to.eql(2)
		})

		it('should default coursePage and linkPage to 0 if not provided', () => {
			const params = plainToInstance(LearningTagCourseSearchParams, {})
			expect(params.coursePage).to.eql(0)
			expect(params.linkPage).to.eql(0)
			expect(params.p).to.eql(0)
		})

		it('should generate base URL correctly', () => {
			const params = new LearningTagCourseSearchParams(123)
			expect(params.getBaseUrl()).to.eql('/content-management/learning-tags/123/courses')
		})
	})

	describe('LearningTagHyperlinksSearchParams', () => {
		it('should generate URL with #links anchor and linkPage', () => {
			const params = new LearningTagHyperlinksSearchParams(123)
			const url = params.getAsUrlParams(2)
			expect(url).to.eql('/content-management/learning-tags/123/courses?linkPage=2#links')
		})

		it('should preserve coursePage when generating link URL', () => {
			const params = new LearningTagHyperlinksSearchParams(123)
			params.coursePage = 1
			const url = params.getAsUrlParams(2)
			expect(url).to.eql('/content-management/learning-tags/123/courses?coursePage=2&linkPage=2#links')
		})

		it('should transform linkPage query parameter', () => {
			const params = plainToInstance(LearningTagHyperlinksSearchParams, {coursePage: '2', linkPage: '3'})
			expect(params.coursePage).to.eql(1)
			expect(params.linkPage).to.eql(2)
			expect(params.p).to.eql(2)
		})

		it('should default linkPage to 0 when only coursePage or p is provided', () => {
			const params = plainToInstance(LearningTagHyperlinksSearchParams, {coursePage: '2'})
			expect(params.coursePage).to.eql(1)
			expect(params.linkPage).to.eql(0)
			expect(params.p).to.eql(0)
		})

		it('should generate base URL correctly', () => {
			const params = new LearningTagHyperlinksSearchParams(123)
			expect(params.getBaseUrl()).to.eql('/content-management/learning-tags/123/courses')
		})
	})
})
