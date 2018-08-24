import {beforeEach, describe, it} from 'mocha'
import * as chai from 'chai'
import {expect} from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import * as moment from 'moment'
import {ModuleFactory} from '../../../../src/learning-catalogue/model/factory/moduleFactory'
import {ValidationErrorMapper} from '../../../../src/learning-catalogue/validator/validationErrorMapper'
import {Module} from '../../../../src/learning-catalogue/model/module'
import {Validator} from '../../../../src/learning-catalogue/validator/validator'
import {EventFactory} from '../../../../src/learning-catalogue/model/factory/eventFactory'
import {AudienceFactory} from '../../../../src/learning-catalogue/model/factory/audienceFactory'

chai.use(chaiAsPromised)

describe('ModuleValidator tests', () => {
	let validator: Validator<Module>
	let eventFactory: EventFactory
	let audienceFactory: AudienceFactory
	let moduleFactory: ModuleFactory

	beforeEach(() => {
		eventFactory = new EventFactory()
		audienceFactory = new AudienceFactory()
		moduleFactory = new ModuleFactory(audienceFactory, eventFactory)
		validator = new Validator<Module>(moduleFactory)
	})

	describe('Validate properties individually', async () => {
		it('should fail validation if title is not present', async () => {
			const params = {
				type: 'blog',
			}

			const errors = await validator.check(params, ['title'])

			expect(errors.size).to.equal(1)
			expect(errors.fields['title']).to.eql(['validation_module_title_empty'])
		})

		it('should pass validation if title is present', async () => {
			const params = {
				type: 'blog',
				title: 'title',
			}

			const errors = await validator.check(params, ['title'])
			expect(errors.size).to.equal(0)
		})

		it('should fail validation if description is not present', async () => {
			const params = {
				type: 'blog',
			}

			const errors = await validator.check(params, ['description'])

			expect(errors.size).to.equal(1)
			expect(errors.fields['description']).to.eql(['validation.module.description.empty'])
		})

		it('should pass validation if description is present', async () => {
			const params = {
				type: 'blog',
				description: 'description',
			}

			const errors = await validator.check(params, ['description'])
			expect(errors.size).to.equal(0)
		})

		it('should fail validation if duration is not present', async () => {
			const params = {
				type: 'blog',
			}

			const errors = await validator.check(params, ['duration'])

			expect(errors.size).to.equal(2)
			expect(errors.fields['duration']).to.eql([
				'validation.module.duration.positive',
				'validation.module.duration.empty',
			])
		})

		it('should fail validation if duration is not a positive number', async () => {
			const params = {
				type: 'blog',
				duration: -99,
			}

			const errors = await validator.check(params, ['duration'])

			expect(errors.size).to.equal(1)
			expect(errors.fields['duration']).to.eql(['validation.module.duration.positive'])
		})

		it('should pass validation if duration is a positive number', async () => {
			const params = {
				type: 'blog',
				duration: 99,
			}

			const errors = await validator.check(params, ['duration'])

			expect(errors.size).to.equal(0)
		})

		it('should pass validation if audience is not present', async () => {
			const params = {
				type: 'blog',
			}

			const errors = await validator.check(params, ['audiences'])

			expect(errors.size).to.equal(0)
		})

		it('should fail validation if audience present but audience areasOfWork is not', async () => {
			const params = {
				type: 'blog',
				audiences: [{}],
			}

			const errors = await validator.check(params, ['audiences', 'audience.areasOfWork'])

			expect(errors.size).to.equal(1)
			expect(errors.fields['areasOfWork']).to.eql(['validation.module.areasOfWork.empty'])
		})

		it('should fail validation if audience present but audience departments is not', async () => {
			const params = {
				type: 'blog',
				audiences: [{}],
			}

			const errors = await validator.check(params, ['audiences', 'audience.departments'])

			expect(errors.size).to.equal(1)
			expect(errors.fields['departments']).to.eql(['validation.module.departments.empty'])
		})

		it('should fail validation if audience present but audience grades is not', async () => {
			const params = {
				type: 'blog',
				audiences: [{}],
			}

			const errors = await validator.check(params, ['audiences', 'audience.grades'])

			expect(errors.size).to.equal(1)
			expect(errors.fields['grades']).to.eql(['validation.module.grades.empty'])
		})

		it('should fail validation if audience present but audience interests is not', async () => {
			const params = {
				type: 'blog',
				audiences: [{}],
			}

			const errors = await validator.check(params, ['audiences', 'audience.interests'])

			expect(errors.size).to.equal(1)
			expect(errors.fields['interests']).to.eql(['validation.module.interests.empty'])
		})

		it('should fail validation if audience present but audience mandatory is not', async () => {
			const params = {
				type: 'blog',
				audiences: [{}],
			}

			const errors = await validator.check(params, ['audiences', 'audience.mandatory'])

			expect(errors.size).to.equal(1)
			expect(errors.fields['mandatory']).to.eql(['validation.module.mandatory.empty'])
		})

		it('should fail validation if location is not present on LinkModule', async () => {
			const params = {
				type: 'blog',
			}

			const errors = await validator.check(params, ['location'])

			expect(errors.size).to.equal(1)
			expect(errors.fields['location']).to.eql(['validation.module.location.empty'])
		})

		it('should pass validation if location is present on LinkModule', async () => {
			const params = {
				type: 'blog',
				location: 'location',
			}

			const errors = await validator.check(params, ['location'])

			expect(errors.size).to.equal(0)
		})

		it('should fail validation if url is not present on VideoModule', async () => {
			const params = {
				type: 'video',
			}

			const errors = await validator.check(params, ['url'])

			expect(errors.size).to.equal(1)
			expect(errors.fields['url']).to.eql(['validation_module_url_empty'])
		})

		it('should pass validation if url is present on VideoModule', async () => {
			const params = {
				type: 'video',
				url: 'url',
			}

			const errors = await validator.check(params, ['url'])

			expect(errors.size).to.equal(0)
		})

		it('should fail validation if startPage is not present', async () => {
			const params = {
				type: 'elearning',
			}

			const errors = await validator.check(params, ['startPage'])

			expect(errors.size).to.equal(1)
			expect(errors.fields['startPage']).to.eql(['validation.module.startPage.empty'])
		})

		it('should pass validation if startPage is present', async () => {
			const params = {
				type: 'elearning',
				startPage: 'startPage',
			}

			const errors = await validator.check(params, ['startPage'])
			expect(errors.size).to.equal(0)
		})

		it('should fail validation if url is not present', async () => {
			const params = {
				type: 'file',
			}

			const errors = await validator.check(params, ['url'])

			expect(errors.size).to.equal(1)
			expect(errors.fields['url']).to.eql(['validation.module.url.empty'])
		})

		it('should pass validation if url is present', async () => {
			const params = {
				type: 'file',
				url: 'url',
			}

			const errors = await validator.check(params, ['url'])
			expect(errors.size).to.equal(0)
		})

		it('should fail validation if fileSize is not present', async () => {
			const params = {
				type: 'file',
			}

			const errors = await validator.check(params, ['fileSize'])

			expect(errors.size).to.equal(2)
			expect(errors.fields['fileSize']).to.eql([
				'validation.module.fileSize.positive',
				'validation.module.fileSize.empty',
			])
		})

		it('should fail validation if fileSize is not a positive number', async () => {
			const params = {
				type: 'file',
				fileSize: -99,
			}

			const errors = await validator.check(params, ['fileSize'])

			expect(errors.size).to.equal(1)
			expect(errors.fields['fileSize']).to.eql(['validation.module.fileSize.positive'])
		})

		it('should pass validation if fileSize is a positive number', async () => {
			const params = {
				type: 'file',
				fileSize: 100,
			}

			const errors = await validator.check(params, ['fileSize'])
			expect(errors.size).to.equal(0)
		})

		it('should fail validation if productCode is not present', async () => {
			const params = {
				type: 'face-to-face',
			}

			const errors = await validator.check(params, ['productCode'])

			expect(errors.size).to.equal(1)
			expect(errors.fields['productCode']).to.eql(['validation.module.productCode.empty'])
		})

		it('should pass validation if productCode is present', async () => {
			const params = {
				type: 'face-to-face',
				productCode: 'productCode',
			}

			const errors = await validator.check(params, ['productCode'])
			expect(errors.size).to.equal(0)
		})

		it('should fail validation if event date is not present', async () => {
			const params = {
				type: 'face-to-face',
				events: [{}],
			}

			const errors = await validator.check(params, ['events', 'event.date'])

			expect(errors.size).to.equal(2)
			expect(errors.fields['date']).to.eql([
				'validation.module.event.date.past',
				'validation.module.event.date.empty',
			])
		})

		it('should fail validation if event date is in the past', async () => {
			const params = {
				type: 'face-to-face',
				events: [
					{
						date: moment()
							.subtract(1, 'days')
							.toDate(),
					},
				],
			}

			const errors = await validator.check(params, ['events', 'event.date'])

			expect(errors.size).to.equal(1)
			expect(errors.fields['date']).to.eql(['validation.module.event.date.past'])
		})

		it('should pass validation if event date is in future', async () => {
			const params = {
				type: 'face-to-face',
				events: [
					{
						date: moment()
							.add(1, 'days')
							.toDate(),
					},
				],
			}

			const errors = await validator.check(params, ['events', 'event.date'])
			expect(errors.size).to.equal(0)
		})

		it('should fail validation if event location is not present', async () => {
			const params = {
				type: 'face-to-face',
				events: [{}],
			}

			const errors = await validator.check(params, ['events', 'event.location'])

			expect(errors.size).to.equal(1)
			expect(errors.fields['location']).to.eql(['validation.module.event.location.empty'])
		})

		it('should pass validation if event location is present', async () => {
			const params = {
				type: 'face-to-face',
				events: [
					{
						location: 'location',
					},
				],
			}

			const errors = await validator.check(params, ['events', 'event.location'])

			expect(errors.size).to.equal(0)
		})

		it('should fail validation if event capacity is not present', async () => {
			const params = {
				type: 'face-to-face',
				events: [{}],
			}

			const errors = await validator.check(params, ['events', 'event.capacity'])

			expect(errors.size).to.equal(2)
			expect(errors.fields['capacity']).to.eql([
				'validation.module.event.capacity.positive',
				'validation.module.event.capacity.empty',
			])
		})

		it('should fail validation if event capacity is negative', async () => {
			const params = {
				type: 'face-to-face',
				events: [
					{
						capacity: -99,
					},
				],
			}

			const errors = await validator.check(params, ['events', 'event.capacity'])

			expect(errors.size).to.equal(1)
			expect(errors.fields['capacity']).to.eql(['validation.module.event.capacity.positive'])
		})

		it('should pass validation if event capacity is a positive number', async () => {
			const params = {
				type: 'face-to-face',
				events: [
					{
						capacity: 99,
					},
				],
			}

			const errors = await validator.check(params, ['events', 'event.capacity'])

			expect(errors.size).to.equal(0)
		})
	})

	describe('Validate all properties of ELearningModule', () => {
		it('should fail validation if title is not present', async () => {
			const params = {
				type: 'elearning',
				location: 'module location',
				description: 'module description',
				duration: 99,
				startPage: 'start-page',
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: false,
					},
				],
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
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: false,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['description']).to.eql(['validation.module.description.empty'])
		})

		it('should fail validation if duration is not present', async () => {
			const params = {
				type: 'elearning',
				title: 'module title',
				location: 'module location',
				description: 'module description',
				startPage: 'start-page',
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: false,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(2)
			expect(errors.fields['duration']).to.eql([
				'validation.module.duration.positive',
				'validation.module.duration.empty',
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
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: false,
					},
				],
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
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: false,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['startPage']).to.eql(['validation.module.startPage.empty'])
		})

		it('should fail validation if audience areasOfWork is empty', async () => {
			const params = {
				type: 'elearning',
				title: 'module title',
				location: 'module location',
				description: 'module description',
				duration: 99,
				startPage: 'start-page',
				audiences: [
					{
						areasOfWork: [],
						departments: ['blah'],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: false,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['areasOfWork']).to.eql(['validation.module.areasOfWork.empty'])
		})

		it('should fail validation if audience departments is empty', async () => {
			const params = {
				type: 'elearning',
				title: 'module title',
				location: 'module location',
				description: 'module description',
				duration: 99,
				startPage: 'start-page',
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: [],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: false,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['departments']).to.eql(['validation.module.departments.empty'])
		})

		it('should fail validation if audience grades is empty', async () => {
			const params = {
				type: 'elearning',
				title: 'module title',
				location: 'module location',
				description: 'module description',
				duration: 99,
				startPage: 'start-page',
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: [],
						interests: ['blah'],
						mandatory: false,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['grades']).to.eql(['validation.module.grades.empty'])
		})

		it('should fail validation if audience interests is empty', async () => {
			const params = {
				type: 'elearning',
				title: 'module title',
				location: 'module location',
				description: 'module description',
				duration: 99,
				startPage: 'start-page',
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: ['blah'],
						interests: [],
						mandatory: false,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['interests']).to.eql(['validation.module.interests.empty'])
		})

		it('should fail validation if audience mandatory is missing', async () => {
			const params = {
				type: 'elearning',
				title: 'module title',
				location: 'module location',
				description: 'module description',
				duration: 99,
				startPage: 'start-page',
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: undefined,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['mandatory']).to.eql(['validation.module.mandatory.empty'])
		})

		it('should pass validation if all properties are valid', async () => {
			const params = {
				type: 'elearning',
				title: 'module title',
				location: 'module location',
				description: 'module description',
				duration: 99,
				startPage: 'start-page',
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: true,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(0)
		})
	})

	describe('Validate all properties of FaceToFaceModule', () => {
		it('should fail validation if title is not present', async () => {
			const params = {
				type: 'face-to-face',
				description: 'module description',
				duration: 99,
				productCode: 'product code',
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: false,
					},
				],
				events: [
					{
						date: moment()
							.add(1, 'days')
							.toDate(),
						location: 'event location',
						capacity: 100,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['title']).to.eql(['validation_module_title_empty'])
		})

		it('should fail validation if productCode is not present', async () => {
			const params = {
				type: 'face-to-face',
				title: 'module title',
				description: 'module description',
				duration: 99,
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: false,
					},
				],
				events: [
					{
						date: moment()
							.add(1, 'days')
							.toDate(),
						location: 'event location',
						capacity: 100,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['productCode']).to.eql(['validation.module.productCode.empty'])
		})

		it('should fail validation if description is not present', async () => {
			const params = {
				type: 'face-to-face',
				title: 'module title',
				duration: 99,
				productCode: 'product code',
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: false,
					},
				],
				events: [
					{
						date: moment()
							.add(1, 'days')
							.toDate(),
						location: 'event location',
						capacity: 100,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['description']).to.eql(['validation.module.description.empty'])
		})

		it('should fail validation if duration is not present', async () => {
			const params = {
				type: 'face-to-face',
				title: 'module title',
				description: 'module description',
				productCode: 'product code',
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: false,
					},
				],
				events: [
					{
						date: moment()
							.add(1, 'days')
							.toDate(),
						location: 'event location',
						capacity: 100,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(2)
			expect(errors.fields['duration']).to.eql([
				'validation.module.duration.positive',
				'validation.module.duration.empty',
			])
		})

		it('should fail validation if duration is negative', async () => {
			const params = {
				type: 'face-to-face',
				title: 'module title',
				description: 'module description',
				duration: -99,
				productCode: 'product code',
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: false,
					},
				],
				events: [
					{
						date: moment()
							.add(1, 'days')
							.toDate(),
						location: 'event location',
						capacity: 100,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['duration']).to.eql(['validation.module.duration.positive'])
		})

		it('should fail validation if audience areasOfWork is empty', async () => {
			const params = {
				type: 'face-to-face',
				title: 'module title',
				description: 'module description',
				duration: 99,
				productCode: 'product code',
				audiences: [
					{
						areasOfWork: [],
						departments: ['blah'],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: false,
					},
				],
				events: [
					{
						date: moment()
							.add(1, 'days')
							.toDate(),
						location: 'event location',
						capacity: 100,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['areasOfWork']).to.eql(['validation.module.areasOfWork.empty'])
		})

		it('should fail validation if audience departments is empty', async () => {
			const params = {
				type: 'face-to-face',
				title: 'module title',
				description: 'module description',
				duration: 99,
				productCode: 'product code',
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: [],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: false,
					},
				],
				events: [
					{
						date: moment()
							.add(1, 'days')
							.toDate(),
						location: 'event location',
						capacity: 100,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['departments']).to.eql(['validation.module.departments.empty'])
		})

		it('should fail validation if audience grades is empty', async () => {
			const params = {
				type: 'face-to-face',
				title: 'module title',
				description: 'module description',
				duration: 99,
				productCode: 'product code',
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: [],
						interests: ['blah'],
						mandatory: false,
					},
				],
				events: [
					{
						date: moment()
							.add(1, 'days')
							.toDate(),
						location: 'event location',
						capacity: 100,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['grades']).to.eql(['validation.module.grades.empty'])
		})

		it('should fail validation if audience interests is empty', async () => {
			const params = {
				type: 'face-to-face',
				title: 'module title',
				description: 'module description',
				duration: 99,
				productCode: 'product code',
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: ['blah'],
						interests: [],
						mandatory: false,
					},
				],
				events: [
					{
						date: moment()
							.add(1, 'days')
							.toDate(),
						location: 'event location',
						capacity: 100,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['interests']).to.eql(['validation.module.interests.empty'])
		})

		it('should fail validation if audience mandatory is missing', async () => {
			const params = {
				type: 'face-to-face',
				title: 'module title',
				description: 'module description',
				duration: 99,
				productCode: 'product code',
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: undefined,
					},
				],
				events: [
					{
						date: moment()
							.add(1, 'days')
							.toDate(),
						location: 'event location',
						capacity: 100,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['mandatory']).to.eql(['validation.module.mandatory.empty'])
		})

		it('should fail validation if event date missing', async () => {
			const params = {
				type: 'face-to-face',
				title: 'module title',
				description: 'module description',
				duration: 99,
				productCode: 'product code',
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: true,
					},
				],
				events: [
					{
						location: 'event location',
						capacity: 100,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(2)
			expect(errors.fields['date']).to.eql([
				'validation.module.event.date.past',
				'validation.module.event.date.empty',
			])
		})

		it('should fail validation if event location is missing', async () => {
			const params = {
				type: 'face-to-face',
				title: 'module title',
				description: 'module description',
				duration: 99,
				productCode: 'product code',
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: true,
					},
				],
				events: [
					{
						date: moment()
							.add(1, 'days')
							.toDate(),
						capacity: 100,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['location']).to.eql(['validation.module.event.location.empty'])
		})

		it('should fail validation if event capacity is missing', async () => {
			const params = {
				type: 'face-to-face',
				title: 'module title',
				description: 'module description',
				duration: 99,
				productCode: 'product code',
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: true,
					},
				],
				events: [
					{
						date: moment()
							.add(1, 'days')
							.toDate(),
						location: 'event location',
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(2)
			expect(errors.fields['capacity']).to.eql([
				'validation.module.event.capacity.positive',
				'validation.module.event.capacity.empty',
			])
		})

		it('should fail validation if event capacity is not a positive number', async () => {
			const params = {
				type: 'face-to-face',
				title: 'module title',
				description: 'module description',
				duration: 99,
				productCode: 'product code',
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: true,
					},
				],
				events: [
					{
						date: moment()
							.add(1, 'days')
							.toDate(),
						location: 'event location',
						capacity: -99,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['capacity']).to.eql(['validation.module.event.capacity.positive'])
		})

		it('should fail validation if event date is in the past', async () => {
			const params = {
				type: 'face-to-face',
				title: 'module title',
				description: 'module description',
				duration: 99,
				productCode: 'product code',
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: true,
					},
				],
				events: [
					{
						date: moment()
							.subtract(1, 'days')
							.toDate(),
						location: 'event location',
						capacity: 100,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['date']).to.eql(['validation.module.event.date.past'])
		})

		it('should pass validation if all properties are valid', async () => {
			const params = {
				type: 'face-to-face',
				title: 'module title',
				description: 'module description',
				duration: 99,
				productCode: 'product code',
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: true,
					},
				],
				events: [
					{
						date: moment()
							.add(1, 'days')
							.toDate(),
						location: 'event location',
						capacity: 100,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(0)
		})
	})

	describe('Validate all properties of FileModule', () => {
		it('should fail validation if title is not present', async () => {
			const params = {
				type: 'file',
				location: 'module location',
				description: 'module description',
				duration: 99,
				url: 'http://example.org',
				fileSize: 102,
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: false,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['title']).to.eql(['validation_module_title_empty'])
		})

		it('should fail validation if description is not present', async () => {
			const params = {
				type: 'file',
				title: 'module title',
				location: 'module location',
				duration: 99,
				url: 'http://example.org',
				fileSize: 102,
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: false,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['description']).to.eql(['validation.module.description.empty'])
		})

		it('should fail validation if duration is not present', async () => {
			const params = {
				type: 'file',
				title: 'module title',
				location: 'module location',
				description: 'module description',
				url: 'http://example.org',
				fileSize: 102,
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: false,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(2)
			expect(errors.fields['duration']).to.eql([
				'validation.module.duration.positive',
				'validation.module.duration.empty',
			])
		})

		it('should fail validation if duration is negative', async () => {
			const params = {
				type: 'file',
				title: 'module title',
				location: 'module location',
				description: 'module description',
				duration: -99,
				url: 'http://example.org',
				fileSize: 102,
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: false,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['duration']).to.eql(['validation.module.duration.positive'])
		})

		it('should fail validation if url is not present', async () => {
			const params = {
				type: 'file',
				title: 'module title',
				location: 'module location',
				description: 'module description',
				duration: 99,
				fileSize: 99,
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: false,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['url']).to.eql(['validation.module.url.empty'])
		})

		it('should pass validation if url is present', async () => {
			const params = {
				type: 'file',
				title: 'module title',
				location: 'module location',
				description: 'module description',
				duration: 99,
				fileSize: 99,
				url: 'http://example.org',
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: false,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(0)
		})

		it('should fail validation if fileSize is not present', async () => {
			const params = {
				type: 'file',
				title: 'module title',
				location: 'module location',
				description: 'module description',
				duration: 99,
				url: 'http://example.org',
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: false,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(2)
			expect(errors.fields['fileSize']).to.eql([
				'validation.module.fileSize.positive',
				'validation.module.fileSize.empty',
			])
		})

		it('should fail validation if fileSize is not a positive number', async () => {
			const params = {
				type: 'file',
				title: 'module title',
				location: 'module location',
				description: 'module description',
				duration: 99,
				url: 'http://example.org',
				fileSize: -102,
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: false,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['fileSize']).to.eql(['validation.module.fileSize.positive'])
		})

		it('should fail validation if audience areasOfWork is empty', async () => {
			const params = {
				type: 'file',
				title: 'module title',
				location: 'module location',
				description: 'module description',
				duration: 99,
				url: 'http://example.org',
				fileSize: 102,
				audiences: [
					{
						areasOfWork: [],
						departments: ['blah'],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: false,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['areasOfWork']).to.eql(['validation.module.areasOfWork.empty'])
		})

		it('should fail validation if audience departments is empty', async () => {
			const params = {
				type: 'file',
				title: 'module title',
				location: 'module location',
				description: 'module description',
				duration: 99,
				url: 'http://example.org',
				fileSize: 102,
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: [],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: false,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['departments']).to.eql(['validation.module.departments.empty'])
		})

		it('should fail validation if audience grades is empty', async () => {
			const params = {
				type: 'file',
				title: 'module title',
				location: 'module location',
				description: 'module description',
				duration: 99,
				url: 'http://example.org',
				fileSize: 102,
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: [],
						interests: ['blah'],
						mandatory: false,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['grades']).to.eql(['validation.module.grades.empty'])
		})

		it('should fail validation if audience interests is empty', async () => {
			const params = {
				type: 'file',
				title: 'module title',
				location: 'module location',
				description: 'module description',
				duration: 99,
				url: 'http://example.org',
				fileSize: 102,
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: ['blah'],
						interests: [],
						mandatory: false,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['interests']).to.eql(['validation.module.interests.empty'])
		})

		it('should fail validation if audience mandatory is missing', async () => {
			const params = {
				type: 'file',
				title: 'module title',
				location: 'module location',
				description: 'module description',
				duration: 99,
				url: 'http://example.org',
				fileSize: 102,
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: undefined,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['mandatory']).to.eql(['validation.module.mandatory.empty'])
		})

		it('should pass validation if all properties are valid', async () => {
			const params = {
				type: 'file',
				title: 'module title',
				location: 'module location',
				description: 'module description',
				duration: 99,
				url: 'http://example.org',
				fileSize: 102,
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: true,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(0)
		})
	})

	describe('Validate all properties of LinkModule', () => {
		it('should fail validation if title is not present', async () => {
			const params = {
				type: 'blog',
				location: 'module location',
				description: 'module description',
				duration: 99,
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: false,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['title']).to.eql(['validation_module_title_empty'])
		})

		it('should fail validation if location is not present', async () => {
			const params = {
				type: 'blog',
				title: 'module title',
				description: 'module description',
				duration: 99,
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: false,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['location']).to.eql(['validation.module.location.empty'])
		})

		it('should fail validation if description is not present', async () => {
			const params = {
				type: 'blog',
				title: 'module title',
				location: 'module location',
				duration: 99,
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: false,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['description']).to.eql(['validation.module.description.empty'])
		})

		it('should fail validation if duration is not present', async () => {
			const params = {
				type: 'blog',
				title: 'module title',
				location: 'module location',
				description: 'module description',
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: false,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(2)
			expect(errors.fields['duration']).to.eql([
				'validation.module.duration.positive',
				'validation.module.duration.empty',
			])
		})

		it('should fail validation if duration is negative', async () => {
			const params = {
				type: 'blog',
				title: 'module title',
				location: 'module location',
				description: 'module description',
				duration: -99,
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: false,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['duration']).to.eql(['validation.module.duration.positive'])
		})

		it('should fail validation if audience areasOfWork is empty', async () => {
			const params = {
				type: 'blog',
				title: 'module title',
				location: 'module location',
				description: 'module description',
				duration: 99,
				audiences: [
					{
						areasOfWork: [],
						departments: ['blah'],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: false,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['areasOfWork']).to.eql(['validation.module.areasOfWork.empty'])
		})

		it('should fail validation if audience departments is empty', async () => {
			const params = {
				type: 'blog',
				title: 'module title',
				location: 'module location',
				description: 'module description',
				duration: 99,
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: [],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: false,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['departments']).to.eql(['validation.module.departments.empty'])
		})

		it('should fail validation if audience grades is empty', async () => {
			const params = {
				type: 'blog',
				title: 'module title',
				location: 'module location',
				description: 'module description',
				duration: 99,
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: [],
						interests: ['blah'],
						mandatory: false,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['grades']).to.eql(['validation.module.grades.empty'])
		})

		it('should fail validation if audience interests is empty', async () => {
			const params = {
				type: 'blog',
				title: 'module title',
				location: 'module location',
				description: 'module description',
				duration: 99,
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: ['blah'],
						interests: [],
						mandatory: false,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['interests']).to.eql(['validation.module.interests.empty'])
		})

		it('should fail validation if audience mandatory is missing', async () => {
			const params = {
				type: 'blog',
				title: 'module title',
				location: 'module location',
				description: 'module description',
				duration: 99,
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: undefined,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['mandatory']).to.eql(['validation.module.mandatory.empty'])
		})

		it('should pass validation if all properties are valid', async () => {
			const params = {
				type: 'blog',
				title: 'module title',
				location: 'module location',
				description: 'module description',
				duration: 99,
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: true,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(0)
		})
	})

	describe('Validate all properties of VideoModule', () => {
		it('should fail validation if title is not present', async () => {
			const params = {
				type: 'video',
				url: 'module url',
				description: 'module description',
				duration: 99,
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: false,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['title']).to.eql(['validation_module_title_empty'])
		})

		it('should fail validation if url is not present', async () => {
			const params = {
				type: 'video',
				title: 'module title',
				description: 'module description',
				duration: 99,
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: false,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['url']).to.eql(['validation_module_url_empty'])
		})

		it('should fail validation if description is not present', async () => {
			const params = {
				type: 'video',
				title: 'module title',
				url: 'module url',
				duration: 99,
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: false,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['description']).to.eql(['validation.module.description.empty'])
		})

		it('should fail validation if duration is not present', async () => {
			const params = {
				type: 'video',
				title: 'module title',
				url: 'module url',
				description: 'module description',
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: false,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(2)
			expect(errors.fields['duration']).to.eql([
				'validation.module.duration.positive',
				'validation.module.duration.empty',
			])
		})

		it('should fail validation if duration is negative', async () => {
			const params = {
				type: 'video',
				title: 'module title',
				url: 'module url',
				description: 'module description',
				duration: -99,
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: false,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['duration']).to.eql(['validation.module.duration.positive'])
		})

		it('should fail validation if audience areasOfWork is empty', async () => {
			const params = {
				type: 'video',
				title: 'module title',
				url: 'module url',
				description: 'module description',
				duration: 99,
				audiences: [
					{
						areasOfWork: [],
						departments: ['blah'],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: false,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['areasOfWork']).to.eql(['validation.module.areasOfWork.empty'])
		})

		it('should fail validation if audience departments is empty', async () => {
			const params = {
				type: 'video',
				title: 'module title',
				url: 'module url',
				description: 'module description',
				duration: 99,
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: [],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: false,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['departments']).to.eql(['validation.module.departments.empty'])
		})

		it('should fail validation if audience grades is empty', async () => {
			const params = {
				type: 'video',
				title: 'module title',
				url: 'module url',
				description: 'module description',
				duration: 99,
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: [],
						interests: ['blah'],
						mandatory: false,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['grades']).to.eql(['validation.module.grades.empty'])
		})

		it('should fail validation if audience interests is empty', async () => {
			const params = {
				type: 'video',
				title: 'module title',
				url: 'module url',
				description: 'module description',
				duration: 99,
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: ['blah'],
						interests: [],
						mandatory: false,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['interests']).to.eql(['validation.module.interests.empty'])
		})

		it('should fail validation if audience mandatory is missing', async () => {
			const params = {
				type: 'video',
				title: 'module title',
				url: 'module url',
				description: 'module description',
				duration: 99,
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: undefined,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(1)
			expect(errors.fields['mandatory']).to.eql(['validation.module.mandatory.empty'])
		})

		it('should pass validation if all properties are valid', async () => {
			const params = {
				type: 'video',
				title: 'module title',
				url: 'module url',
				description: 'module description',
				duration: 99,
				audiences: [
					{
						areasOfWork: ['blah'],
						departments: ['blah'],
						grades: ['blah'],
						interests: ['blah'],
						mandatory: true,
					},
				],
			}

			const errors = await validator.check(params)
			expect(errors.size).to.equal(0)
		})
	})

	describe('Setters and Getters', () => {
		it('should be able to set error mapper', () => {
			const errorMapper = <ValidationErrorMapper>{}
			validator.validationErrorMapper = errorMapper
			expect(validator.validationErrorMapper).to.eql(errorMapper)
		})

		it('should be able to set module factory', () => {
			const moduleFactory = <ModuleFactory>{}
			validator.moduleFactory = moduleFactory
			expect(validator.moduleFactory).to.eql(moduleFactory)
		})
	})
})
