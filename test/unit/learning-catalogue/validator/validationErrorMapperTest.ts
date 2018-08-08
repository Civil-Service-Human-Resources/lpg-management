import {describe, it} from 'mocha'
import {ValidationError} from 'class-validator'
import {ValidationErrorMapper} from '../../../../src/learning-catalogue/validator/validationErrorMapper'
import {expect} from 'chai'

describe('ValidationErrorMapper tests', () => {
	const errorMapper = new ValidationErrorMapper()

	it('should reduce arrays of validation errors to object with fields and messages', () => {
		const validationErrors: ValidationError[] = [
			{
				target: {shortDescription: undefined, description: undefined},
				value: undefined,
				property: 'shortDescription',
				children: [],
				constraints: {
					length:
						'shortDescription must be longer than or equal to 0 characters',
					isNotEmpty: 'shortDescription should not be empty',
				},
			},
			{
				target: {shortDescription: undefined, description: undefined},
				value: undefined,
				property: 'description',
				children: [],
				constraints: {
					length:
						'description must be longer than or equal to 0 characters',
					isNotEmpty: 'description should not be empty',
				},
			},
		]

		const errors = errorMapper.map(validationErrors)

		expect(errors).to.eql({
			size: 4,
			fields: {
				shortDescription: [
					'shortDescription must be longer than or equal to 0 characters',
					'shortDescription should not be empty',
				],
				description: [
					'description must be longer than or equal to 0 characters',
					'description should not be empty',
				],
			},
		})
	})
})
