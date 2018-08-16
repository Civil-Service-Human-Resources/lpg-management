import {validate, ValidationError} from 'class-validator'
import {ValidationErrorMapper} from './validationErrorMapper'
import {TermsAndConditionsFactory} from '../model/factory/termsAndConditionsFactory'

/**
 * Validates property of TermsAndConditions.
 *
 * const TermsAndConditionsValidator = new TermsAndConditionsValidator()
 *
 * By default will validate all properties of a termsAndConditions:
 *
 * const errors = TermsAndConditionsValidator.check(termsAndConditions)
 *
 * Individual properties can also be checked by adding them as an array after the termsAndConditions:
 *
 * const errors = termsAndConditionsValidator.check(termsAndConditions, ['title'])
 *
 * Currently only the title and termsAndConditions are validated.
 *
 * Errors are returned in an object:
 *
 * errors = {
 *   size: 2,
 *   fields: {
 *     title: [
 *      'validation.termsAndConditions.title.empty',
 * 		
 *     ],
 *     termsAndConditions: [
 * 		'validation.termsAndConditions.termsAndConditions.empty',
* 		]
 *   }
 * }
 *
 * Example:
 *
 * const errors = termsAndConditionsValidator.check(course)
 *
 * if (errors.size()) {
 *   for (message in errors.fields.title) {
 *     console.log(message)
 *   }
 * }

 */

export class TermsAndConditionsValidator {
	private _validationErrorMapper: ValidationErrorMapper = new ValidationErrorMapper()
	private _termsAndConditionsFactory: TermsAndConditionsFactory = new TermsAndConditionsFactory()

	get validationErrorMapper(): ValidationErrorMapper {
		return this._validationErrorMapper
	}

	set validationErrorMapper(value: ValidationErrorMapper) {
		this._validationErrorMapper = value
	}

	get termsAndConditionsFactory(): TermsAndConditionsFactory {
		return this._termsAndConditionsFactory
	}

	set termsAndConditionsFactory(value: TermsAndConditionsFactory) {
		this._termsAndConditionsFactory = value
	}

	async check(params: any, groups: string[] = ['all']) {
		const validationErrors: ValidationError[] = await validate(this._termsAndConditionsFactory.create(params), {
			groups: groups,
		})

		return this._validationErrorMapper.map(validationErrors)
	}
}
