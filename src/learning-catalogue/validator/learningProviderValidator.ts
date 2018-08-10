import {validate, ValidationError} from 'class-validator'
import {ValidationErrorMapper} from './validationErrorMapper'
import {LearningProviderFactory} from '../model/factory/learningProviderFactory'

/**
 * Validates property of LearningProvider.
 *
 * const learningProviderValidator = new learningProviderValidator()
 *
 * By default will validate all properties of a learningProvider:
 *
 * const errors = learningProviderValidator.check(learningProvider)
 *
 * Individual properties can also be checked by adding them as an array after the learningProvider:
 *
 * const errors = learningProviderValidator.check(learningProvider, ['name'])
 *
 * Currently only the name is validated.
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
 * const errors = learningProviderValidator.check(course)
 *
 * if (errors.size()) {
 *   for (message in errors.fields.name) {
 *     console.log(message)
 *   }
 * }

 */

export class LearningProviderValidator {
	private _validationErrorMapper: ValidationErrorMapper = new ValidationErrorMapper()
	private _learningProviderFactory: LearningProviderFactory = new LearningProviderFactory()

	get validationErrorMapper(): ValidationErrorMapper {
		return this._validationErrorMapper
	}

	set validationErrorMapper(value: ValidationErrorMapper) {
		this._validationErrorMapper = value
	}

	get learningProviderFactory(): LearningProviderFactory {
		return this._learningProviderFactory
	}

	set learningProviderFactory(value: LearningProviderFactory) {
		this._learningProviderFactory = value
	}

	async check(params: any, groups: string[] = ['all']) {
		const validationErrors: ValidationError[] = await validate(this._learningProviderFactory.create(params), {
			groups: groups,
		})

		return this._validationErrorMapper.map(validationErrors)
	}
}
