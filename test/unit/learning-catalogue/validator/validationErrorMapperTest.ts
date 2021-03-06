import {describe, it} from 'mocha'
import {ValidationError} from 'class-validator'
import {expect} from 'chai'
import {ValidationErrorMapper} from '../../../../src/learning-catalogue/validator/validationErrorMapper'

describe('ValidationErrorMapper tests', () => {
	it('should reduce arrays of validation errors to object with fields and messages', () => {
		const validationErrors: ValidationError[] = [
			{
				target: {shortDescription: undefined, description: undefined},
				value: undefined,
				property: 'shortDescription',
				children: [],
				constraints: {
					length: 'shortDescription must be longer than or equal to 0 characters',
					isNotEmpty: 'shortDescription should not be empty',
				},
			},
			{
				target: {shortDescription: undefined, description: undefined},
				value: undefined,
				property: 'description',
				children: [],
				constraints: {
					length: 'description must be longer than or equal to 0 characters',
					isNotEmpty: 'description should not be empty',
				},
			},
		]

		const errors = ValidationErrorMapper.map(validationErrors)

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
