import {validate, ValidationError} from 'class-validator'
import {ValidationErrorMapper} from './validationErrorMapper'
import {CancellationPolicyFactory} from '../model/factory/cancellationPolicyFactory'

/**
 * Validates property of CancellationPolicy.
 *
 * const CancellationPolicyValidator = new CancellationPolicyValidator()
 *
 * By default will validate all properties of a cancellationPolicy:
 *
 * const errors = cancellationPolicyValidator.check(cancellationPolicy)
 *
 * Individual properties can also be checked by adding them as an array after the cancellationPolicy:
 *
 * const errors = cancellationPolicyValidator.check(cancellationPolicy, ['name'])
 *
 * Currently only the name, shortVersion and fullVersion are validated.
 *
 * Errors are returned in an object:
 *
 * errors = {
 *   size: 1,
 *   fields: {
 *     name: [
 *       'validation.learningProvider.name.empty'
 *     ]
 *    
 *   }
 * }
 *
 * Example:
 *
 * const errors = cancellationPolicyValidator.check(course)
 *
 * if (errors.size()) {
 *   for (message in errors.fields.name) {
 *     console.log(message)
 *   }
 * }

 */

export class CancellationPolicyValidator {
	private _validationErrorMapper: ValidationErrorMapper = new ValidationErrorMapper()
	private _cancellationPolicyFactory: CancellationPolicyFactory = new CancellationPolicyFactory()

	get validationErrorMapper(): ValidationErrorMapper {
		return this._validationErrorMapper
	}

	set validationErrorMapper(value: ValidationErrorMapper) {
		this._validationErrorMapper = value
	}

	get cancellationPolicyFactory(): CancellationPolicyFactory {
		return this._cancellationPolicyFactory
	}

	set cancellationPolicyFactory(value: CancellationPolicyFactory) {
		this._cancellationPolicyFactory = value
	}

	async check(params: any, groups: string[] = ['all']) {
		const validationErrors: ValidationError[] = await validate(this._cancellationPolicyFactory.create(params), {
			groups: groups,
		})

		return this._validationErrorMapper.map(validationErrors)
	}
}
