import {beforeEach, describe, it} from 'mocha'
import {Validator} from '../../../../src/learning-catalogue/validator/validator'
import * as chai from 'chai'
import {expect} from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import * as moment from 'moment'
import {ModuleFactory} from '../../../../src/learning-catalogue/model/factory/moduleFactory'
import {Module} from '../../../../src/learning-catalogue/model/module'

chai.use(chaiAsPromised)

describe('ModuleValidator tests', () => {
	let validator: Validator<Module>
	let moduleFactory: ModuleFactory
	let params: any

	beforeEach(() => {
		moduleFactory = new ModuleFactory()
		validator = new Validator<Module>(moduleFactory)

		params = {
			type: 'link',
			title: 'title',
			description: 'description',
			duration: 99,
			url: 'http://example.org',
			startPage: 'startPage',
			fileSize: 99,
			productCode: 'productCode',
		}
	})

	describe('ValidateCourse properties individually', async () => {
		it('should fail validation if title is not present', async () => {
			delete params.title
			const errors = await validator.check(params, ['title'])

			expect(errors.size).to.equal(1)
			expect(errors.fields['title']).to.eql(['validation_module_title_empty'])
		})

		it('should pass validation if title is present', async () => {
			const errors = await validator.check(params, ['title'])
			expect(errors.size).to.equal(0)
		})

		it('should fail validation if description is not present', async () => {
			delete params.description
			const errors = await validator.check(params, ['description'])

			expect(errors.size).to.equal(1)
			expect(errors.fields['description']).to.eql(['validation_module_description_empty'])
		})

		it('should pass validation if description is present', async () => {
			const errors = await validator.check(params, ['description'])
			expect(errors.size).to.equal(0)
		})

		it('should fail validation if duration is not present', async () => {
			delete params.duration
			const errors = await validator.check(params, ['duration'])

			expect(errors.size).to.equal(2)
			expect(errors.fields['duration']).to.eql([
				'validation.module.duration.empty',
				'validation.module.duration.positive',
			])
		})

		it('should fail validation if duration is not a positive number', async () => {
			params.duration = -99
			const errors = await validator.check(params, ['duration'])

			expect(errors.size).to.equal(1)
			expect(errors.fields['duration']).to.eql(['validation.module.duration.positive'])
		})

		it('should pass validation if duration is a positive number', async () => {
			const errors = await validator.check(params, ['duration'])
			expect(errors.size).to.equal(0)
		})

		it('should fail validation if url is not present on LinkModule', async () => {
			delete params.url
			const errors = await validator.check(params, ['url'])

			expect(errors.size).to.equal(2)
			expect(errors.fields['url']).to.eql(['validation_module_url_invalid', 'validation_module_blog_url_empty'])
		})

		it('should pass validation if url is present and has protocol and tld', async () => {
			const errors = await validator.check(params, ['url'])
			expect(errors.size).to.equal(0)
		})

		it('should fail validation if url has no protocol', async () => {
			params.url = 'example.org'
			const errors = await validator.check(params, ['url'])

			expect(errors.size).to.equal(1)
			expect(errors.fields['url']).to.eql(['validation_module_url_invalid'])
		})

		it('should fail validation if url is not a top level domain', async () => {
			params.url = 'http://localhost'
			const errors = await validator.check(params, ['url'])

			expect(errors.size).to.equal(1)
			expect(errors.fields['url']).to.eql(['validation_module_url_invalid'])
		})

		it('should fail validation if url is not present on VideoModule', async () => {
			params.type = 'video'
			delete params.url
			const errors = await validator.check(params, ['url'])

			expect(errors.size).to.equal(2)
			expect(errors.fields['url']).to.eql(['validation_module_url_invalid', 'validation_module_url_empty'])
		})

		it('should pass validation if url is present on VideoModule', async () => {
			params.type = 'video'
			const errors = await validator.check(params, ['url'])
			expect(errors.size).to.equal(0)
		})

		it('should fail validation if startPage is not present', async () => {
			params.type = 'elearning'
			delete params.startPage
			const errors = await validator.check(params, ['startPage'])

			expect(errors.size).to.equal(1)
			expect(errors.fields['startPage']).to.eql(['validation.module.startPage.empty'])
		})

		it('should pass validation if startPage is present', async () => {
			params.type = 'elearning'
			const errors = await validator.check(params, ['startPage'])
			expect(errors.size).to.equal(0)
		})

		it('should fail validation if fileSize is not present', async () => {
			params.type = 'file'
			delete params.fileSize
			const errors = await validator.check(params, ['fileSize'])

			expect(errors.size).to.equal(2)
			expect(errors.fields['fileSize']).to.eql([
				'validation_module_fileSize_positive',
				'validation_module_fileSize_empty',
			])
		})

		it('should fail validation if fileSize is not a positive number', async () => {
			params.type = 'file'
			params.fileSize = -99
			const errors = await validator.check(params, ['fileSize'])

			expect(errors.size).to.equal(1)
			expect(errors.fields['fileSize']).to.eql(['validation_module_fileSize_positive'])
		})

		it('should pass validation if fileSize is a positive number', async () => {
			params.type = 'file'
			const errors = await validator.check(params, ['fileSize'])
			expect(errors.size).to.equal(0)
		})

		it('should fail validation if productCode is not present', async () => {
			params.type = 'face-to-face'
			delete params.productCode
			const errors = await validator.check(params, ['productCode'])

			expect(errors.size).to.equal(1)
			expect(errors.fields['productCode']).to.eql(['validation.module.productCode.empty'])
		})

		it('should pass validation if productCode is present', async () => {
			params.type = 'face-to-face'
			const errors = await validator.check(params, ['productCode'])
			expect(errors.size).to.equal(0)
		})
	})

	describe('ValidateCourse all properties of ELearningModule', () => {
		it('should fail validation if title is not present', async () => {
			const params = {
				type: 'elearning',
				location: 'module location',
				description: 'module description',
				duration: 99,
				startPage: 'start-page',
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['title']).to.eql(['validation_module_title_empty'])
		})

		it('should fail validation if description is not present', async () => {
			const params = {
				type: 'elearning',
				title: 'module title',
				location: 'module location',
				duration: 99,
				startPage: 'start-page',
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['description']).to.eql(['validation_module_description_empty'])
		})

		it('should fail validation if duration is not present', async () => {
			const params = {
				type: 'elearning',
				title: 'module title',
				location: 'module location',
				description: 'module description',
				startPage: 'start-page',
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(2)
			expect(errors.fields['duration']).to.eql([
				'validation.module.duration.empty',
				'validation.module.duration.positive',
			])
		})

		it('should fail validation if duration is negative', async () => {
			const params = {
				type: 'elearning',
				title: 'module title',
				location: 'module location',
				description: 'module description',
				duration: -99,
				startPage: 'start-page',
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['duration']).to.eql(['validation.module.duration.positive'])
		})

		it('should fail validation if startPage is not present', async () => {
			const params = {
				type: 'elearning',
				title: 'module title',
				location: 'module location',
				description: 'module description',
				duration: 99,
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['startPage']).to.eql(['validation.module.startPage.empty'])
		})

		it('should pass validation if all properties are valid', async () => {
			const params = {
				type: 'elearning',
				title: 'module title',
				location: 'module location',
				description: 'module description',
				duration: 99,
				startPage: 'start-page',
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(0)
		})
	})

	describe('ValidateCourse all properties of FaceToFaceModule', () => {
		let params: any

		beforeEach(() => {
			params = {
				type: 'face-to-face',
				title: 'module title',
				description: 'module description',
				duration: 99,
				cost: 3.5,
				productCode: 'product code',
				events: [
					{
						dateRanges: [
							{
								date: moment()
									.add(1, 'd')
									.format('YYYY-MM-DD'),
								start: '09:00',
								end: '17:00',
							},
						],
						venue: {
							location: 'event location',
							capacity: 10,
							minCapacity: 5,
						},
					},
				],
			}
		})

		it('should fail validation if title is not present', async () => {
			delete params.title
			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['title']).to.eql(['validation_module_title_empty'])
		})

		it('should fail validation if productCode is not present', async () => {
			delete params.productCode
			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['productCode']).to.eql(['validation.module.productCode.empty'])
		})

		it('should fail validation if description is not present', async () => {
			delete params.description
			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['description']).to.eql(['validation_module_description_empty'])
		})

		it('should fail validation if duration is not present', async () => {
			delete params.duration
			const errors = await validator.check(params)
			expect(errors.size).to.equal(2)
			expect(errors.fields['duration']).to.eql([
				'validation.module.duration.empty',
				'validation.module.duration.positive',
			])
		})

		it('should fail validation if duration is negative', async () => {
			params.duration = -99
			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['duration']).to.eql(['validation.module.duration.positive'])
		})

		it('should fail validation if cost is negative', async () => {
			params.cost = -3.5
			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['cost']).to.eql(['module.validation.cost.positive'])
		})

		it('should pass validation if cost is undefined', async () => {
			params.cost = undefined
			const errors = await validator.check(params)
			expect(errors.size).to.equal(0)
		})

		it('should pass validation if all properties are valid', async () => {
			const errors = await validator.check(params)
			expect(errors.size).to.equal(0)
		})
	})

	describe('ValidateCourse all properties of FileModule', () => {
		it('should fail validation if title is not present', async () => {
			const params = {
				type: 'file',
				description: 'module description',
				duration: 99,
				fileSize: 102,
				mediaId: 'abc',
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['title']).to.eql(['validation_module_title_empty'])
		})

		it('should fail validation if description is not present', async () => {
			const params = {
				type: 'file',
				title: 'module title',
				duration: 99,
				mediaId: 'abc',
				fileSize: 102,
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['description']).to.eql(['validation_module_description_empty'])
		})

		it('should fail validation if duration is not present', async () => {
			const params = {
				type: 'file',
				title: 'module title',
				description: 'module description',
				fileSize: 102,
				mediaId: 'abc',
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(2)
			expect(errors.fields['duration']).to.eql([
				'validation.module.duration.empty',
				'validation.module.duration.positive',
			])
		})

		it('should fail validation if duration is negative', async () => {
			const params = {
				type: 'file',
				title: 'module title',
				description: 'module description',
				duration: -99,
				fileSize: 102,
				mediaId: 'abc',
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['duration']).to.eql(['validation.module.duration.positive'])
		})

		it('should fail validation if fileSize is not present', async () => {
			const params = {
				type: 'file',
				title: 'module title',
				description: 'module description',
				duration: 99,
				mediaId: 'abc',
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(2)
			expect(errors.fields['fileSize']).to.eql([
				'validation_module_fileSize_positive',
				'validation_module_fileSize_empty',
			])
		})

		it('should fail validation if fileSize is not a positive number', async () => {
			const params = {
				type: 'file',
				title: 'module title',
				description: 'module description',
				duration: 99,
				fileSize: -102,
				mediaId: 'abc',
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['fileSize']).to.eql(['validation_module_fileSize_positive'])
		})

		it('should pass validation if all properties are valid', async () => {
			const params = {
				type: 'file',
				title: 'module title',
				description: 'module description',
				duration: 99,
				fileSize: 102,
				mediaId: 'abc',
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(0)
		})
	})

	describe('ValidateCourse all properties of LinkModule', () => {
		it('should fail validation if title is not present', async () => {
			const params = {
				type: 'link',
				url: 'http://example.org',
				description: 'module description',
				duration: 99,
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['title']).to.eql(['validation_module_title_empty'])
		})

		it('should fail validation if url is not present', async () => {
			const params = {
				type: 'link',
				title: 'module title',
				description: 'module description',
				duration: 99,
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(2)
			expect(errors.fields['url']).to.eql(['validation_module_url_invalid', 'validation_module_blog_url_empty'])
		})

		it('should fail validation if url is not a tld', async () => {
			const params = {
				type: 'link',
				title: 'module title',
				description: 'module description',
				url: 'localhost',
				duration: 99,
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['url']).to.eql(['validation_module_url_invalid'])
		})

		it('should fail validation if description is not present', async () => {
			const params = {
				type: 'link',
				title: 'module title',
				url: 'http://example.org',
				duration: 99,
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['description']).to.eql(['validation_module_description_empty'])
		})

		it('should fail validation if duration is not present', async () => {
			const params = {
				type: 'link',
				title: 'module title',
				url: 'http://example.org',
				description: 'module description',
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(2)
			expect(errors.fields['duration']).to.eql([
				'validation.module.duration.empty',
				'validation.module.duration.positive',
			])
		})

		it('should fail validation if duration is negative', async () => {
			const params = {
				type: 'link',
				title: 'module title',
				url: 'http://example.org',
				description: 'module description',
				duration: -99,
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['duration']).to.eql(['validation.module.duration.positive'])
		})

		it('should pass validation if all properties are valid', async () => {
			const params = {
				type: 'link',
				title: 'module title',
				url: 'http://example.org',
				description: 'module description',
				duration: 99,
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(0)
		})
	})

	describe('ValidateCourse all properties of VideoModule', () => {
		let params: any

		beforeEach(() => {
			params = {
				type: 'video',
				title: 'module title',
				url: 'http://example.org',
				description: 'module description',
				duration: 99,
			}
		})

		it('should fail validation if title is not present', async () => {
			delete params.title
			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['title']).to.eql(['validation_module_title_empty'])
		})

		it('should fail validation if url is not present', async () => {
			delete params.url
			const errors = await validator.check(params)
			expect(errors.size).to.equal(2)
			expect(errors.fields['url']).to.eql(['validation_module_url_invalid', 'validation_module_url_empty'])
		})

		it('should fail validation if description is not present', async () => {
			delete params.description
			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['description']).to.eql(['validation_module_description_empty'])
		})

		it('should fail validation if duration is not present', async () => {
			delete params.duration
			const errors = await validator.check(params)
			expect(errors.size).to.equal(2)
			expect(errors.fields['duration']).to.eql([
				'validation.module.duration.empty',
				'validation.module.duration.positive',
			])
		})

		it('should fail validation if duration is negative', async () => {
			params.duration = -99
			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['duration']).to.eql(['validation.module.duration.positive'])
		})

		it('should pass validation if all properties are valid', async () => {
			const errors = await validator.check(params)
			expect(errors.size).to.equal(0)
		})
	})
})
