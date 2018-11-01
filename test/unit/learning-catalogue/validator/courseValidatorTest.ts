import {beforeEach, describe, it} from 'mocha'
import {Validator} from '../../../../src/learning-catalogue/validator/validator'
import {expect} from 'chai'
import {CourseFactory} from '../../../../src/learning-catalogue/model/factory/courseFactory'
import {Course} from '../../../../src/learning-catalogue/model/course'

describe('CourseValidator tests', () => {
	let validator: Validator<Course>

	beforeEach(() => {
		validator = new Validator<Course>(new CourseFactory())
	})

	describe('Validating title only...', () => {
		it('should pass validation if title is set and is the only property', async () => {
			const errors = await validator.check(
				{
					title: 'Course Title',
				},
				['title']
			)

			expect(errors.size).to.equal(0)
		})

		it('should fail validation if title is present but is undefined', async () => {
			const errors = await validator.check(
				{
					title: undefined,
				},
				['title']
			)

			expect(errors.size).to.equal(1)
			expect(errors.fields.title).to.eql(['course.validation.title.empty'])
		})

		it('should fail validation if title is present but is an empty string', async () => {
			const errors = await validator.check(
				{
					title: '',
				},
				['title']
			)

			expect(errors.size).to.equal(1)
			expect(errors.fields.title).to.eql(['course.validation.title.empty'])
		})
	})

	describe('Validating shortDescription only...', () => {
		it('should fail validation if shortDescription is missing', async () => {
			const params = {}

			const errors = await validator.check(params, ['shortDescription'])

			expect(errors.size).to.equal(2)
			expect(errors.fields.shortDescription).to.eql([
				'course.validation.shortDescription.maxLength',
				'course.validation.shortDescription.empty',
			])
		})

		it('should fail validation if shortDescription is greater than 160 characters', async () => {
			const params = {
				shortDescription: 'x'.repeat(161),
			}

			const errors = await validator.check(params, ['shortDescription'])

			expect(errors.size).to.equal(1)
			expect(errors.fields.shortDescription).to.eql(['course.validation.shortDescription.maxLength'])
		})

		it('should pass validation if shortDescription is 160 characters or less', async () => {
			const params = {
				shortDescription: 'x'.repeat(160),
			}

			const errors = await validator.check(params, ['shortDescription'])

			expect(errors.size).to.equal(0)
		})

		it('should pass validation if shortDescription is present', async () => {
			const params = {
				shortDescription: 'Course short description',
			}

			const errors = await validator.check(params, ['shortDescription'])

			expect(errors.size).to.equal(0)
		})
	})

	describe('Validating description only...', () => {
		it('should fail validation if description is missing', async () => {
			const params = {}

			const errors = await validator.check(params, ['description'])

			expect(errors.size).to.equal(2)
			expect(errors.fields.description).to.eql([
				'course.validation.description.maxLength',
				'course.validation.description.empty',
			])
		})

		it('should fail validation if description is empy string', async () => {
			const params = {
				description: '',
			}

			const errors = await validator.check(params, ['description'])

			expect(errors.size).to.equal(1)
			expect(errors.fields.description).to.eql(['course.validation.description.empty'])
		})

		it('should fail validation if description is greater than 1500 characters', async () => {
			const params = {
				description: 'x'.repeat(1501),
			}

			const errors = await validator.check(params, ['description'])

			expect(errors.size).to.equal(1)
			expect(errors.fields.description).to.eql(['course.validation.description.maxLength'])
		})

		it('should pass validation if description is 1500 characters or less', async () => {
			const params = {
				description: 'x'.repeat(1500),
			}

			const errors = await validator.check(params, ['description'])

			expect(errors.size).to.equal(0)
		})

		it('should pass validation if description is present', async () => {
			const params = {
				description: 'Course description',
			}

			const errors = await validator.check(params, ['description'])

			expect(errors.size).to.equal(0)
		})
	})

	describe('Validating all course properties', () => {
		it('should fail validation if title is present but is undefined', async () => {
			const errors = await validator.check({
				title: undefined,
				description: 'Course description',
				shortDescription: 'Course short description',
				status: 'Draft',
			})

			expect(errors.size).to.equal(1)
			expect(errors.fields.title).to.eql(['course.validation.title.empty'])
		})

		it('should fail validation if title is present but is an empty string', async () => {
			const errors = await validator.check({
				title: '',
				description: 'Course description',
				shortDescription: 'Course short description',
				status: 'Draft',
			})

			expect(errors.size).to.equal(1)
			expect(errors.fields.title).to.eql(['course.validation.title.empty'])
		})

		it('should fail validation if title, shortDescription, description and status are missing', async () => {
			const params = {
				status: null,
			}

			const errors = await validator.check(params)

			expect(errors.size).to.equal(6)
			expect(errors.fields.shortDescription).to.eql([
				'course.validation.shortDescription.maxLength',
				'course.validation.shortDescription.empty',
			])
			expect(errors.fields.description).to.eql([
				'course.validation.description.maxLength',
				'course.validation.description.empty',
			])
			expect(errors.fields.title).to.eql(['course.validation.title.empty'])
		})

		it('should fail validation if shortDescription is greater than 160 characters', async () => {
			const params = {
				title: 'Course Title',
				description: 'Course description',
				shortDescription: 'x'.repeat(161),
				status: 'Draft',
			}

			const errors = await validator.check(params)

			expect(errors.size).to.equal(1)
			expect(errors.fields.shortDescription).to.eql(['course.validation.shortDescription.maxLength'])
		})

		it('should pass validation if shortDescription is 160 characters or less', async () => {
			const params = {
				title: 'Course Title',
				description: 'Course description',
				shortDescription: 'x'.repeat(160),
				status: 'Draft',
			}

			const errors = await validator.check(params)

			expect(errors.size).to.equal(0)
		})

		it('should fail validation if description is greater than 1500 characters', async () => {
			const params = {
				title: 'Course Title',
				description: 'x'.repeat(1501),
				shortDescription: 'Course short description',
				status: 'Draft',
			}

			const errors = await validator.check(params)

			expect(errors.size).to.equal(1)
			expect(errors.fields.description).to.eql(['course.validation.description.maxLength'])
		})

		it('should pass validation if description is 1500 characters or less', async () => {
			const params = {
				title: 'Course Title',
				description: 'x'.repeat(1500),
				shortDescription: 'Course short description',
				status: 'Draft',
			}

			const errors = await validator.check(params)

			expect(errors.size).to.equal(0)
		})

		it('should fail validation if description is missing', async () => {
			const params = {
				title: 'Course Title',
				shortDescription: 'Course short description',
				description: '',
				status: 'Draft',
			}

			const errors = await validator.check(params)

			expect(errors.size).to.equal(1)
			expect(errors.fields.description).to.eql(['course.validation.description.empty'])
		})

		it('should pass validation if description and shortDescription are present', async () => {
			const params = {
				title: 'Course Title',
				description: 'Course description',
				shortDescription: 'Course short description',
				status: 'Draft',
			}

			const errors = await validator.check(params)

			expect(errors.size).to.equal(0)
		})
	})

	describe('Validating all course properties specified', () => {
		it('should fail validation if title is present but is undefined', async () => {
			const errors = await validator.check(
				{
					title: undefined,
					description: 'Course description',
					shortDescription: 'Course short description',
				},
				['title', 'shortDescription', 'description']
			)

			expect(errors.size).to.equal(1)
			expect(errors.fields.title).to.eql(['course.validation.title.empty'])
		})

		it('should fail validation if title is present but is an empty string', async () => {
			const errors = await validator.check(
				{
					title: '',
					description: 'Course description',
					shortDescription: 'Course short description',
				},
				['title', 'shortDescription', 'description']
			)

			expect(errors.size).to.equal(1)
			expect(errors.fields.title).to.eql(['course.validation.title.empty'])
		})

		it('should fail validation if title, shortDescription and description are missing', async () => {
			const params = {}

			const errors = await validator.check(params, ['title', 'shortDescription', 'description'])

			expect(errors.size).to.equal(5)
			expect(errors.fields.shortDescription).to.eql([
				'course.validation.shortDescription.maxLength',
				'course.validation.shortDescription.empty',
			])
			expect(errors.fields.description).to.eql([
				'course.validation.description.maxLength',
				'course.validation.description.empty',
			])
			expect(errors.fields.title).to.eql(['course.validation.title.empty'])
		})

		it('should fail validation if shortDescription is greater than 160 characters', async () => {
			const params = {
				title: 'Course Title',
				description: 'Course description',
				shortDescription: 'x'.repeat(161),
			}

			const errors = await validator.check(params, ['title', 'shortDescription', 'description'])

			expect(errors.size).to.equal(1)
			expect(errors.fields.shortDescription).to.eql(['course.validation.shortDescription.maxLength'])
		})

		it('should pass validation if shortDescription is 160 characters or less', async () => {
			const params = {
				title: 'Course Title',
				description: 'Course description',
				shortDescription: 'x'.repeat(160),
			}

			const errors = await validator.check(params, ['title', 'shortDescription', 'description'])

			expect(errors.size).to.equal(0)
		})

		it('should fail validation if description is greater than 1500 characters', async () => {
			const params = {
				title: 'Course Title',
				description: 'x'.repeat(1501),
				shortDescription: 'Course short description',
			}

			const errors = await validator.check(params, ['title', 'shortDescription', 'description'])

			expect(errors.size).to.equal(1)
			expect(errors.fields.description).to.eql(['course.validation.description.maxLength'])
		})

		it('should pass validation if description is 1500 characters or less', async () => {
			const params = {
				title: 'Course Title',
				description: 'x'.repeat(1500),
				shortDescription: 'Course short description',
			}

			const errors = await validator.check(params, ['title', 'shortDescription', 'description'])

			expect(errors.size).to.equal(0)
		})

		it('should fail validation if description is missing', async () => {
			const params = {
				title: 'Course Title',
				shortDescription: 'Course short description',
				description: '',
			}

			const errors = await validator.check(params, ['title', 'shortDescription', 'description'])

			expect(errors.size).to.equal(1)
			expect(errors.fields.description).to.eql(['course.validation.description.empty'])
		})

		it('should pass validation if description and shortDescription are present', async () => {
			const params = {
				title: 'Course Title',
				description: 'Course description',
				shortDescription: 'Course short description',
			}

			const errors = await validator.check(params, ['title', 'shortDescription', 'description'])

			expect(errors.size).to.equal(0)
		})

		describe('validate status', () => {
			it('should pass validation with "Draft" status', async () => {
				const params = {
					status: 'Draft',
				}

				const errors = await validator.check(params, ['status'])
				expect(errors.size).to.equal(0)
			})

			it('should pass validation with "Published" status', async () => {
				const params = {
					status: 'Published',
				}

				const errors = await validator.check(params, ['status'])
				expect(errors.size).to.equal(0)
			})

			it('should pass validation with "Archived" status', async () => {
				const params = {
					status: 'Archived',
				}

				const errors = await validator.check(params, ['status'])
				expect(errors.size).to.equal(0)
			})

			it('should fail validation with null status', async () => {
				const params = {
					status: null,
				}

				const errors = await validator.check(params, ['status'])
				expect(errors.size).to.equal(1)
				expect(errors.fields).to.eql({
					status: ['course.validation.status.invalid'],
				})
			})

			it('should fail validation with invalid status', async () => {
				const params = {
					status: 'Not a status',
				}

				const errors = await validator.check(params, ['status'])
				expect(errors.size).to.equal(1)
				expect(errors.fields).to.eql({
					status: ['course.validation.status.invalid'],
				})
			})
		})
	})
})
